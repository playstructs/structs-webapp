// Build the development-only screen fixture into an existing disposable preview.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),modules=process.env.STRUCTS_NODE_MODULES||path.join(root,'src/node_modules');
const output=process.argv[2],base=process.argv[3];
if(!output||!fs.existsSync(output)||!/^http:\/\/127\.0\.0\.1:\d+$/.test(base??''))throw new Error('Supply the existing temporary JS directory and isolated localhost origin');
const webpack=require(path.join(modules,'webpack')),config=require(path.join(root,'src/webpack.config.js'));
Object.assign(config,{context:path.join(root,'src'),mode:'development',devtool:'source-map'});
config.entry.acceptance=path.join(__dirname,'acceptance.js');
config.output.path=path.resolve(output);config.resolve.modules=[modules,'node_modules'];config.resolveLoader={modules:[modules,'node_modules']};
config.module.rules[0].options.compiler=path.join(root,'tools/proto/node_modules/typescript');
webpack(config,async(error,stats)=>{
  try {
    if(error||stats.hasErrors())throw error||new Error(stats.toString({all:false,errors:true}));
    const response=await fetch(base+'/'),html=await response.text();
    const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));
    const entry=/<script src="\/?js\/index\.[a-f0-9]+\.js"><\/script>/;
    if(!response.ok||!entry.test(html))throw new Error('Unexpected application shell');
    fs.writeFileSync(path.join(output,'acceptance.html'),html.replace('<head>','<head><base href="/">')
      .replace(entry,`<script src="/${manifest['js/acceptance.js']}"></script>`));
    fs.writeFileSync(path.join(output,'acceptance-control.json'),JSON.stringify({fundsReady:true,outcome:'success',indexReady:true}));
    console.log(base+'/js/acceptance.html?case=transfer-success');
  } catch(failure){console.error(failure);process.exitCode=1;}
});
