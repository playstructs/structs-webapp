package app_test

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	abci "github.com/cometbft/cometbft/abci/types"
	cmtproto "github.com/cometbft/cometbft/proto/tendermint/types"
	cmttypes "github.com/cometbft/cometbft/types"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/client/flags"
	cryptocodec "github.com/cosmos/cosmos-sdk/crypto/codec"
	"github.com/cosmos/cosmos-sdk/crypto/keys/ed25519"
	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	simtestutil "github.com/cosmos/cosmos-sdk/testutil/sims"
	sdk "github.com/cosmos/cosmos-sdk/types"
	querytypes "github.com/cosmos/cosmos-sdk/types/query"
	authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	stakingkeeper "github.com/cosmos/cosmos-sdk/x/staking/keeper"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"
	"github.com/cosmos/gogoproto/proto"
	"github.com/stretchr/testify/require"
	"structs/app"
	"structs/app/ante"
	keeperlib "structs/x/structs/keeper"
	"structs/x/structs/types"
)

// Configure the real bond denomination in genesis, including native pool
// balances and supply. Changing the parameter after InitChain would leave
// existing delegations backed by the wrong coin.
func setupClientReactorApp(t *testing.T) (*app.App, sdk.Context) {
	t.Helper()
	options := simtestutil.AppOptionsMap{flags.FlagHome: app.DefaultNodeHome}
	bApp, err := app.New(log.NewNopLogger(), dbm.NewMemDB(), nil, true, options, baseapp.SetChainID(jailGateChainID))
	require.NoError(t, err)
	consensusKey, err := cryptocodec.ToCmtPubKeyInterface(ed25519.GenPrivKey().PubKey())
	require.NoError(t, err)
	validators := cmttypes.NewValidatorSet([]*cmttypes.Validator{cmttypes.NewValidator(consensusKey, 1)})
	key := secp256k1.GenPrivKey()
	account := authtypes.NewBaseAccount(key.PubKey().Address().Bytes(), key.PubKey(), 0, 0)
	genesis, err := simtestutil.GenesisStateWithValSet(bApp.AppCodec(), bApp.DefaultGenesis(), validators,
		[]authtypes.GenesisAccount{account}, banktypes.Balance{Address: account.GetAddress().String(),
			Coins: sdk.NewCoins(sdk.NewCoin(sdk.DefaultBondDenom, sdk.DefaultPowerReduction.MulRaw(100)))})
	require.NoError(t, err)
	var stakingGenesis stakingtypes.GenesisState
	bApp.AppCodec().MustUnmarshalJSON(genesis[stakingtypes.ModuleName], &stakingGenesis)
	stakingGenesis.Params.BondDenom = "ualpha"
	genesis[stakingtypes.ModuleName] = bApp.AppCodec().MustMarshalJSON(&stakingGenesis)
	var bankGenesis banktypes.GenesisState
	bApp.AppCodec().MustUnmarshalJSON(genesis[banktypes.ModuleName], &bankGenesis)
	convert := func(coins sdk.Coins) {
		for i := range coins {
			if coins[i].Denom == sdk.DefaultBondDenom {
				coins[i].Denom = "ualpha"
			}
		}
	}
	for i := range bankGenesis.Balances {
		convert(bankGenesis.Balances[i].Coins)
	}
	convert(bankGenesis.Supply)
	genesis[banktypes.ModuleName] = bApp.AppCodec().MustMarshalJSON(&bankGenesis)
	encoded, err := json.Marshal(genesis)
	require.NoError(t, err)
	_, err = bApp.InitChain(&abci.RequestInitChain{ChainId: jailGateChainID, InitialHeight: 1,
		ConsensusParams: simtestutil.DefaultConsensusParams, AppStateBytes: encoded})
	require.NoError(t, err)
	ctx := bApp.NewContextLegacy(false, cmtproto.Header{Height: 1, ChainID: jailGateChainID, Time: time.Now().UTC()})
	return bApp, ctx
}

