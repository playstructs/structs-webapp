// Symfony resolves entry URLs from the same build that emitted the bundles.
module.exports = class AssetManifestPlugin {
  apply(compiler) {
    const {Compilation, sources} = compiler.webpack;
    compiler.hooks.thisCompilation.tap('AssetManifestPlugin', compilation => {
      compilation.hooks.processAssets.tap({
        name: 'AssetManifestPlugin', stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
      }, () => {
        const manifest = {};
        for (const [name, entry] of compilation.entrypoints) {
          const files = entry.getFiles().filter(file => file.endsWith('.js'));
          if (files.length !== 1) throw new Error(`Expected one JavaScript bundle for ${name}`);
          manifest[`js/${name}.js`] = `js/${files[0]}`;
        }
        compilation.emitAsset('manifest.json', new sources.RawSource(JSON.stringify(manifest, null, 2) + '\n'));
      });
    });
  }
};
