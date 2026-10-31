// Real application, renderer and assets; only tutorial orchestration is replaced.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),modules=process.env.STRUCTS_NODE_MODULES||path.join(root,'src/node_modules');
const output=path.resolve(process.argv[2]||'');
if(!process.argv[2]||!fs.existsSync(output)||output.startsWith(root+path.sep))throw new Error('Supply an existing temporary output outside the checkout');
const webpack=require(path.join(modules,'webpack')),config=require(path.join(root,'src/webpack.config.js'));
Object.assign(config,{context:path.join(root,'src'),mode:'development'});
config.output.path=output;config.resolve.modules=[modules,'node_modules'];config.resolveLoader={modules:[modules,'node_modules']};
config.module.rules[0].options.compiler=path.join(root,'tools/proto/node_modules/typescript');
config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^\.\/controllers\/TutorialController$/,resource=>{
  if(resource.context===path.join(root,'src/js'))resource.request=path.join(__dirname,'CombatTutorialController.js');
}));
webpack(config,(error,stats)=>{
  if(error||stats.hasErrors()){console.error(error||stats.toString({all:false,errors:true}));process.exitCode=1;return;}
  fs.cpSync(path.join(root,'src/public/js/vendor'),path.join(output,'vendor'),{recursive:true});
  for(const name of ['main.js','plugins.js'])fs.copyFileSync(path.join(root,'src/public/js',name),path.join(output,name));
  console.log('Combat renderer fixture built at '+output);
});
