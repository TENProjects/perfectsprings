import assets from './static.mjs';
import { createEnquiryService } from './enquiries.mjs';
const service=createEnquiryService();
export default {async fetch(request,env){
 const url=new URL(request.url);const path=url.pathname;
 if(path==='/api/enquiry-token')return request.method==='GET'?service.token(env):new Response('Method not allowed',{status:405,headers:{Allow:'GET'}});
 if(path==='/api/enquiries')return request.method==='POST'?service.submit(request,env):new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[path==='/'?'/index.html':path];
 if(!asset)return new Response('Page not found. Return to the homepage.',{status:404,headers:{'Content-Type':'text/plain'}});
 const bytes=Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0));
 return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':asset.type.startsWith('image/')?'public,max-age=86400':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self' 'sha256-PLACEHOLDER'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"}});
}};
