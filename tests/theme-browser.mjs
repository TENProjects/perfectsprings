import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {allVariants} from '../src/products.mjs';
const browser=await chromium.launch();const failures=[];let checks=0;
const origin=process.env.QA_URL||'http://localhost:4173';
const paths=['index.html','products.html','about.html','blog.html','contact.html','distributor.html','privacy.html','journal/meet-the-range.html','journal/become-a-distributor.html','journal/choose-your-flavour.html',...allVariants.map(v=>v.path)];
await mkdir('qa/themes',{recursive:true});
for(const theme of ['light','dark'])for(const width of [360,390,768,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'});const p=await context.newPage();p.on('pageerror',e=>failures.push({theme,width,error:e.message}));
 for(const path of paths){
  const response=await p.goto(`${origin}/${path}`,{waitUntil:'networkidle'});
  const state=await p.evaluate(()=>({theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,toggles:document.querySelectorAll('.theme-toggle').length,pressed:document.querySelector('.theme-toggle').getAttribute('aria-pressed'),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),inverted:[...document.images].some(i=>getComputedStyle(i).filter.includes('invert'))}));
  if(response.status()!==200||state.theme!==theme||state.overflow||state.toggles!==1||state.pressed!==String(theme==='dark')||state.broken.length||state.inverted)failures.push({path,width,expected:theme,...state});checks++;
  if([390,1440].includes(width)&&['index.html','about.html','contact.html','products/cast-mango.html'].includes(path))await p.screenshot({path:`qa/themes/${theme}-${width}-${path.replaceAll('/','-')}.png`,fullPage:true});
 }
 await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'light',reducedMotion:'reduce'});const p=await context.newPage();
await p.goto(origin);await p.emulateMedia({colorScheme:'dark'});await p.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
const toggle=p.getByRole('button',{name:'Switch to light mode',exact:true});await toggle.focus();await p.keyboard.press('Space');await p.waitForFunction(()=>document.documentElement.dataset.theme==='light');
if(await p.evaluate(()=>localStorage.getItem('perfectsprings-theme'))!=='light')failures.push('Theme choice not saved');
await p.goto(`${origin}/products/cast-mango.html`);if(await p.locator('html').getAttribute('data-theme')!=='light')failures.push('Saved theme lost during navigation');
await p.getByRole('button',{name:'Switch to dark mode',exact:true}).click();await p.reload();if(await p.locator('html').getAttribute('data-theme')!=='dark')failures.push('Saved dark theme lost after reload');
const second=await context.newPage();await second.goto(`${origin}/about.html`);await second.getByRole('button',{name:'Switch to light mode',exact:true}).click();await p.waitForFunction(()=>document.documentElement.dataset.theme==='light');
await context.close();
const unavailable=await browser.newContext({colorScheme:'dark',reducedMotion:'reduce'});await unavailable.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Storage blocked')};Storage.prototype.setItem=()=>{throw Error('Storage blocked')};});const u=await unavailable.newPage();await u.goto(origin);await u.getByRole('button',{name:'Switch to light mode',exact:true}).click();if(await u.locator('html').getAttribute('data-theme')!=='light')failures.push('Theme toggle failed without storage');await unavailable.close();
await writeFile('qa/themes/report.json',JSON.stringify({pageViewportThemeChecks:checks,behaviourChecks:7,failures},null,2));console.log(JSON.stringify({pageViewportThemeChecks:checks,behaviourChecks:7,failures},null,2));await browser.close();if(failures.length)process.exitCode=1;
