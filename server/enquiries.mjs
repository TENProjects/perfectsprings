import { getSelection } from '../src/products.mjs';
const encoder=new TextEncoder();
const WINDOW=15*60*1000;
const MAX_BODY=16000;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function base64url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function sign(secret,data){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return base64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(data))));}
function safeEqual(a,b){if(a.length!==b.length)return false;let result=0;for(let i=0;i<a.length;i++)result|=a.charCodeAt(i)^b.charCodeAt(i);return result===0;}
const clean=value=>typeof value==='string'?value.trim():'';
export function createEnquiryService({fetcher=fetch,now=()=>Date.now()}={}) {
 const attempts=new Map(); const successes=new Map(); const pending=new Map();
 function ready(env){return Boolean(env.RESEND_API_KEY && env.ENQUIRY_FROM && env.ENQUIRY_TO && env.FORM_SECRET);}
 function sweep(){const time=now();for(const [key,value]of attempts)if(time-value.start>WINDOW)attempts.delete(key);for(const [key,value]of successes)if(time-value.time>24*60*60*1000)successes.delete(key);}
 function rateLimit(key){sweep();if(attempts.size>5000&&!attempts.has(key))return true;const value=attempts.get(key)||{count:0,start:now()};value.count++;attempts.set(key,value);return value.count>6;}
 async function token(env){if(!ready(env))return json({error:'Online enquiries are being connected. Please call +234 905 780 5555 or email perfectspringwatersales@gmail.com.'},503);const data=`${now()}.${crypto.randomUUID()}`;return json({token:`${data}.${await sign(env.FORM_SECRET,data)}`});}
 async function submit(request,env) {
  if(!ready(env))return json({error:'Online enquiries are being connected. Please call +234 905 780 5555 or email perfectspringwatersales@gmail.com.'},503);
  const origin=request.headers.get('Origin');
  if(origin!==new URL(request.url).origin)return json({error:'Please submit your enquiry from this website.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Use the enquiry form to send your message.'},415);
  if(Number(request.headers.get('Content-Length'))>MAX_BODY)return json({error:'Your message is too long.'},413);
  let body;
  try {const reader=request.body?.getReader();if(!reader)throw new Error();let total=0;let chunks=[];while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>MAX_BODY){await reader.cancel();return json({error:'Your message is too long.'},413);}chunks.push(value);}const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}body=JSON.parse(new TextDecoder().decode(bytes));if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();}catch{return json({error:'We couldn’t read the enquiry. Please try again.'},400);}
  if(clean(body.website))return json({error:'We couldn’t send this enquiry. Please contact our team directly.'},400);
  const parts=clean(body.token).split('.');const timestamp=Number(parts[0]);const signedData=parts.slice(0,2).join('.');
  if(parts.length!==3||!Number.isFinite(timestamp)||timestamp>now()||now()-timestamp>WINDOW||!safeEqual(await sign(env.FORM_SECRET,signedData),parts[2]))return json({error:'Your form session expired. Please send again to refresh it.',code:'token_expired'},400);
  if(now()-timestamp<1200)return json({error:'Please take a moment to review your details, then send again.'},429);
  const kind=clean(body.kind);const data={kind,name:clean(body.name),email:clean(body.email),phone:clean(body.phone),message:clean(body.message),subject:clean(body.subject),business:clean(body.business),state:clean(body.state),city:clean(body.city),businessType:clean(body.businessType),product:clean(body.product),consent:body.consent};
  const invalid=!['contact','distributor'].includes(kind)||data.name.length<2||data.name.length>160||data.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||/[\r\n]/.test(data.email)||data.message.length<10||data.message.length>3000||data.consent!=='yes'||(data.phone&&(!/^[+\d\s().-]{7,30}$/.test(data.phone)||data.phone.replace(/\D/g,'').length<7))||(data.product&&!getSelection(data.product))||Object.values(data).some(v=>typeof v==='string'&&v.includes('\0'));
  if(invalid)return json({error:'Please check your name, email, message, phone number and consent.'},400);
  if(kind==='contact'&&!['general','sales','product','feedback'].includes(data.subject))return json({error:'Choose a valid enquiry subject.'},400);
  if(kind==='distributor'&&(!data.phone||data.business.length<2||data.business.length>160||data.state.length<2||data.state.length>160||data.city.length<2||data.city.length>160||!['Retailer','Wholesaler','Distributor','Hospitality','Other'].includes(data.businessType)))return json({error:'Please complete your business name, phone, location and business type.'},400);
  const id=clean(body.idempotencyKey);
  if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Please refresh the form and try again.'},400);
  const fingerprint=await sign(env.FORM_SECRET,JSON.stringify(data));
  const client=request.headers.get('CF-Connecting-IP')||'local';
  const clientHash=await sign(env.FORM_SECRET,client);
  const cached=successes.get(id);if(cached)return cached.fingerprint===fingerprint?json({ok:true}):json({error:'The enquiry changed. Please try sending it again.'},409);
  const inflight=pending.get(id);if(inflight)return inflight.fingerprint===fingerprint?inflight.promise.then(response=>response.clone()):json({error:'The enquiry changed. Please wait and try again.'},409);
  // One Node instance or one Worker isolate. Configure an edge rate limit for multi-instance production.
  if(rateLimit(clientHash))return json({error:'Too many enquiries. Please wait 15 minutes or contact us directly.'},429);
  if(pending.size>100||successes.size>5000)return json({error:'We’re busy right now. Please try again shortly.'},503);
  const promise=(async()=>{
   const product=getSelection(data.product)?.label||'Not specified';
   const text=[`Enquiry: ${kind}`,`Name: ${data.name}`,`Email: ${data.email}`,`Phone: ${data.phone||'Not supplied'}`,`Subject: ${data.subject||'Distributor application'}`,`Product: ${product}`,...(kind==='distributor'?[`Business: ${data.business}`,`Location: ${data.city}, ${data.state}`,`Type: ${data.businessType}`]:[]),'',data.message,'','Consent: permission to respond to this enquiry.'].join('\n');
   try {
    const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`perfectsprings-${id}-${fingerprint.slice(0,16)}`},body:JSON.stringify({from:env.ENQUIRY_FROM,to:[env.ENQUIRY_TO],reply_to:data.email,subject:kind==='distributor'?'Perfect Springs — Distributor application':`Perfect Springs — ${data.subject} enquiry`,text}),signal:AbortSignal.timeout(10000)});
    if(!response.ok){console.error(JSON.stringify({event:'enquiry_delivery_failed',status:response.status}));return json({error:'We couldn’t deliver your enquiry. Your details are still here. Please retry or contact us directly.'},502);}
    const receipt=await response.json();if(typeof receipt.id!=='string')throw new Error('Missing receipt');
    successes.set(id,{fingerprint,time:now()});return json({ok:true});
   } catch {console.error(JSON.stringify({event:'enquiry_delivery_unavailable'}));return json({error:'Delivery is temporarily unavailable. Your details are still here. Please retry or contact us directly.'},502);}finally{pending.delete(id);}
  })();
  pending.set(id,{fingerprint,promise});return promise;
 }
 return {token,submit};
}