// These are real signed transactions through the pinned release's ante chain,
// message cache and native staking hooks. Counts bound the client request, not
// every possible account/chain state; every real request still needs simulation.
func TestClientReactorBatchUnprovisionedVault(t *testing.T) {
	for _, scenario := range []string{"first_infusion", "retained_withdrawal", "insufficient_vault"} {
		t.Run(scenario, func(t *testing.T) {
			bApp, ctx := setupClientReactorApp(t)
			key := secp256k1.GenPrivKey()
			signer := sdk.AccAddress(key.PubKey().Address())
			player := appendAppPlayer(t, bApp.StructsKeeper, ctx, signer)
			bApp.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(signer.String()), types.PermTokenInfuse|types.PermTokenDefuse)
			vault, err := types.VaultAddress(player.Id)
			require.NoError(t, err)
			fundRedelegationAccount(t, bApp, ctx, vault, sdk.NewCoins(sdk.NewInt64Coin("ualpha", 5_000_000)))
			_, provisioned := bApp.StructsKeeper.GetVaultOwner(ctx, vault)
			require.False(t, provisioned)
			validators, err := bApp.StakingKeeper.GetLastValidators(ctx)
			require.NoError(t, err)
			validator, err := sdk.ValAddressFromBech32(validators[0].OperatorAddress)
			require.NoError(t, err)
			server := stakingkeeper.NewMsgServerImpl(bApp.StakingKeeper)
			delegate(t, bApp, ctx, server, "ualpha", signer, validator, math.NewInt(2_000_000))
			retained, err := bApp.StakingKeeper.GetDelegation(ctx, signer, validator)
			require.NoError(t, err)
			amount := int64(1_000_000)
			if scenario == "insufficient_vault" {
				amount = 6_000_000
			}
			var message sdk.Msg = &types.MsgReactorInfuse{Creator: signer.String(), OwnerId: player.Id,
				ValidatorAddress: validator.String(), Amount: sdk.NewInt64Coin("ualpha", amount)}
			if scenario == "retained_withdrawal" {
				message = &types.MsgReactorDefuse{Creator: signer.String(), DelegatorAddress: signer.String(),
					ValidatorAddress: validator.String(), Amount: sdk.NewInt64Coin("ualpha", amount)}
			}
			account := bApp.AccountKeeper.GetAccount(ctx, signer)
			config := authtx.NewTxConfig(bApp.AppCodec(), authtx.DefaultSignModes)
			tx, err := simtestutil.GenSignedMockTx(rand.New(rand.NewSource(1)), config, []sdk.Msg{message}, sdk.Coins{sdk.NewInt64Coin("ualpha", 0)},
				ante.DefaultFreeGasCap, jailGateChainID, []uint64{account.GetAccountNumber()}, []uint64{account.GetSequence()}, key)
			require.NoError(t, err)
			wire, err := config.TxEncoder()(tx)
			require.NoError(t, err)
			block, err := bApp.FinalizeBlock(&abci.RequestFinalizeBlock{Height: 1, Time: ctx.BlockTime(), Txs: [][]byte{wire}})
			require.NoError(t, err)
			require.Len(t, block.TxResults, 1)
			result := block.TxResults[0]
			final := bApp.NewContext(false).WithBlockTime(ctx.BlockTime())
			_, provisioned = bApp.StructsKeeper.GetVaultOwner(final, vault)
			require.Equal(t, scenario == "first_infusion", provisioned)
			if scenario == "insufficient_vault" {
				require.NotZero(t, result.Code)
				require.Contains(t, result.Log, "insufficient funds")
			} else {
				require.Zero(t, result.Code, result.Log)
			}
			expectedLiquid := int64(5_000_000)
			if scenario == "first_infusion" {
				expectedLiquid -= amount
				_, err = bApp.StakingKeeper.GetDelegation(final, vault, validator)
				require.NoError(t, err)
			}
			require.Equal(t, expectedLiquid, bApp.BankKeeper.GetBalance(final, vault, "ualpha").Amount.Int64())
			if scenario == "retained_withdrawal" {
				pending, err := bApp.StakingKeeper.GetUnbondingDelegation(final, signer, validator)
				require.NoError(t, err)
				require.Len(t, pending.Entries, 1)
				require.Equal(t, amount, pending.Entries[0].Balance.Int64())
			} else {
				actual, err := bApp.StakingKeeper.GetDelegation(final, signer, validator)
				require.NoError(t, err)
				require.Equal(t, retained, actual, "retained funds never cover a vault shortfall")
			}
		})
	}
}

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
