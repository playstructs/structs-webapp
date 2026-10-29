import {DTest, DTestSuite} from "../framework/DTestFramework";
import {GuildAPIResponseFactory} from "../factories/GuildAPIResponseFactory";
import {PlayerFactory} from "../factories/PlayerFactory";

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
}
