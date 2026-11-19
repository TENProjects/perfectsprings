import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { Readable } from 'node:stream';
import { createEnquiryService } from './enquiries.mjs';
const root=resolve(import.meta.dirname,'..');
const service=createEnquiryService();
const port=Number(process.env.PORT||4173);
const allowed=['.html','.css','.js','.mjs','.webp','.xml','.txt'];
const server=http.createServer(async(req,res)=>{
 try{
  const origin=`http://${req.headers.host}`;const url=new URL(req.url,origin);
  const request=new Request(url,{method:req.method,headers:{...req.headers,'cf-connecting-ip':req.socket.remoteAddress},...(req.method==='POST'?{body:Readable.toWeb(req),duplex:'half'}:{})});
  let response;
  if(url.pathname==='/api/enquiry-token')response=req.method==='GET'?await service.token(process.env):new Response('Method not allowed',{status:405});
  else if(url.pathname==='/api/enquiries')response=req.method==='POST'?await service.submit(request,process.env):new Response('Method not allowed',{status:405});
  else if(!['GET','HEAD'].includes(req.method))response=new Response('Method not allowed',{status:405});
  else {
   const path=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
   const file=resolve(root,`.${path}`);
   const permitted=(path.startsWith('/assets/')&&!path.endsWith('-original.png'))||path==='/style.css'||path==='/js/script.js'||path==='/src/products.mjs'||/^\/(?:index|products|about|blog|contact|distributor|privacy)\.html$/.test(path)||/^\/(?:journal|products)\/[a-z-]+\.html$/.test(path)||['/sitemap.xml','/robots.txt'].includes(path);
   if(!permitted||!file.startsWith(`${root}/`)||!allowed.includes(extname(file)))response=new Response('Not found',{status:404});
   else {const bytes=await readFile(file);response=new Response(req.method==='HEAD'?null:bytes,{headers:{'Content-Type':{'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain'}[extname(file)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'}});}
  }
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(error){res.writeHead(error.code==='ENOENT'?404:500,{'Content-Type':'text/plain'});res.end(error.code==='ENOENT'?'Not found':'Request unavailable');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Perfect Springs: http://localhost:${port}`));
