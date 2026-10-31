package app_test

import (
	"fmt"
	"math/rand"
	"testing"
	"time"

	"cosmossdk.io/math"
	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	simtestutil "github.com/cosmos/cosmos-sdk/testutil/sims"
	sdk "github.com/cosmos/cosmos-sdk/types"
	authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	vestingtypes "github.com/cosmos/cosmos-sdk/x/auth/vesting/types"
	stakingkeeper "github.com/cosmos/cosmos-sdk/x/staking/keeper"
	"github.com/stretchr/testify/require"
	"structs/app"
	"structs/app/ante"
	keeperlib "structs/x/structs/keeper"
	"structs/x/structs/types"
)

func submitClientFunding(t *testing.T, chain *app.App, ctx sdk.Context, key *secp256k1.PrivKey, messages ...sdk.Msg) *abci.ExecTxResult {
	t.Helper()
	signer := sdk.AccAddress(key.PubKey().Address())
	account := chain.AccountKeeper.GetAccount(ctx, signer)
	config := authtx.NewTxConfig(chain.AppCodec(), authtx.DefaultSignModes)
	tx, err := simtestutil.GenSignedMockTx(rand.New(rand.NewSource(1)), config, messages,
		sdk.Coins{sdk.NewInt64Coin("ualpha", 0)}, ante.DefaultFreeGasCap, jailGateChainID,
		[]uint64{account.GetAccountNumber()}, []uint64{account.GetSequence()}, key)
	require.NoError(t, err)
	wire, err := config.TxEncoder()(tx)
	require.NoError(t, err)
	block, err := chain.FinalizeBlock(&abci.RequestFinalizeBlock{Height: ctx.BlockHeight(), Time: ctx.BlockTime(), Txs: [][]byte{wire}})
	require.NoError(t, err)
	require.Len(t, block.TxResults, 1)
	return block.TxResults[0]
}

// Exercise actual signed collection groups, including a secondary signer and
// vault provisioning. A rejected final message must undo every collection.
func TestClientRetainedFundingAtomic(t *testing.T) {
	for _, count := range []int{1, 16} {
		for _, scenario := range []string{"transfer", "infuse", "fail_final", "missing_transfer", "reassigned", "vesting"} {
			t.Run(fmt.Sprintf("sources_%d_%s", count, scenario), func(t *testing.T) {
				chain, ctx := setupClientReactorApp(t)
				key := secp256k1.GenPrivKey()
				signer := sdk.AccAddress(key.PubKey().Address())
				player := appendAppPlayer(t, chain.StructsKeeper, ctx, signer)
				recipient := appendAppPlayer(t, chain.StructsKeeper, ctx, sdk.AccAddress(secp256k1.GenPrivKey().PubKey().Address()))
				permissions := types.PermTokenTransfer | types.PermTokenInfuse
				if scenario == "missing_transfer" {
					permissions = types.PermTokenInfuse
				}
				chain.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(signer.String()), permissions)
				vault, err := types.VaultAddress(player.Id)
				require.NoError(t, err)
				destination, err := types.VaultAddress(recipient.Id)
				require.NoError(t, err)
				fundRedelegationAccount(t, chain, ctx, vault, sdk.NewCoins(sdk.NewInt64Coin("ualpha", 1_000_000)))
				var messages []sdk.Msg
				var sources []sdk.AccAddress
				for i := 0; i < count; i++ {
					address := sdk.AccAddress(secp256k1.GenPrivKey().PubKey().Address())
					owner := player.Index
					if scenario == "reassigned" && i == count-1 {
						owner = recipient.Index
					}
					require.NoError(t, chain.StructsKeeper.SetPlayerIndexForAddress(ctx, address.String(), owner))
					fundRedelegationAccount(t, chain, ctx, address, sdk.NewCoins(sdk.NewInt64Coin("ualpha", 3_000_000)))
					if scenario == "vesting" && i == count-1 {
						base := chain.AccountKeeper.GetAccount(ctx, address).(*authtypes.BaseAccount)
						vesting, err := vestingtypes.NewContinuousVestingAccount(base,
							sdk.NewCoins(sdk.NewInt64Coin("ualpha", 3_000_000)), ctx.BlockTime().Unix(), ctx.BlockTime().Add(time.Hour).Unix())
						require.NoError(t, err)
						chain.AccountKeeper.SetAccount(ctx, vesting)
					}
					sources = append(sources, address)
					messages = append(messages, &types.MsgPlayerSend{Creator: signer.String(), FromAddress: address.String(),
						ToAddress: vault.String(), Amount: sdk.NewCoins(sdk.NewInt64Coin("ualpha", 2_000_000))})
				}
				amount := int64(count*2_000_000 + 1_000_000)
				if scenario == "fail_final" {
					amount++
				}
				validators, err := chain.StakingKeeper.GetLastValidators(ctx)
				require.NoError(t, err)
				if scenario == "infuse" {
					messages = append(messages, &types.MsgReactorInfuse{Creator: signer.String(), OwnerId: player.Id,
						ValidatorAddress: validators[0].OperatorAddress, Amount: sdk.NewInt64Coin("ualpha", amount)})
				} else {
					messages = append(messages, &types.MsgVaultSend{Creator: signer.String(), OwnerId: player.Id,
						RecipientOwnerId: recipient.Id, Amount: sdk.NewCoins(sdk.NewInt64Coin("ualpha", amount))})
				}
				result := submitClientFunding(t, chain, ctx, key, messages...)
				final := chain.NewContext(false).WithBlockTime(ctx.BlockTime())
				success := scenario == "transfer" || scenario == "infuse"
				if success {
					require.Zero(t, result.Code, result.Log)
				} else {
					require.NotZero(t, result.Code, result.Log)
				}
				expectedSource, expectedVault := int64(3_000_000), int64(1_000_000)
				if success {
					expectedSource, expectedVault = 1_000_000, 0
				}
				for _, address := range sources {
					require.Equal(t, expectedSource, chain.BankKeeper.GetBalance(final, address, "ualpha").Amount.Int64())
				}
				require.Equal(t, expectedVault, chain.BankKeeper.GetBalance(final, vault, "ualpha").Amount.Int64())
				_, provisioned := chain.StructsKeeper.GetVaultOwner(final, vault)
				require.Equal(t, success, provisioned)
				if scenario == "transfer" {
					require.Equal(t, amount, chain.BankKeeper.GetBalance(final, destination, "ualpha").Amount.Int64())
				}
				if scenario == "infuse" {
					validator, err := sdk.ValAddressFromBech32(validators[0].OperatorAddress)
					require.NoError(t, err)
					_, err = chain.StakingKeeper.GetDelegation(final, vault, validator)
					require.NoError(t, err)
				}
				t.Logf("sources=%d scenario=%s gas=%d code=%d", count, scenario, result.GasUsed, result.Code)
				require.Less(t, result.GasUsed, int64(ante.DefaultFreeGasCap))
			})
		}
	}
}

