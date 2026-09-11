/* TONY Web Runtime — browser-first capability library.
 * No Node.js dependency. Exposes safe, composable primitives through window.TONYWeb.
 * Privileged operations remain server-side; this layer handles everything the browser can.
 */
(() => {
  const events = new EventTarget();
  const emit = (type, detail={}) => events.dispatchEvent(new CustomEvent(type,{detail}));
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const uid = (p='tony') => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const text = el => (el?.innerText || el?.textContent || '').replace(/\s+/g,' ').trim();

  const dom = {
    $(s,r=document){ return r.querySelector(s); },
    $$(s,r=document){ return [...r.querySelectorAll(s)]; },
    create(tag, attrs={}, children=[]){ const e=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==='class')e.className=v; else if(k==='text')e.textContent=v; else e.setAttribute(k,v); } for(const c of children)e.append(c); return e; },
    on(target,type,fn,opts){ target.addEventListener(type,fn,opts); return ()=>target.removeEventListener(type,fn,opts); },
    observe(target,fn,opts){ const o=new MutationObserver(fn); o.observe(target,opts||{childList:true,subtree:true}); return ()=>o.disconnect(); },
    visible(el){ if(!el)return false; const r=el.getBoundingClientRect(),s=getComputedStyle(el); return !!(r.width&&r.height&&s.display!=='none'&&s.visibility!=='hidden'); },
    rect(el){ const r=el?.getBoundingClientRect(); return r?{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,left:r.left,right:r.right,bottom:r.bottom}:null; },
    findLabel(label){ const q=String(label||'').toLowerCase(); return this.$$('input,textarea,select,button,[contenteditable="true"]').find(el=>text(el.getAttribute('aria-label')||'').toLowerCase()===q||text(this.$(`label[for="${CSS.escape(el.id||'__none__')}"]`)).toLowerCase()===q); }
  };

  const storage = {
    get(k,fallback=null){ try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback;} },
    set(k,v){ localStorage.setItem(k,JSON.stringify(v)); emit('storage',{key:k,value:v}); return v; },
    remove(k){localStorage.removeItem(k);},
    session(k,fallback=null){try{return JSON.parse(sessionStorage.getItem(k))??fallback}catch{return fallback;}},
    sessionSet(k,v){sessionStorage.setItem(k,JSON.stringify(v));return v;}
  };

  const clipboard = {
    async read(){ if(!navigator.clipboard?.readText)throw new Error('Clipboard read unavailable'); return navigator.clipboard.readText(); },
    async write(value){ if(!navigator.clipboard?.writeText)throw new Error('Clipboard write unavailable'); await navigator.clipboard.writeText(String(value)); return true; }
  };

  const files = {
    bytes(n){ const u=['B','KB','MB','GB'];let i=0,x=n;while(x>=1024&&i<u.length-1){x/=1024;i++;}return `${x.toFixed(i?1:0)} ${u[i]}`; },
    async read(file){ return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsText(file);}); },
    async dataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file);});},
    async hash(file){const b=await file.arrayBuffer(),h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');},
    describe(file){return {id:uid('file'),name:file.name,type:file.type||'application/octet-stream',size:file.size,lastModified:file.lastModified};},
    download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},
    async exportJSON(value,name='tony-export.json'){this.download(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),name);}
  };

  const net = {
    async request(url,opts={}){ const r=await fetch(url,{...opts,headers:{Accept:'application/json',...(opts.body&&typeof opts.body!=='string'?{'content-type':'application/json'}:{}),...(opts.headers||{})},body:opts.body&&typeof opts.body!=='string'?JSON.stringify(opts.body):opts.body}); const ct=r.headers.get('content-type')||'';const d=ct.includes('json')?await r.json():await r.text();if(!r.ok)throw new Error(d?.error||d||`HTTP ${r.status}`);return d; },
    get(url){return this.request(url);},
    post(url,body){return this.request(url,{method:'POST',body});},
    put(url,body){return this.request(url,{method:'PUT',body});},
    delete(url){return this.request(url,{method:'DELETE'});},
    stream(url,onChunk){return fetch(url).then(async r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);const rd=r.body?.getReader();if(!rd)return;const dec=new TextDecoder();for(;;){const {value,done}=await rd.read();if(done)break;onChunk(dec.decode(value,{stream:true}));}})}
  };

  const navigation = {
    go(url){location.href=url;}, back(){history.back();}, forward(){history.forward();}, reload(){location.reload();},
    url(){return location.href;}, open(url,target='_blank'){return window.open(url,target,'noopener,noreferrer');},
    query(){return Object.fromEntries(new URLSearchParams(location.search));},
    setQuery(values){const u=new URL(location.href);for(const [k,v] of Object.entries(values))v==null?u.searchParams.delete(k):u.searchParams.set(k,v);history.pushState({},'',u);return u.toString();}
  };

  const forms = {
    fields(root=document){return dom.$$('input,textarea,select,[contenteditable="true"]',root).map(el=>({el,name:el.name,label:el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.name||'',type:el.type||el.tagName.toLowerCase(),value:el.value??text(el),required:el.required,disabled:el.disabled}));},
    set(el,value){ if(!el)return false; if(el.isContentEditable){el.textContent=String(value);} else if(el.tagName==='SELECT'){const o=[...el.options].find(x=>x.value===String(value)||x.textContent.trim().toLowerCase()===String(value).toLowerCase());if(o)el.value=o.value;else el.value=String(value);} else {const proto=Object.getPrototypeOf(el);const d=Object.getOwnPropertyDescriptor(proto,'value');d?.set?d.set.call(el,String(value)):el.value=String(value);} el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true; },
    get(el){return el?.value??text(el);},
    validate(root=document){return this.fields(root).map(f=>({label:f.label,valid:f.el.checkValidity?.()??true,value:f.value,required:f.required}));},
    submit(form){if(!form)throw new Error('Form not found');form.requestSubmit?form.requestSubmit():form.submit();}
  };

  const interaction = {
    async click(el){if(typeof el==='string')el=dom.$(el);if(!el)throw new Error('Element not found');el.scrollIntoView({block:'center'});el.click();await sleep(40);emit('click',{element:el});return true;},
    type(el,value){return forms.set(typeof el==='string'?dom.$(el):el,value);},
    async key(el,key){(typeof el==='string'?dom.$(el):el)?.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));await sleep(20);},
    scroll(y){window.scrollTo({top:y,behavior:'smooth'});},
    async waitFor(selector,timeout=10000){const start=Date.now();while(Date.now()-start<timeout){const el=dom.$(selector);if(el)return el;await sleep(100);}throw new Error(`Timed out waiting for ${selector}`);}
  };

  const observe = {
    page(){return {title:document.title,url:location.href,text:text(document.body).slice(0,20000),links:dom.$$('a').slice(0,200).map(a=>({text:text(a),href:a.href})),controls:dom.$$('button,input,textarea,select,[contenteditable="true"]').slice(0,300).map(e=>({tag:e.tagName,type:e.type||'',label:e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.name||text(e),value:e.value||''}))};},
    screenshot(){return new Promise(resolve=>{if(!document.documentElement)return resolve(null);resolve(null);});}
  };

  const commands = new Map();
  const command = {
    register(name,fn,meta={}){commands.set(name,{fn,meta});return ()=>commands.delete(name);},
    list(){return [...commands].map(([name,v])=>({name,...v.meta}));},
    async run(name,...args){const c=commands.get(name);if(!c)throw new Error(`Unknown command: ${name}`);emit('command',{name,args});return c.fn(...args);}
  };

  const ui = {
    toast(message,ms=2200){let e=dom.$('#tony-runtime-toast');if(!e){e=dom.create('div',{id:'tony-runtime-toast',class:'tony-runtime-toast'});document.body.append(e);Object.assign(e.style,{position:'fixed',left:'50%',bottom:'120px',transform:'translateX(-50%)',zIndex:99999,padding:'10px 14px',borderRadius:'10px',background:'#18181b',color:'#fff',font:'14px system-ui',boxShadow:'0 8px 30px #0002'});}e.textContent=message;e.hidden=false;clearTimeout(e._t);e._t=setTimeout(()=>e.hidden=true,ms);},
    modal(title,body,actions=[]){const b=dom.create('div',{class:'tony-modal-backdrop'}),m=dom.create('section',{class:'tony-modal'});m.innerHTML=`<h2>${title}</h2><div class="tony-modal-body"></div>`;m.querySelector('.tony-modal-body').append(typeof body==='string'?dom.create('p',{text:body}):body);for(const a of actions){const btn=dom.create('button',{text:a.label});btn.onclick=()=>a.run?.(m);m.append(btn);}b.append(m);document.body.append(b);return ()=>b.remove();}
  };

  const data = {
    csv(rows){const a=Array.isArray(rows)?rows:[];if(!a.length)return '';const keys=[...new Set(a.flatMap(r=>Object.keys(r)))];const esc=v=>`"${String(v??'').replaceAll('"','""')}"`;return [keys.map(esc).join(','),...a.map(r=>keys.map(k=>esc(r[k])).join(','))].join('\n');},
    parseJSON(s){return JSON.parse(s);},
    parseCSV(s){const lines=String(s).split(/\r?\n/).filter(Boolean),rows=lines.map(l=>l.match(/("(?:[^"]|"")*"|[^,]*)/g)?.filter((_,i,a)=>i<a.length-1).map(x=>x.replace(/^"|"$/g,'').replaceAll('""','"'))||[]);const h=rows.shift()||[];return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));},
    groupBy(rows,key){return rows.reduce((o,r)=>(o[r[key]??'']??=[]).push(r),o),o;},
    sort(rows,key,dir='asc'){return [...rows].sort((a,b)=>String(a[key]??'').localeCompare(String(b[key]??''),undefined,{numeric:true,sensitivity:'base'})*(dir==='desc'?-1:1));},
    unique(rows,key){return [...new Map(rows.map(r=>[r[key],r])).values()];}
  };

  const math = {sum:a=>a.reduce((s,x)=>s+Number(x||0),0),avg:a=>a.length?math.sum(a)/a.length:0,min:a=>Math.min(...a.map(Number)),max:a=>Math.max(...a.map(Number)),round:(n,p=2)=>Number(Number(n).toFixed(p)),percent:(a,b)=>b?100*a/b:0};
  const time = {now:()=>new Date().toISOString(),sleep,format:(d=new Date())=>new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(d))};

  const ai = {
    async chat(messages,attachments=[]){return net.post('/api/chat',{messages,attachments});},
    async capabilities(){return net.get('/api/capabilities');},
    async inspect(url){return net.post('/api/inspect',{url});},
    async queue(task){return net.post('/api/queue',task);},
    async validate(field,value){return net.post('/api/validate',{field,value});},
    async consensus(candidates){return net.post('/api/consensus',{candidates});},
    async recover(url){return net.post('/api/recover',{url});}
  };

  const runtime = {version:'2.0.0',events,emit,uid,clamp,dom,storage,clipboard,files,net,navigation,forms,interaction,observe,command,ui,data,math,time,ai};
  window.TONYWeb=Object.freeze(runtime);
  emit('ready',{version:runtime.version});
})();
