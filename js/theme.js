// Runs before styles paint so the saved theme is used on every page.
(() => {
 const root=document.documentElement;
 const system=matchMedia('(prefers-color-scheme: dark)');
 const key='perfectsprings-theme';
 let saved=null;
 try {const value=localStorage.getItem(key);if(value==='light'||value==='dark')saved=value;}catch{}
 function apply(theme){
  root.dataset.theme=theme;
  root.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0c211d':'#faf7ee');
  document.querySelectorAll('.theme-toggle').forEach(button=>{
   const label=theme==='dark'?'Switch to light mode':'Switch to dark mode';
   button.setAttribute('aria-label',label);button.title=label;
   button.setAttribute('aria-pressed',String(theme==='dark'));
  });
 }
 apply(saved||(system.matches?'dark':'light'));
 system.addEventListener('change',event=>{if(!saved)apply(event.matches?'dark':'light');});
 addEventListener('storage',event=>{if(event.key===key){saved=event.newValue==='dark'||event.newValue==='light'?event.newValue:null;apply(saved||(system.matches?'dark':'light'));}});
 document.addEventListener('DOMContentLoaded',()=>{
  apply(root.dataset.theme);
  document.querySelectorAll('.theme-toggle').forEach(button=>button.addEventListener('click',()=>{
   saved=root.dataset.theme==='dark'?'light':'dark';
   try{localStorage.setItem(key,saved);}catch{}
   apply(saved);
  }));
 },{once:true});
})();
