import {cp,mkdir,readFile,readdir,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const sourceOrigin=(process.env.SITE_URL||'https://perfectspringsllc.com').replace(/\/$/,'');
const pagesOrigin=(process.env.PAGES_URL||'https://tenprojects.github.io/perfectsprings').replace(/\/$/,'');
process.env.SITE_URL=sourceOrigin;
process.argv.push('--public');
await import('./build.mjs');
const target=join(root,'dist/pages');await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});
await cp(join(root,'dist/public'),target,{recursive:true});
async function transform(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await transform(path);else if(entry.name.endsWith('.html')){let html=await readFile(path,'utf8');html=html.replaceAll(sourceOrigin,pagesOrigin).replace('<body>','<body data-static-preview="true">').replace('<meta name="viewport"','<meta name="robots" content="noindex,nofollow"><meta name="viewport"');await writeFile(path,html);}}}
await transform(target);
await writeFile(join(target,'sitemap.xml'),(await readFile(join(target,'sitemap.xml'),'utf8')).replaceAll(sourceOrigin,pagesOrigin));
await writeFile(join(target,'robots.txt'),'User-agent: *\nDisallow: /\n');
await writeFile(join(target,'.nojekyll'),'');
console.log(`GitHub Pages preview: dist/pages\nPreview URL: ${pagesOrigin}/\nEnquiry submission is disabled in this static preview.`);
