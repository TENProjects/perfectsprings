import { products, getProduct, getSelection, imagePath } from '../src/products.mjs';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Only predefined, non-personal values leave the interaction layer.
function track(event, values = {}) {
  window.dispatchEvent(new CustomEvent('perfectsprings:analytics', { detail: { event, ...values } }));
}
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function setMenu(open) {
  navigation.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
}
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navigation?.addEventListener('keydown', e => {
  if (e.key === 'Escape') { setMenu(false); menu.focus(); }
  if (e.key === 'Tab' && menu.getAttribute('aria-expanded') === 'true') {
    const links = [...navigation.querySelectorAll('a')];
    if (e.shiftKey && document.activeElement === links[0]) { e.preventDefault(); menu.focus(); }
    else if (!e.shiftKey && document.activeElement === links.at(-1)) { e.preventDefault(); menu.focus(); }
  }
});
menu?.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMenu(false);
  if (e.key === 'Tab' && e.shiftKey && menu.getAttribute('aria-expanded') === 'true') {
    e.preventDefault(); navigation.querySelector('a:last-child').focus();
  }
});
document.addEventListener('click', e => { if (navigation?.classList.contains('open') && !e.target.closest('.nav-wrap')) setMenu(false); });
navigation?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
matchMedia('(min-width: 851px)').addEventListener('change', e => { if(e.matches) setMenu(false); });

// Keep markup visible by default. Observe only small decorative blocks below the fold.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('waiting'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.values-grid article,.application-steps li,.moments-image,.journal-image').forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('reveal', 'waiting'); observer.observe(el); }
  });
  reducedMotion.addEventListener('change', e => { if(e.matches){document.querySelectorAll('.waiting').forEach(el=>el.classList.remove('waiting'));observer.disconnect();} });
}

// A preload-and-swap avoids displaying a previous flavour under a new name.
let spotlightVersion = 0;
for (const button of document.querySelectorAll('[data-spotlight]')) button.addEventListener('click', async () => {
  const id = button.dataset.spotlight;
  const flavour = getProduct('cast').flavours.find(f => f.id === id);
  const version = ++spotlightVersion;
  const image = document.querySelector('.spotlight-image');
  const preload = new Image(); preload.src = imagePath(id);
  try { await preload.decode(); } catch { return; }
  if (version !== spotlightVersion) return;
  if(!reducedMotion.matches) image.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
  image.src = preload.src; image.alt = `Cast Natural ${flavour.name}`;
  document.querySelector('.spotlight').style.setProperty('--flavour', flavour.colour);
  document.querySelector('.outline-word').textContent = flavour.name.toUpperCase();
  document.querySelector('.flavour-note').textContent = flavour.note;
  document.querySelector('#spotlight-link').href = `products.html?drink=cast&flavour=${id}#explorer`;
  document.querySelectorAll('[data-spotlight]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  track('flavour_selected', { product: 'cast', flavour: id });
});

let selectedProduct = getProduct('water');
let selectedFlavour = selectedProduct.flavours[0];
let productVersion = 0;
const explorer = document.querySelector('#explorer');
function updateURL() {
  const url = new URL(location.href);
  url.searchParams.set('drink', selectedProduct.id);
  url.searchParams.set('flavour', selectedFlavour.id);
  history.replaceState(null, '', url);
}
async function selectProduct(productId, flavourId, updateHistory = true) {
  if (!explorer) return;
  const product = getProduct(productId) || getProduct('water');
  const flavour = product.flavours.find(f=>f.id===flavourId) || product.flavours[0];
  const version = ++productVersion;
  const preload = new Image(); preload.src = imagePath(flavour.id);
  try { await preload.decode(); } catch { return; }
  if(version !== productVersion) return;
  selectedProduct = product; selectedFlavour = flavour;
  document.querySelector('#explorer-title').textContent = product.name;
  document.querySelector('#explorer-description').textContent = product.description;
  document.querySelector('#explorer-note').textContent = flavour.note;
  const image = document.querySelector('.explorer-product');
  if(!reducedMotion.matches) image.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
  image.src = preload.src; image.alt = `${product.name} ${flavour.name}`;
  explorer.style.setProperty('--flavour', flavour.colour || product.colour);
  const options = document.querySelector('.explorer-options');
  options.replaceChildren(...product.flavours.map(f => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.flavour = f.id;
    b.textContent = f.name; b.setAttribute('aria-pressed',String(f.id===flavour.id));
    b.addEventListener('click',()=>{selectProduct(product.id,f.id);track('flavour_selected',{product:product.id,flavour:f.id});});
    return b;
  }));
  document.querySelector('#product-enquiry').href = `contact.html?subject=product&product=${encodeURIComponent(`${product.id}:${flavour.id}`)}`;
  if(updateHistory) updateURL();
}
if(explorer) {
  for(const a of document.querySelectorAll('[data-product]')) a.addEventListener('click',()=>{selectProduct(a.dataset.product);track('product_explored',{product:a.dataset.product});});
  function filter(category, updateHistory=true) {
    const buttons=[...document.querySelectorAll('[data-filter]')];
    if(!buttons.some(b=>b.dataset.filter===category)) category='all';
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
    let count=0;
    document.querySelectorAll('.catalog .product-card').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden)count++;});
    document.querySelector('#filter-status').textContent=`${count} product ${count===1?'family':'families'} shown`;
    if(category!=='all'&&selectedProduct.category!==category) selectProduct(products.find(p=>p.category===category).id,undefined,false);
    if(updateHistory){const u=new URL(location.href);u.searchParams.set('category',category);history.replaceState(null,'',u);}
    track('category_selected',{category});
  }
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));
  const params=new URLSearchParams(location.search);
  filter(params.get('category') || 'all',false);
  if(params.has('drink')) selectProduct(params.get('drink'),params.get('flavour'),false);
}

