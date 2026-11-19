import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { allVariants } from '../src/products.mjs';
const browser=await chromium.launch({headless:true});
const results=[];const failures=[];
const out=resolve(process.env.QA_OUTPUT||'qa');await mkdir(out,{recursive:true});
const pages=['index.html','products.html','about.html','blog.html','contact.html','distributor.html','privacy.html','journal/meet-the-range.html','journal/become-a-distributor.html','journal/choose-your-flavour.html',...allVariants.map(d=>d.path)];
for(const width of [360,390,768,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();
 page.on('pageerror',e=>failures.push({width,error:e.message}));
 for(const path of pages){
  await page.goto(`http://localhost:4173/${path}`,{waitUntil:'networkidle'});
  const state=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('h1').length}));
  if(state.scroll>width||state.broken.length||state.h1!==1)failures.push({width,path,...state});
  results.push({width,path,...state});
  if((width===390||width===1440)&&['products/cast-mango.html','products/dna-dna-original.html','products/water-water.html'].includes(path))await page.screenshot({path:`${out}/${path.replace('.html','')}-${width}.png`,fullPage:true});
 }
 await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
await page.goto('http://localhost:4173/');await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('link',{name:'Our drinks',exact:true}).first().focus();await page.keyboard.press('Escape');if(await page.getByRole('button',{name:'Open menu',exact:true}).getAttribute('aria-expanded')!=='false')failures.push('Escape did not close mobile menu');
await page.locator('[data-spotlight="strawberry"]').click();await page.waitForFunction(()=>document.querySelector('.spotlight-image').src.includes('strawberry'));if(!await page.locator('#spotlight-link').getAttribute('href').then(v=>v.includes('strawberry')))failures.push('Spotlight link mismatch');
// Evidence-based collection section: arrows, categories, focus reveal and correct destinations.
await page.locator('#collections').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Next drinks',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#collection-track').scrollLeft>0);
await page.getByRole('button',{name:'Previous drinks',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#collection-track').scrollLeft<3);
await page.getByRole('button',{name:'Springles',exact:true}).click();if(await page.locator('.collection-slide').count()!==4)failures.push('Collection category did not switch');if(await page.locator('#collection-track').getAttribute('aria-label')!=='Springles drinks')failures.push('Collection accessible label mismatch');
await page.getByRole('button',{name:'ROW',exact:true}).click();if(!await page.getByRole('button',{name:'Next drinks',exact:true}).isDisabled())failures.push('Single product collection next should be disabled');
await page.goto('http://localhost:4173/products.html');
await page.getByRole('button',{name:'Juices',exact:true}).click();
if(await page.locator('.catalog .product-card:visible').count()!==1)failures.push('Juice filter failed');
await page.locator('.catalog .product-card:visible a').click();
await page.waitForURL('**/products/cast-mango.html');
if(await page.locator('h1').textContent()!=='Cast Natural Mango')failures.push('Catalogue did not open Mango detail page');
await page.locator('.detail-flavour-links').getByRole('link',{name:'Strawberry',exact:true}).click();
await page.waitForURL('**/products/cast-strawberry.html');
if(await page.locator('h1').textContent()!=='Cast Natural Strawberry')failures.push('Sibling flavour link did not open the matching page');
await page.locator('.detail-actions').getByRole('link',{name:'Enquire about this drink',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('select[name="product"]')?.value==='cast:strawberry');
if(await page.locator('select[name="product"]').inputValue()!=='cast:strawberry')failures.push('Enquiry product context lost');
await page.getByLabel('Your name',{exact:false}).fill('Browser Test');await page.getByLabel('Email address').fill('test@example.test');await page.getByLabel('Your message').fill('Please confirm pack information for this drink.');await page.locator('[name=consent]').check();await page.getByRole('button',{name:'Send message',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.form-status').dataset.state==='error');if(await page.locator('[name=message]').inputValue()!=='Please confirm pack information for this drink.')failures.push('Form data lost on failure');
// Mock success contract; no live email is sent.
await page.route('**/api/enquiry-token',r=>r.fulfill({json:{token:'test-token'}}));await page.route('**/api/enquiries',r=>r.fulfill({json:{ok:true}}));await page.getByRole('button',{name:'Send message',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.form-status').dataset.state==='success');if(await page.locator('[name=message]').inputValue()!=='')failures.push('Successful form did not reset');
await writeFile(`${out}/browser-report.json`,JSON.stringify({checks:results.length,results,failures},null,2));
console.log(JSON.stringify({pageViewportChecks:results.length,interactionChecks:13,failures},null,2));
await browser.close();if(failures.length)process.exitCode=1;
