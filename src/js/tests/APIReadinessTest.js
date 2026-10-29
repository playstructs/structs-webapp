import {DTest, DTestSuite} from "../framework/DTestFramework";
import {GuildAPIResponseFactory} from "../factories/GuildAPIResponseFactory";
import {PlayerFactory} from "../factories/PlayerFactory";
import {InfusionFactory} from "../factories/InfusionFactory";

export class APIReadinessTest extends DTestSuite {
  constructor() {
    super('APIReadinessTest');
  }

  preservesUnavailableMetadataTest = new DTest('preservesUnavailableMetadataTest', function() {
    const meta = {height: null, indexed_height: '3353000', protocol: 'v0.22.0', data_ready: false};
    const response = new GuildAPIResponseFactory().make({success: true, errors: [], data: [], meta, total: 0});
    this.assertEquals(response.meta, meta);
    this.assertEquals(response.meta.height, null);
    this.assertEquals(response.meta.data_ready, false);
    this.assertEquals(response.total, 0);
    const legacy = new GuildAPIResponseFactory().make({success: true, errors: [], data: []});
    this.assertEquals(legacy.meta, null);
  });

  preservesRawGridValuesBeforeDisplayConversionTest = new DTest('preservesRawGridValuesBeforeDisplayConversionTest', function() {
    const raw = '18446744073709551615';
    const meta = {height: '3353000', protocol: 'v0.22.0', data_ready: true};
    const player = new PlayerFactory().make({load: raw, structs_load: '0', capacity: raw,
      connection_capacity: raw, ore: '9007199254740993', pfp_client_render_attributes: null}, meta);
    this.assertEquals(player.capacity_p, raw);
    this.assertEquals(player.load_p, raw);
    this.assertEquals(player.connection_capacity_p, raw);
    this.assertEquals(player.ore_p, '9007199254740993');
    this.assertEquals(player.snapshot_meta, meta);
    this.assertEquals(typeof player.capacity, 'number');
    const restored = JSON.parse(JSON.stringify(player));
    this.assertEquals(restored.capacity_p, raw);
    this.assertEquals(restored.snapshot_meta.height, '3353000');
  });

  preservesExactReactorPositionsAndUnknownTest = new DTest('preservesExactReactorPositionsAndUnknownTest', function() {
    const meta = {height: '3353000', protocol: 'v0.22.0', data_ready: true};
    const raw = {fuel_p: '18446744073709551616', defusing_p: null, power_p: '3', owner_power_p: '1',
      positions_meta: {complete: false}, positions: [{address: 'vault', is_vault: true, fuel_p: '18446744073709551616'}]};
    const infusion = new InfusionFactory().make(raw, meta);
    this.assertEquals(infusion.snapshot_meta, meta);
    this.assertEquals(infusion.fuel_p, raw.fuel_p);
    this.assertEquals(infusion.defusing_p, null);
    this.assertEquals(infusion.owner_power_p, '1');
    this.assertEquals(infusion.positions_meta.complete, false);
    const restored = new InfusionFactory().make(JSON.parse(JSON.stringify(infusion)));
    this.assertEquals(restored.snapshot_meta.height, '3353000');
    this.assertEquals(restored.positions[0].fuel_p, raw.fuel_p);
    this.assertEquals(new InfusionFactory().make(null, meta).snapshot_meta, meta);
  });
}
