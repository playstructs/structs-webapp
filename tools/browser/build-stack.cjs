// Real application entry; only its RPC/NATS constructors use fixture endpoints.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),modules=process.env.STRUCTS_NODE_MODULES||path.join(root,'src/node_modules');
const output=path.resolve(process.argv[2]||'');
if(!process.argv[2]||!fs.existsSync(output)||output.startsWith(root+path.sep))throw new Error('Supply an existing temporary output outside the checkout');
const webpack=require(path.join(modules,'webpack')),config=require(path.join(root,'src/webpack.config.js'));
Object.assign(config,{context:path.join(root,'src'),mode:'development'});
config.entry.bootstrap=path.join(__dirname,'session-bootstrap.js');
config.entry['worker-check']=path.join(__dirname,'worker-check.js');
config.output.path=output;config.resolve.modules=[modules,'node_modules'];config.resolveLoader={modules:[modules,'node_modules']};
config.module.rules[0].options.compiler=path.join(root,'tools/proto/node_modules/typescript');
config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^\.\/managers\/SigningClientManager$/,resource=>{
  if(resource.context===path.join(root,'src/js'))resource.request=path.join(__dirname,'StackSigningClientManager.js');
}));
config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^\.\/framework\/GrassManager$/,resource=>{
  if(resource.context===path.join(root,'src/js'))resource.request=path.join(__dirname,'StackGrassManager.js');
}));
webpack(config,(error,stats)=>{
  if(error||stats.hasErrors()){console.error(error||stats.toString({all:false,errors:true}));process.exitCode=1;return;}
  const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));
  fs.writeFileSync(path.join(output,'bootstrap.html'),`<!doctype html><title>Isolated Structs fixture</title><script src="/${manifest['js/bootstrap.js']}"></script>`);
  fs.writeFileSync(path.join(output,'worker-check.html'),`<!doctype html><title>Structs worker acceptance</title><h1>Isolated worker acceptance</h1><p id="status">Checking fingerprinted worker...</p><script src="/${manifest['js/worker-check.js']}"></script>`);
  console.log('Isolated-stack application and session bootstrap built at '+output);
});