const form=document.querySelector('.enquiry-form');
if(form) {
  const status=form.querySelector('.form-status');
  const submit=form.querySelector('button[type=submit]');
  const submitText=submit.textContent;
  const params=new URLSearchParams(location.search);
  const selection=getSelection(params.get('product'));
  if(selection) form.elements.product.value=`${selection.product.id}:${selection.flavour.id}`;
  if(form.elements.subject && ['general','sales','product','feedback'].includes(params.get('subject'))) form.elements.subject.value=params.get('subject');
  let tokenPromise=null;
  let submitted=false;
  let payloadSnapshot='';
  function setStatus(text,state=''){status.textContent=text;status.dataset.state=state;}
  function ensureToken(){
    if(!tokenPromise) tokenPromise=fetch('/api/enquiry-token',{headers:{Accept:'application/json'}}).then(async r=>{
      const data=await r.json();if(!r.ok)throw new Error(data.error || 'Online enquiries are temporarily unavailable. Please call or email our team.');
      form.elements.token.value=data.token;return data;
    }).catch(error=>{tokenPromise=null;throw error;});
    return tokenPromise;
  }
  form.addEventListener('focusin',()=>{ensureToken().catch(()=>{});if(!submitted){track('enquiry_started',{kind:form.dataset.kind});submitted=true;}},{once:true});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    submit.disabled=true;submit.textContent='Sending…';setStatus('Sending your enquiry…');
    try {
      await ensureToken();
      const data=Object.fromEntries(new FormData(form));
      const snapshot=JSON.stringify({...data,token:undefined,idempotencyKey:undefined});
      if(snapshot!==payloadSnapshot || !form.elements.idempotencyKey.value){form.elements.idempotencyKey.value=crypto.randomUUID();payloadSnapshot=snapshot;}
      data.idempotencyKey=form.elements.idempotencyKey.value;
      const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(18000)});
      const result=await response.json();
      if(!response.ok){if(result.code==='token_expired'){tokenPromise=null;form.elements.token.value='';}throw new Error(result.error || 'We couldn’t send your enquiry. Please try again or contact us directly.');}
      setStatus('Thank you. Your enquiry has been sent to our team.','success');
      track('enquiry_submitted',{kind:form.dataset.kind});
      form.reset();form.elements.token.value='';form.elements.idempotencyKey.value='';tokenPromise=null;payloadSnapshot='';
    }catch(error){setStatus(error.name==='TimeoutError'?'The request took too long. Your details are still here. Please retry or contact us directly.':error.message,'error');track('enquiry_failed',{kind:form.dataset.kind});}
    finally{submit.disabled=false;submit.textContent=submitText;}
  });
}