// The refund itself is created by native staking's maturity queue, not a bank
// fixture. A later explicit spend collects ten of the refunded fifty Alpha.
func TestClientRetainedFundingMaturedRefund(t *testing.T) {
	chain, ctx := setupClientReactorApp(t)
	key := secp256k1.GenPrivKey()
	signer := sdk.AccAddress(key.PubKey().Address())
	player := appendAppPlayer(t, chain.StructsKeeper, ctx, signer)
	recipient := appendAppPlayer(t, chain.StructsKeeper, ctx, sdk.AccAddress(secp256k1.GenPrivKey().PubKey().Address()))
	chain.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(signer.String()), types.PermTokenTransfer|types.PermTokenDefuse)
	old := sdk.AccAddress(secp256k1.GenPrivKey().PubKey().Address())
	require.NoError(t, chain.StructsKeeper.SetPlayerIndexForAddress(ctx, old.String(), player.Index))
	validators, err := chain.StakingKeeper.GetLastValidators(ctx)
	require.NoError(t, err)
	validator, err := sdk.ValAddressFromBech32(validators[0].OperatorAddress)
	require.NoError(t, err)
	delegate(t, chain, ctx, stakingkeeper.NewMsgServerImpl(chain.StakingKeeper), "ualpha", old, validator, math.NewInt(50_000_000))
	before := chain.BankKeeper.GetBalance(ctx, old, "ualpha").Amount
	result := submitClientFunding(t, chain, ctx, key, &types.MsgReactorDefuse{Creator: signer.String(), DelegatorAddress: old.String(),
		ValidatorAddress: validator.String(), Amount: sdk.NewInt64Coin("ualpha", 50_000_000)})
	require.Zero(t, result.Code, result.Log)
	final := chain.NewContext(false).WithBlockTime(ctx.BlockTime())
	pending, err := chain.StakingKeeper.GetUnbondingDelegation(final, old, validator)
	require.NoError(t, err)
	require.True(t, chain.BankKeeper.GetBalance(final, old, "ualpha").Amount.Equal(before))
	_, err = chain.Commit()
	require.NoError(t, err)
	maturity := pending.Entries[0].CompletionTime.Add(time.Second)
	_, err = chain.FinalizeBlock(&abci.RequestFinalizeBlock{Height: 2, Time: maturity})
	require.NoError(t, err)
	final = chain.NewContext(false).WithBlockTime(maturity)
	require.True(t, chain.BankKeeper.GetBalance(final, old, "ualpha").Amount.Equal(before.AddRaw(50_000_000)))
	_, err = chain.Commit()
	require.NoError(t, err)
	ctx = chain.NewUncachedContext(false, ctx.BlockHeader()).WithBlockHeight(3).WithBlockTime(maturity.Add(time.Second))
	vault, err := types.VaultAddress(player.Id)
	require.NoError(t, err)
	result = submitClientFunding(t, chain, ctx, key,
		&types.MsgPlayerSend{Creator: signer.String(), FromAddress: old.String(), ToAddress: vault.String(), Amount: sdk.NewCoins(sdk.NewInt64Coin("ualpha", 10_000_000))},
		&types.MsgVaultSend{Creator: signer.String(), OwnerId: player.Id, RecipientOwnerId: recipient.Id, Amount: sdk.NewCoins(sdk.NewInt64Coin("ualpha", 10_000_000))})
	require.Zero(t, result.Code, result.Log)
	final = chain.NewContext(false).WithBlockTime(ctx.BlockTime())
	require.True(t, chain.BankKeeper.GetBalance(final, old, "ualpha").Amount.Equal(before.AddRaw(40_000_000)))
	require.True(t, chain.BankKeeper.GetBalance(final, vault, "ualpha").IsZero())
}
