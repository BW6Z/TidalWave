const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = { '/scene.js':['scene.js','text/javascript'], '/': ['index.html','text/html'], '/index.html':['index.html','text/html'], '/style.css':['style.css','text/css'], '/simulation.js':['simulation.js','text/javascript'], '/app.js':['app.js','text/javascript'] };
const server=http.createServer((req,res)=>{
  const file=files[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':file[1]+'; charset=utf-8','Cache-Control':'no-cache'});
  fs.createReadStream(path.join(root,file[0])).pipe(res);
});
server.listen(Number(process.env.PORT || 5173),'127.0.0.1',()=>console.log(`Tidal Wave: http://127.0.0.1:${server.address().port}`));
