package app_test

import (
	"encoding/binary"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"cosmossdk.io/math"
	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	simtestutil "github.com/cosmos/cosmos-sdk/testutil/sims"
	sdk "github.com/cosmos/cosmos-sdk/types"
	querytypes "github.com/cosmos/cosmos-sdk/types/query"
	authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
	stakingkeeper "github.com/cosmos/cosmos-sdk/x/staking/keeper"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"
	"github.com/cosmos/gogoproto/proto"
	"github.com/stretchr/testify/require"
	"structs/app/ante"
	keeperlib "structs/x/structs/keeper"
	"structs/x/structs/types"
)

// These are real signed transactions through the pinned release's ante chain,
// message cache and native staking hooks. Counts bound the client request, not
// every possible account/chain state; every real request still needs simulation.
func TestClientReactorBatch(t *testing.T) {
	for _, count := range []int{1, 4, 8, 16} {
		for _, failLast := range []bool{false, true} {
			t.Run(fmt.Sprintf("legs_%d_failLast_%t", count, failLast), func(t *testing.T) {
				bApp, ctx := setupJailGateApp(t)
				key := secp256k1.GenPrivKey()
				signer := sdk.AccAddress(key.PubKey().Address())
				player := appendAppPlayer(t, bApp.StructsKeeper, ctx, signer)
				// The signing key's own bit is sufficient for every subject address;
				// no retained delegator has to sign this atomic withdrawal.
				bApp.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(signer.String()), types.PermTokenDefuse)
				vaults, err := bApp.StructsKeeper.NewCurrentContext(ctx).EnsureVaults(player.Id)
				require.NoError(t, err)
				validators, err := bApp.StakingKeeper.GetLastValidators(ctx)
				require.NoError(t, err)
				validator, err := sdk.ValAddressFromBech32(validators[0].OperatorAddress)
				require.NoError(t, err)
				denom, err := bApp.StakingKeeper.BondDenom(ctx)
				require.NoError(t, err)
				server := stakingkeeper.NewMsgServerImpl(bApp.StakingKeeper)
				reactorId := jailGateReactorId(t, bApp, ctx, validator)
				addresses := []sdk.AccAddress{vaults[0]}
				for i := 1; i < count; i++ {
					address := make([]byte, 20)
					address[0] = 0x7c
					binary.BigEndian.PutUint64(address[12:], uint64(i))
					require.NoError(t, bApp.StructsKeeper.SetPlayerIndexForAddress(ctx, sdk.AccAddress(address).String(), player.Index))
					addresses = append(addresses, sdk.AccAddress(address))
				}
				var messages []sdk.Msg
				before := make([]stakingtypes.Delegation, count)
				infusionsBefore := make([]types.Infusion, count)
				for i, address := range addresses {
					delegate(t, bApp, ctx, server, denom, address, validator, math.NewInt(2_000_000))
					before[i], err = bApp.StakingKeeper.GetDelegation(ctx, address, validator)
					require.NoError(t, err)
					var found bool
					infusionsBefore[i], found = bApp.StructsKeeper.GetInfusion(ctx, reactorId, address.String())
					require.True(t, found)
					message := &types.MsgReactorDefuse{Creator: signer.String(), DelegatorAddress: address.String(),
						ValidatorAddress: validator.String(), Amount: sdk.NewInt64Coin(denom, 1_000_000)}
					if i == 0 {
						message.OwnerId = player.Id
						message.DelegatorAddress = ""
					}
					messages = append(messages, message)
				}
				if failLast {
					maximum, err := bApp.StakingKeeper.MaxEntries(ctx)
					require.NoError(t, err)
					for i := uint32(0); i < maximum; i++ {
						_, err = bApp.StakingKeeper.SetUnbondingDelegationEntry(ctx, addresses[count-1], validator, int64(i+1),
							ctx.BlockTime().Add(time.Duration(i+1)*time.Hour), math.ZeroInt())
						require.NoError(t, err)
					}
				}
				account := bApp.AccountKeeper.GetAccount(ctx, signer)
				capacityBefore := bApp.StructsKeeper.NewCurrentContext(ctx).GetPlayer(player.Id).GetCapacity()
				config := authtx.NewTxConfig(bApp.AppCodec(), authtx.DefaultSignModes)
				tx, err := simtestutil.GenSignedMockTx(rand.New(rand.NewSource(1)), config, messages, sdk.Coins{sdk.NewInt64Coin("ualpha", 0)},
					ante.DefaultFreeGasCap, jailGateChainID, []uint64{account.GetAccountNumber()}, []uint64{account.GetSequence()}, key)
				require.NoError(t, err)
				wire, err := config.TxEncoder()(tx)
				require.NoError(t, err)
				block, err := bApp.FinalizeBlock(&abci.RequestFinalizeBlock{Height: 1, Time: ctx.BlockTime(), Txs: [][]byte{wire}})
				require.NoError(t, err)
				require.Len(t, block.TxResults, 1)
				result := block.TxResults[0]
				t.Logf("legs=%d fail_last=%t bytes=%d gas=%d code=%d cap=%d", count, failLast, len(wire), result.GasUsed, result.Code, ante.DefaultFreeGasCap)
				final := bApp.NewContext(false).WithBlockTime(ctx.BlockTime())
				if failLast {
					require.NotZero(t, result.Code)
					require.Contains(t, result.Log, fmt.Sprintf("message index: %d", count-1))
					require.Contains(t, result.Log, "unbonding delegation")
					for i, address := range addresses {
						actual, err := bApp.StakingKeeper.GetDelegation(final, address, validator)
						require.NoError(t, err)
						require.Equal(t, before[i], actual, "last-leg rejection rolls back every earlier withdrawal")
						infusion, found := bApp.StructsKeeper.GetInfusion(final, reactorId, address.String())
						require.True(t, found)
						require.Equal(t, infusionsBefore[i], infusion, "native hook effects roll back with the group")
						if i < count-1 {
							_, err = bApp.StakingKeeper.GetUnbondingDelegation(final, address, validator)
							require.Error(t, err, "failed transaction cannot create an earlier pending leg")
						}
					}
					require.Equal(t, capacityBefore, bApp.StructsKeeper.NewCurrentContext(final).GetPlayer(player.Id).GetCapacity())
					for _, event := range result.Events {
						require.NotEqual(t, stakingtypes.EventTypeUnbond, event.Type)
					}
				} else {
					require.Zero(t, result.Code, result.Log)
					require.Less(t, result.GasUsed, int64(ante.DefaultFreeGasCap))
					for _, address := range addresses {
						pending, err := bApp.StakingKeeper.GetUnbondingDelegation(final, address, validator)
						require.NoError(t, err)
						require.Len(t, pending.Entries, 1)
						require.Equal(t, int64(1_000_000), pending.Entries[0].Balance.Int64())
					}
				}
			})
		}
	}
}

