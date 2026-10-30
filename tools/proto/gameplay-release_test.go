package app_test

import (
	"math/rand"
	"strconv"
	"strings"
	"testing"
	"time"

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

// The browser delegates dynamic state/proof checks to this native simulation.
// Exercise real signed bytes, ante and handlers, then inclusion of the same
// bytes. Simulate must discard its writes and cannot consume the account/slot.
func TestClientGameplaySimulation(t *testing.T) {
	for _, scenario := range []struct{ name, operation, failure string }{
		{"build", "build", ""},
		{"stale_build_anchor", "build", "work"},
		{"wrong_hash_permission", "build", "permission"},
		{"destroyed_build", "build", "destroyed"},
		{"refine_to_vault", "refine", ""},
		{"stale_refine_anchor", "refine", "work"},
		{"wrong_refine_permission", "refine", "permission"},
		{"activate", "activate", ""},
		{"destroyed_activation", "activate", "destroyed"},
		{"insufficient_charge", "activate", "charge"},
		{"rename", "name", ""},
		{"invalid_name", "name", "name"},
		{"wrong_name_permission", "name", "permission"},
	} {
		t.Run(scenario.name, func(t *testing.T) {
			bApp, ctx := setupJailGateApp(t)
			key := secp256k1.GenPrivKey()
			address := sdk.AccAddress(key.PubKey().Address())
			player := appendAppPlayer(t, bApp.StructsKeeper, ctx, address)
			planet := types.Planet{Id: "2-991", Owner: player.Id, Creator: address.String()}
			player.PlanetId = planet.Id
			bApp.StructsKeeper.SetPlayer(ctx, player)
			bApp.StructsKeeper.SetPlanet(ctx, planet)
			bApp.StructsKeeper.SetGridAttribute(ctx, keeperlib.GetGridAttributeIDByObjectId(types.GridAttributeType_capacity, player.Id), 1000000)
			bApp.StructsKeeper.SetGridAttribute(ctx, keeperlib.GetGridAttributeIDByObjectId(types.GridAttributeType_structsLoad, player.Id), types.PlayerPassiveDraw+1)
			structType := types.StructType{Id: 991, Type: "Client Fixture", Category: types.ObjectType_planet,
				BuildDraw: 1, PassiveDraw: 1, MaxHealth: 1, BuildDifficulty: 2, ActivateCharge: 1}
			if scenario.operation == "refine" {
				structType.PlanetaryRefinery = types.TechPlanetaryRefineries_oreRefinery
				structType.OreRefiningDifficulty = 2
				bApp.StructsKeeper.SetGridAttribute(ctx, keeperlib.GetGridAttributeIDByObjectId(types.GridAttributeType_ore, player.Id), 1)
				bApp.StructsKeeper.SetPlanetAttribute(ctx, keeperlib.GetPlanetAttributeIDByObjectId(types.PlanetAttributeType_oreRefiningActiveQuantity, planet.Id), 1)
				refineAnchor := uint64(1)
				if scenario.name == "stale_refine_anchor" {
					refineAnchor = 2
				}
				bApp.StructsKeeper.SetPlanetAttribute(ctx, keeperlib.GetPlanetAttributeIDByObjectId(types.PlanetAttributeType_planetBlockStartOreRefine, planet.Id), refineAnchor)
			}
			if scenario.name == "insufficient_charge" {
				structType.ActivateCharge = 100
			}
			bApp.StructsKeeper.SetStructType(ctx, structType)
			structure := types.Struct{Id: "5-991", Owner: player.Id, Creator: address.String(), Type: structType.Id,
				LocationId: planet.Id, LocationType: types.ObjectType_planet, OperatingAmbit: types.Ambit_land}
			bApp.StructsKeeper.SetStruct(ctx, structure)
			status := uint64(types.StructStateMaterialized)
			if scenario.operation == "activate" {
				status |= uint64(types.StructStateBuilt)
			}
			if scenario.operation == "refine" {
				status |= uint64(types.StructStateBuilt | types.StructStateOnline)
			}
			if strings.HasPrefix(scenario.name, "destroyed_") {
				status |= uint64(types.StructStateDestroyed)
			}
			statusID := keeperlib.GetStructAttributeIDByObjectId(types.StructAttributeType_status, structure.Id)
			bApp.StructsKeeper.SetStructAttribute(ctx, statusID, status)
			anchor := uint64(1)
			if scenario.name == "stale_build_anchor" {
				anchor = 2
			}
			bApp.StructsKeeper.SetStructAttribute(ctx, keeperlib.GetStructAttributeIDByObjectId(types.StructAttributeType_blockStartBuild, structure.Id), anchor)
			permission := types.PermPlay
			switch scenario.operation {
			case "build":
				permission = types.PermHashBuild
			case "refine":
				permission = types.PermHashRefine
			case "name":
				permission = types.PermUpdate
			}
			if strings.HasPrefix(scenario.name, "wrong_") {
				permission = types.PermAdmin
			}
			bApp.StructsKeeper.SetPermissionsByBytes(ctx, keeperlib.GetAddressPermissionIDBytes(address.String()), permission)
			// Commit the prepared fixture, so Simulate reads the same committed
			// state a height-pinned public query would observe.
			for height := int64(1); height <= 4; height++ {
				_, err := bApp.FinalizeBlock(&abci.RequestFinalizeBlock{Height: height, Time: ctx.BlockTime().Add(time.Duration(height) * time.Second)})
				require.NoError(t, err)
				_, err = bApp.Commit()
				require.NoError(t, err)
			}
			current := bApp.NewUncachedContext(false, ctx.BlockHeader()).WithBlockHeight(4)
			var message sdk.Msg
			switch scenario.operation {
			case "build", "refine":
				var nonce, proof string
				for i := 0; i < 10000; i++ {
					nonce = strconv.Itoa(i)
					proof = types.HashBuild(structure.Id + strings.ToUpper(scenario.operation) + "1NONCE" + nonce)
					if strings.HasPrefix(proof, "0") {
						break
					}
				}
				require.True(t, strings.HasPrefix(proof, "0"))
				if scenario.operation == "build" {
					message = &types.MsgStructBuildComplete{Creator: address.String(), StructId: structure.Id, Nonce: nonce, Proof: proof}
				} else {
					message = &types.MsgStructOreRefineryComplete{Creator: address.String(), StructId: structure.Id, Nonce: nonce, Proof: proof}
				}
			case "activate":
				message = &types.MsgStructActivate{Creator: address.String(), StructId: structure.Id}
			case "name":
				name := "Explorer"
				if scenario.name == "invalid_name" {
					name = strings.Repeat("X", 256)
				}
				message = &types.MsgPlayerUpdateName{Creator: address.String(), PlayerId: player.Id, Name: name}
			}
			account := bApp.AccountKeeper.GetAccount(current, address)
			config := authtx.NewTxConfig(bApp.AppCodec(), authtx.DefaultSignModes)
			tx, err := simtestutil.GenSignedMockTx(rand.New(rand.NewSource(1)), config, []sdk.Msg{message},
				sdk.Coins{sdk.NewInt64Coin("ualpha", 0)}, ante.DefaultFreeGasCap, jailGateChainID,
				[]uint64{account.GetAccountNumber()}, []uint64{account.GetSequence()}, key)
			require.NoError(t, err)
			wire, err := config.TxEncoder()(tx)
			require.NoError(t, err)
			before := applicationAssetStateRows(bApp, current)
			gas, _, simulationErr := bApp.Simulate(wire)
			require.Equal(t, before, applicationAssetStateRows(bApp, current), "simulation must discard all writes")
			require.Equal(t, account.GetSequence(), bApp.AccountKeeper.GetAccount(current, address).GetSequence())
			if scenario.failure != "" {
				require.ErrorContains(t, simulationErr, scenario.failure)
			} else {
				require.NoError(t, simulationErr)
				require.Positive(t, gas.GasUsed)
				require.LessOrEqual(t, gas.GasUsed, ante.DefaultFreeGasCap)
			}
			block, err := bApp.FinalizeBlock(&abci.RequestFinalizeBlock{Height: 5, Time: ctx.BlockTime().Add(5 * time.Second), Txs: [][]byte{wire}})
			require.NoError(t, err)
			require.Len(t, block.TxResults, 1)
			result := block.TxResults[0]
			if scenario.failure != "" {
				require.NotZero(t, result.Code)
			} else {
				require.Zero(t, result.Code, result.Log)
				if scenario.operation == "refine" {
					vault, err := types.VaultAddress(player.Id)
					require.NoError(t, err)
					final := bApp.NewContext(false)
					require.Equal(t, "1000000", bApp.BankKeeper.GetBalance(final, vault, "ualpha").Amount.String())
					require.True(t, bApp.BankKeeper.GetBalance(final, address, "ualpha").IsZero())
				}
			}
			t.Logf("bytes=%d simulation gas=%d inclusion gas=%d code=%d", len(wire), gas.GasUsed, result.GasUsed, result.Code)
		})
	}
}
