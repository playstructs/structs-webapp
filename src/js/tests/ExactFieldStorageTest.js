import {DTest, DTestSuite} from "../framework/DTestFramework";
import {StructTypeFactory} from "../factories/StructTypeFactory";
import {PlayerFactory} from "../factories/PlayerFactory";
import {InfusionFactory} from "../factories/InfusionFactory";
import {StructFactory} from "../factories/StructFactory";
import {Player} from "../models/Player";
import {toExact} from "../util/Units";

/**
 * Model/DTO *_p fields are stored as exact decimal strings so they survive
 * JSON (GameState, caches, router options) and structuredClone, and so the
 * exact funds/reactor code that requires strings can read them.
 */
export class ExactFieldStorageTest extends DTestSuite {

  constructor() {
    super('ExactFieldStorageTest');
  }

  toExactTest = new DTest('toExactTest', function() {
    this.assertEquals(toExact(18446744073709551615n), '18446744073709551615');
    this.assertEquals(toExact('42'), '42');
    this.assertEquals(toExact(null), null);
    this.assertEquals(toExact('1.5'), null);
  });

  structTypesSerializeTest = new DTest('structTypesSerializeTest', function() {
    const type = new StructTypeFactory().make({
      possible_ambit_array: '[]', primary_weapon_ambits_array: '[]', secondary_weapon_ambits_array: '[]',
      build_draw_p: '18446744073709551615', passive_draw: 2, generating_rate_p: '3'
    });
    this.assertEquals(type.build_draw_p, '18446744073709551615');
    this.assertEquals(type.passive_draw_p, '2000');
    // GameState compares catalogs with JSON.stringify; BigInt fields would throw.
    this.assertEquals(JSON.parse(JSON.stringify(type)).generating_rate_p, '3');
  });

  energyFromStringsTest = new DTest('energyFromStringsTest', function() {
    const player = new PlayerFactory().make({
      load: '1500', structs_load: '1', capacity: '1501', connection_capacity: '0',
      pfp_client_render_attributes: null
    });
    const {load, capacity} = Player.energyMilliwatts(player);
    this.assertEquals(load, 1501n);
    this.assertEquals(capacity, 1501n);
    this.assertEquals(player.isOverloaded(), false);
    // Plain rows with only legacy watt fields still work.
    this.assertEquals(Player.energyMilliwatts({load: 2, capacity: 1}).load, 2000n);
  });

  infusionUnknownStaysUnknownTest = new DTest('infusionUnknownStaysUnknownTest', function() {
    const infusion = new InfusionFactory().make({fuel_p: null, fuel: 5, power_p: '7'});
    this.assertEquals(infusion.fuel_p, null);
    this.assertEquals(infusion.power_p, '7');
    // A payload cached before *_p existed falls back to the legacy value.
    this.assertEquals(new InfusionFactory().make({defusing: 2}).defusing_p, '2000000');
  });

  generatorFuelTest = new DTest('generatorFuelTest', function() {
    const meta = {data_ready: true};
    const ready = new StructFactory().make({defending_struct_ids: '[]', fuel: 1, fuel_p: '1000000',
      generator_positions_ready: true, generator_fuel_p: '2500000', generator_power_p: '7500'}, meta);
    this.assertEquals(ready.fuel_p, '2500000');
    this.assertEquals(ready.generator_power_p, '7500');
    const pending = new StructFactory().make({defending_struct_ids: '[]', fuel: 1, fuel_p: '1000000',
      generator_positions_ready: false}, meta);
    this.assertEquals(pending.fuel_p, null);
  });
}