// A Coin request is converted to shares and back by native staking. The client
// must not synthesize a cooldown change by subtracting its requested amount.
func TestClientReactorBatchFractionalShares(t *testing.T) {
	for _, useNativeBalance := range []bool{false, true} {
		t.Run(fmt.Sprintf("native_balance_%t", useNativeBalance), func(t *testing.T) {
			bApp, ctx := setupJailGateApp(t)
			key := secp256k1.GenPrivKey()
			signer := sdk.AccAddress(key.PubKey().Address())
			player := appendAppPlayer(t, bApp.StructsKeeper, ctx, signer)
			bApp.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(signer.String()), types.PermTokenDefuse)
			vaults, err := bApp.StructsKeeper.NewCurrentContext(ctx).EnsureVaults(player.Id)
			require.NoError(t, err)
			validators, err := bApp.StakingKeeper.GetLastValidators(ctx)
			require.NoError(t, err)
			validator, err := sdk.ValAddressFromBech32(validators[0].OperatorAddress)
			require.NoError(t, err)
			denom, err := bApp.StakingKeeper.BondDenom(ctx)
			require.NoError(t, err)
			server := stakingkeeper.NewMsgServerImpl(bApp.StakingKeeper)
			addresses := []sdk.AccAddress{vaults[0], signer}
			for _, address := range addresses {
				delegate(t, bApp, ctx, server, denom, address, validator, math.NewInt(2_000_000))
			}
			val, err := bApp.StakingKeeper.GetValidator(ctx, validator)
			require.NoError(t, err)
			consensus, err := val.GetConsAddr()
			require.NoError(t, err)
			_, err = bApp.StakingKeeper.Slash(ctx, consensus, ctx.BlockHeight(), val.ConsensusPower(bApp.StakingKeeper.PowerReduction(ctx)), math.LegacyNewDecWithPrec(123456789, 9))
			require.NoError(t, err)
			query := stakingkeeper.Querier{Keeper: bApp.StakingKeeper}
			var messages []sdk.Msg
			requested := make([]math.Int, len(addresses))
			for i, address := range addresses {
				response, err := query.DelegatorDelegations(ctx, &stakingtypes.QueryDelegatorDelegationsRequest{
					DelegatorAddr: address.String(), Pagination: &querytypes.PageRequest{Limit: 100}})
				require.NoError(t, err)
				require.NotNil(t, response.Pagination)
				require.Empty(t, response.Pagination.NextKey)
				require.Len(t, response.DelegationResponses, 1)
				row := response.DelegationResponses[0]
				require.True(t, row.Delegation.Shares.IsPositive())
				require.Equal(t, int64(1_753_086), row.Balance.Amount.Int64())
				requested[i] = math.NewInt(1_000_000)
				if useNativeBalance {
					requested[i] = row.Balance.Amount
				}
				message := &types.MsgReactorDefuse{Creator: signer.String(), DelegatorAddress: address.String(),
					ValidatorAddress: validator.String(), Amount: sdk.NewCoin(denom, requested[i])}
				if i == 0 {
					message.OwnerId = player.Id
					message.DelegatorAddress = ""
				}
				messages = append(messages, message)
			}
			account := bApp.AccountKeeper.GetAccount(ctx, signer)
			config := authtx.NewTxConfig(bApp.AppCodec(), authtx.DefaultSignModes)
			tx, err := simtestutil.GenSignedMockTx(rand.New(rand.NewSource(1)), config, messages, sdk.Coins{sdk.NewInt64Coin("ualpha", 0)},
				ante.DefaultFreeGasCap, jailGateChainID, []uint64{account.GetAccountNumber()}, []uint64{account.GetSequence()}, key)
			require.NoError(t, err)
			wire, err := config.TxEncoder()(tx)
			require.NoError(t, err)
			block, err := bApp.FinalizeBlock(&abci.RequestFinalizeBlock{Height: 1, Time: ctx.BlockTime(), Txs: [][]byte{wire}})
			require.NoError(t, err)
			require.Zero(t, block.TxResults[0].Code, block.TxResults[0].Log)
			var result sdk.TxMsgData
			require.NoError(t, proto.Unmarshal(block.TxResults[0].Data, &result))
			require.Len(t, result.MsgResponses, len(addresses))
			final := bApp.NewContext(false).WithBlockTime(ctx.BlockTime())
			for i, address := range addresses {
				var response types.MsgReactorDefuseResponse
				require.NoError(t, proto.Unmarshal(result.MsgResponses[i].Value, &response))
				pending, err := bApp.StakingKeeper.GetUnbondingDelegation(final, address, validator)
				require.NoError(t, err)
				require.Len(t, pending.Entries, 1)
				require.True(t, response.Amount.Amount.IsPositive())
				// This fixed slash produces a one-ualpha conversion loss in both
				// requests, including a request for the entire queried balance.
				require.Equal(t, requested[i].SubRaw(1), response.Amount.Amount)
				require.Equal(t, response.Amount.Amount, pending.Entries[0].Balance)
				t.Logf("leg=%d requested=%s actual_cooldown=%s", i, requested[i], response.Amount.Amount)
			}
		})
	}
}