// Swipeable product collections: native scroll snap, category switches and an image wipe.
const collectionTrack=document.querySelector('#collection-track');
if(collectionTrack){
 const previous=document.querySelector('.carousel-control.previous');
 const next=document.querySelector('.carousel-control.next');
 let activeCollection=getProduct('cast');
 function updateControls(){
  const max=collectionTrack.scrollWidth-collectionTrack.clientWidth;
  previous.disabled=collectionTrack.scrollLeft<=2;
  next.disabled=collectionTrack.scrollLeft>=max-2;
 }
 function campaignImage(product){return `assets/campaign/${product.id==='water'?'water-splash.webp':'gathering-small.webp'}`;}
 function slide(product,flavour){
  const article=document.createElement('article');article.className='collection-slide';article.style.setProperty('--card',flavour.colour||product.colour);
  const a=document.createElement('a');a.href=`products.html?drink=${product.id}&flavour=${flavour.id}#explorer`;a.setAttribute('aria-label',`Explore ${product.name} ${flavour.name}`);
  const art=document.createElement('div');art.className='collection-packshot';
  const image=document.createElement('img');image.src=imagePath(flavour.id);image.alt=`${product.name} ${flavour.name}`;image.width=640;image.height=850;image.loading='lazy';
  const campaign=document.createElement('div');campaign.className='collection-campaign';campaign.setAttribute('aria-hidden','true');
  const photo=document.createElement('img');photo.src=campaignImage(product);photo.alt='';photo.width=700;photo.height=467;photo.loading='lazy';
  const caption=document.createElement('span');caption.className='campaign-caption';caption.textContent=flavour.note;
  const action=document.createElement('span');action.className='collection-action';action.textContent='Explore this drink';
  campaign.append(photo,caption,action);art.append(image,campaign);
  const label=document.createElement('div');label.className='collection-label';
  const family=document.createElement('p');family.className='eyebrow';family.textContent=product.name;
  const title=document.createElement('h3');title.textContent=flavour.name;
  const touch=document.createElement('span');touch.className='touch-explore';touch.textContent='Explore this drink';label.append(family,title,touch);
  a.append(art,label);article.append(a);return article;
 }
 document.querySelectorAll('[data-collection]').forEach(button=>button.addEventListener('click',()=>{
  activeCollection=getProduct(button.dataset.collection);
  document.querySelectorAll('[data-collection]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  collectionTrack.replaceChildren(...activeCollection.flavours.map(f=>slide(activeCollection,f)));
  collectionTrack.setAttribute('aria-label',`${activeCollection.name} drinks`);
  collectionTrack.scrollTo({left:0,behavior:'instant'});
  document.querySelector('#collection-description').textContent=`${activeCollection.name} · ${activeCollection.type}`;
  document.querySelector('.carousel-status').textContent=`Explore ${activeCollection.flavours.length} ${activeCollection.name} ${activeCollection.flavours.length===1?'drink':'flavours'}`;
  updateControls();track('collection_selected',{product:activeCollection.id});
 }));
 function move(direction){const first=collectionTrack.querySelector('.collection-slide');const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(collectionTrack).gap);const count=Math.max(1,Math.floor(collectionTrack.clientWidth/step)-1);collectionTrack.scrollBy({left:direction*step*count,behavior:reducedMotion.matches?'instant':'smooth'});}
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 collectionTrack.addEventListener('scroll',updateControls,{passive:true});
 collectionTrack.addEventListener('keydown',event=>{if(event.target!==collectionTrack)return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
 new ResizeObserver(updateControls).observe(collectionTrack);updateControls();
}
