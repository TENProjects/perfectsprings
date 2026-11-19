// Independent of the main module: navigation never depends on the intro finishing.
(() => {
 const loader=document.querySelector('.brand-preloader');
 if(!loader)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const started=performance.now();
 let dismissed=false;
 function dismiss(){
  if(dismissed)return;dismissed=true;
  loader.classList.add('is-finished');
  loader.setAttribute('aria-hidden','true');
  setTimeout(()=>loader.remove(),reduced?0:320);
 }
 loader.querySelector('button').addEventListener('click',dismiss);
 // Restore browser history instantly, including back/forward-cache restores.
 addEventListener('pageshow',event=>{if(event.persisted)dismiss();});
 function ready(){setTimeout(dismiss,Math.max(0,(reduced?0:1250)-(performance.now()-started)));}
 if(document.readyState==='complete')ready();else addEventListener('load',ready,{once:true});
 setTimeout(dismiss,reduced?100:1900);
})();
