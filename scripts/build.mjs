import { writeFile, mkdir, rm, cp, readFile, readdir } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { render, pageNames } from '../src/site.mjs';
import { articles } from '../src/articles.mjs';
import { allVariants } from '../src/products.mjs';
import { createHash } from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const origin=process.env.SITE_URL || 'https://perfectspringsllc.com';
await mkdir(join(root,'journal'),{recursive:true});
await rm(join(root,'products'),{recursive:true,force:true});
await mkdir(join(root,'products'),{recursive:true});
for(const detail of allVariants) await writeFile(join(root,detail.path),render('products',{origin,detail}));
for (const page of pageNames) await writeFile(join(root,`${page}.html`),render(page,{origin}));
for (const article of articles) await writeFile(join(root,'journal',`${article.slug}.html`),render('blog',{origin,article}));
const paths=['',...pageNames.filter(p=>p!=='index').map(p=>`${p}.html`),...articles.map(a=>`journal/${a.slug}.html`),...allVariants.map(d=>d.path)];
await writeFile(join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${origin}/${p}</loc></url>`).join('')}</urlset>`);
await writeFile(join(root,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await rm(join(root,'dist'),{recursive:true,force:true});
await mkdir(join(root,'dist/server'),{recursive:true});
const files={};
const publicOutput=process.argv.includes('--public');
if(publicOutput)await mkdir(join(root,'dist/public'),{recursive:true});
async function add(path){const full=join(root,path);const stat=(await import('node:fs/promises')).stat; if((await stat(full)).isDirectory()){for(const entry of await readdir(full))await add(`${path}/${entry}`);}else{if(path.endsWith('-original.png'))return; const content=await readFile(full);if(publicOutput){const target=join(root,'dist/public',path);await mkdir(resolve(target,'..'),{recursive:true});await cp(full,target);}const scriptHashes=extname(path)==='.html'?[...content.toString().matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`).join(' '):'';files[`/${path}`]={scriptHashes,body:(await readFile(full)).toString('base64'),type:({'html':'text/html; charset=utf-8','css':'text/css; charset=utf-8','js':'text/javascript; charset=utf-8','mjs':'text/javascript; charset=utf-8','webp':'image/webp','xml':'application/xml','txt':'text/plain'})[extname(path).slice(1)]||'application/octet-stream'};}}
for(const p of [...pageNames.map(p=>`${p}.html`),'journal','products','style.css','theme.css','js','src/products.mjs','assets','sitemap.xml','robots.txt'])await add(p);
await writeFile(join(root,'dist/server/static.mjs'),`export default ${JSON.stringify(files)};`);
await writeFile(join(root,'dist/server/enquiries.mjs'), (await readFile(join(root,'server/enquiries.mjs'),'utf8')).replace('../src/products.mjs','./products.mjs'));
await cp(join(root,'src/products.mjs'),join(root,'dist/server/products.mjs'));
await cp(join(root,'server/worker.mjs'),join(root,'dist/server/index.js'));
try {await mkdir(join(root,'dist/.openai'),{recursive:true});await cp(join(root,'.openai/hosting.json'),join(root,'dist/.openai/hosting.json'));} catch(e){if(e.code!=='ENOENT')throw e;}
console.log(`Built ${pageNames.length+articles.length+allVariants.length} pages and ${Object.keys(files).length} assets. Worker output: dist/server/index.js`);

if(publicOutput)console.log('Public website files: dist/public');
