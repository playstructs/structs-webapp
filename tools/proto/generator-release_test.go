package app_test

import (
	"encoding/json"
	"math/rand"
	"testing"

	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	simtestutil "github.com/cosmos/cosmos-sdk/testutil/sims"
	sdk "github.com/cosmos/cosmos-sdk/types"
	authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
	"github.com/stretchr/testify/require"
	"structs/app/ante"
	keeperlib "structs/x/structs/keeper"
	"structs/x/structs/types"
)

// Exercise the client's one-message, zero-ualpha-fee transaction against the
// real release app. In particular, the target's owner is not spend authority,
// and funding the vault position must not reprice historical address positions.
func TestClientGeneratorFunding(t *testing.T) {
	for _, scenario := range []struct {
		name        string
		fuel, ratio uint64
		disabled    bool
		failure     string
	}{
		{name: "prefunded_unprovisioned_vault"},
		{name: "secondary_key_other_owner"},
		{name: "existing_vault_position", fuel: 2_000_000, ratio: 3},
		{name: "disabled_vault_position", fuel: 2_000_000, ratio: 3, disabled: true},
		{name: "restricted_key", failure: "permission"},
		{name: "insufficient_vault", failure: "insufficient funds"},
		{name: "fuel_overflow", fuel: ^uint64(0) - 1_000_000, ratio: 0, failure: "fuel_overflow"},
		{name: "power_overflow", fuel: ^uint64(0) / 2, ratio: 1, failure: "power_overflow"},
	} {
		t.Run(scenario.name, func(t *testing.T) {
			bApp, ctx := setupJailGateApp(t)
			key := secp256k1.GenPrivKey()
			address := sdk.AccAddress(key.PubKey().Address())
			actor := appendAppPlayer(t, bApp.StructsKeeper, ctx, address)
			signingKey, signingAddress := key, address
			if scenario.name == "secondary_key_other_owner" || scenario.name == "restricted_key" {
				signingKey = secp256k1.GenPrivKey()
				signingAddress = sdk.AccAddress(signingKey.PubKey().Address())
				require.NoError(t, bApp.StructsKeeper.SetPlayerIndexForAddress(ctx, signingAddress.String(), actor.Index))
			}
			permission := types.PermTokenInfuse
			if scenario.name == "restricted_key" {
				permission = types.PermAdmin
			}
			bApp.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(signingAddress.String()), permission)
			vault, err := types.VaultAddress(actor.Id)
			require.NoError(t, err)
			vaultBalance := int64(5_000_000)
			if scenario.name == "insufficient_vault" {
				vaultBalance = 2_999_999
			}
			fundRedelegationAccount(t, bApp, ctx, vault, sdk.NewCoins(sdk.NewInt64Coin("ualpha", vaultBalance)))
			fundRedelegationAccount(t, bApp, ctx, address, sdk.NewCoins(sdk.NewInt64Coin("ualpha", 73_000_000)))
			_, associated := bApp.StructsKeeper.GetVaultOwner(ctx, vault)
			require.False(t, associated)
			owner := actor
			if scenario.name == "secondary_key_other_owner" {
				other := sdk.AccAddress(secp256k1.GenPrivKey().PubKey().Address())
				owner = appendAppPlayer(t, bApp.StructsKeeper, ctx, other)
			}
			planet := types.Planet{Id: "2-991", Owner: owner.Id, Creator: address.String()}
			bApp.StructsKeeper.SetPlanet(ctx, planet)
			generatorType, found := bApp.StructsKeeper.GetStructType(ctx, 20)
			require.True(t, found)
			require.Equal(t, uint64(2), generatorType.GeneratingRate)
			bApp.StructsKeeper.SetGridAttribute(ctx, keeperlib.GetGridAttributeIDByObjectId(types.GridAttributeType_structsLoad, owner.Id), generatorType.PassiveDraw)
			bApp.StructsKeeper.SetStructAttribute(ctx, keeperlib.GetStructAttributeIDByObjectIdAndSubIndex(types.StructAttributeType_typeCount, owner.Id, 20), 1)
			generator := types.Struct{Id: "5-991", Owner: owner.Id, Creator: address.String(), Type: 20, LocationId: planet.Id, LocationType: types.ObjectType_planet}
			bApp.StructsKeeper.SetStruct(ctx, generator)
			bApp.StructsKeeper.SetStructAttribute(ctx, keeperlib.GetStructAttributeIDByObjectId(types.StructAttributeType_status, generator.Id),
				uint64(types.StructStateMaterialized|types.StructStateBuilt|types.StructStateOnline))
			cc := bApp.StructsKeeper.NewCurrentContext(ctx)
			legacy := cc.UpsertInfusion(types.ObjectType_struct, generator.Id, address.String(), actor.Id)
			legacy.SetRatio(2)
			legacy.AddFuel(7_000_000)
			// Retain a historical position with a different rate, including one
			// whose output has been disabled. It is not the new funding source.
			if scenario.disabled {
				require.NoError(t, legacy.SetGeneratorPowerEnabled(false))
			}
			cc.CommitAll()
			legacyBefore, found := bApp.StructsKeeper.GetInfusion(ctx, generator.Id, address.String())
			require.True(t, found)
			var positionBefore types.Infusion
			if scenario.fuel != 0 {
				cc = bApp.StructsKeeper.NewCurrentContext(ctx)
				_, err = cc.EnsureVaults(actor.Id)
				require.NoError(t, err)
				position := cc.UpsertInfusion(types.ObjectType_struct, generator.Id, vault.String(), actor.Id)
				position.SetRatio(scenario.ratio)
				position.AddFuel(scenario.fuel)
				if scenario.disabled {
					require.NoError(t, position.SetGeneratorPowerEnabled(false))
				}
				cc.CommitAll()
				positionBefore, found = bApp.StructsKeeper.GetInfusion(ctx, generator.Id, vault.String())
				require.True(t, found)
			}
			supplyBefore := bApp.BankKeeper.GetSupply(ctx, "ualpha").Amount
			module := bApp.AccountKeeper.GetModuleAddress(types.ModuleName)
			moduleBefore := bApp.BankKeeper.GetBalance(ctx, module, "ualpha").Amount
			capacityBefore := redelegationCapacity(t, bApp, ctx, actor.Id)
			account := bApp.AccountKeeper.GetAccount(ctx, signingAddress)
			config := authtx.NewTxConfig(bApp.AppCodec(), authtx.DefaultSignModes)
			messages := []sdk.Msg{&types.MsgStructGeneratorInfuse{Creator: signingAddress.String(), StructId: generator.Id, InfuseAmount: "3000000ualpha"}}
			tx, err := simtestutil.GenSignedMockTx(rand.New(rand.NewSource(1)), config, messages, sdk.Coins{sdk.NewInt64Coin("ualpha", 0)},
				ante.DefaultFreeGasCap, jailGateChainID, []uint64{account.GetAccountNumber()}, []uint64{account.GetSequence()}, signingKey)
			require.NoError(t, err)
			wire, err := config.TxEncoder()(tx)
			require.NoError(t, err)
			block, err := bApp.FinalizeBlock(&abci.RequestFinalizeBlock{Height: 1, Time: ctx.BlockTime(), Txs: [][]byte{wire}})
			require.NoError(t, err)
			require.Len(t, block.TxResults, 1)
			result := block.TxResults[0]
			t.Logf("bytes=%d gas=%d code=%d cap=%d", len(wire), result.GasUsed, result.Code, ante.DefaultFreeGasCap)
			final := bApp.NewContext(false).WithBlockTime(ctx.BlockTime())
			require.Equal(t, int64(73_000_000), bApp.BankKeeper.GetBalance(final, address, "ualpha").Amount.Int64(), "retained funds are not a fallback")
			legacyAfter, found := bApp.StructsKeeper.GetInfusion(final, generator.Id, address.String())
			require.True(t, found)
			require.Equal(t, legacyBefore, legacyAfter, "historical burned fuel stays at its own position and rate")
			require.Equal(t, moduleBefore, bApp.BankKeeper.GetBalance(final, module, "ualpha").Amount)
			position, found := bApp.StructsKeeper.GetInfusion(final, generator.Id, vault.String())
			if scenario.failure != "" {
				require.NotZero(t, result.Code)
				require.Contains(t, result.Log, scenario.failure)
				require.Equal(t, vaultBalance, bApp.BankKeeper.GetBalance(final, vault, "ualpha").Amount.Int64())
				require.Equal(t, supplyBefore, bApp.BankKeeper.GetSupply(final, "ualpha").Amount)
				require.Equal(t, capacityBefore, redelegationCapacity(t, bApp, final, actor.Id))
				require.Equal(t, scenario.fuel != 0, found)
				if found {
					require.Equal(t, positionBefore, position)
				}
			} else {
				require.Zero(t, result.Code, result.Log)
				receipts := 0
				for _, event := range result.Events {
					if event.Type != "structs.structs.EventAlphaInfuse" {
						continue
					}
					receipts++
					matched := 0
					for _, attribute := range event.Attributes {
						if attribute.Key != "eventAlphaInfuseDetail" {
							continue
						}
						matched++
						var detail map[string]string
						require.NoError(t, json.Unmarshal([]byte(attribute.Value), &detail))
						require.Equal(t, actor.Id, detail["playerId"])
						require.Equal(t, address.String(), detail["primaryAddress"])
						require.Equal(t, vault.String(), detail["vaultAddress"])
						require.Equal(t, "3000000", detail["amount"])
					}
					require.Equal(t, 1, matched)
				}
				require.Equal(t, 1, receipts, "the single signed generator message identifies one actual funding receipt")
				require.Less(t, result.GasUsed, int64(ante.DefaultFreeGasCap))
				require.Equal(t, vaultBalance-3_000_000, bApp.BankKeeper.GetBalance(final, vault, "ualpha").Amount.Int64())
				require.Equal(t, supplyBefore.SubRaw(3_000_000), bApp.BankKeeper.GetSupply(final, "ualpha").Amount)
				require.True(t, found)
				require.Equal(t, scenario.fuel+3_000_000, position.Fuel)
				require.Equal(t, (scenario.fuel+3_000_000)*generatorType.GeneratingRate, position.Power)
				require.False(t, position.GeneratorDisabled)
				require.Equal(t, capacityBefore-positionBefore.Power+position.Power, redelegationCapacity(t, bApp, final, actor.Id))
				vaultOwner, found := bApp.StructsKeeper.GetVaultOwner(final, vault)
				require.True(t, found)
				require.Equal(t, actor.Id, vaultOwner)
			}
		})
	}
}
