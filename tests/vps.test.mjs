import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {once} from 'node:events';
const root=resolve(import.meta.dirname,'..');
async function start(t,proxy){
 const dir=await mkdtemp(join(tmpdir(),'perfectsprings-public-'));await writeFile(join(dir,'index.html'),'<h1>Public build</h1>');
 const stub='data:text/javascript,'+encodeURIComponent(`globalThis.fetch=async()=>new Response(JSON.stringify({id:'stub-receipt'}),{status:200})`);
 const child=spawn(process.execPath,['--import',stub,'server/index.mjs'],{cwd:root,env:{...process.env,PORT:'0',PUBLIC_DIR:dir,TRUST_PROXY:String(proxy),SITE_URL:'https://perfectspringsllc.com',RESEND_API_KEY:'test-only',ENQUIRY_FROM:'test@example.test',ENQUIRY_TO:'sales@example.test',FORM_SECRET:'test-only-vps-secret'}});
 t.after(async()=>{child.kill();await once(child,'exit');await rm(dir,{recursive:true,force:true});});
 const origin=await new Promise((resolve,reject)=>{child.stdout.on('data',data=>{const url=String(data).match(/http:\/\/localhost:\d+/);if(url)resolve(url[0]);});child.on('error',reject);child.on('exit',code=>reject(Error(`Server exited: ${code}`)));});
 return origin;
}
test('VPS server serves only its configured public directory',async t=>{
 const origin=await start(t,true);assert.equal(await(await fetch(origin)).text(),'<h1>Public build</h1>');
 for(const path of ['/package.json','/.env','/server/index.mjs','/assets/../../package.json'])assert.equal((await fetch(origin+path)).status,404,path);
});
test('trusted local proxy preserves HTTPS origin and separates real client rate limits',async t=>{
 const origin=await start(t,true),{token}=await(await fetch(origin+'/api/enquiry-token')).json();await new Promise(r=>setTimeout(r,1300));
 const send=ip=>fetch(origin+'/api/enquiries',{method:'POST',headers:{Origin:'https://perfectspringsllc.com','Content-Type':'application/json','X-Real-IP':ip,'CF-Connecting-IP':crypto.randomUUID()},body:JSON.stringify({token,kind:'contact',name:'VPS Test',email:'vps@example.test',subject:'general',message:'A local stub delivery test.',consent:'yes',idempotencyKey:crypto.randomUUID()})});
 for(let i=0;i<6;i++)assert.equal((await send('192.0.2.1')).status,200);
 assert.equal((await send('192.0.2.1')).status,429);assert.equal((await send('192.0.2.2')).status,200);
});
test('without trusted-proxy mode forwarded headers cannot change the origin',async t=>{
 const origin=await start(t,false);const request=site=>fetch(origin+'/api/enquiries',{method:'POST',headers:{Origin:site,'Content-Type':'application/json','X-Forwarded-Proto':'https','X-Real-IP':'192.0.2.1'},body:'{}'});
 assert.equal((await request('https://perfectspringsllc.com')).status,403);assert.equal((await request(origin)).status,400);
});
