(() => {
  const form=document.getElementById('composer'),input=document.getElementById('messageInput'),send=document.getElementById('sendButton'),messages=document.getElementById('messages'),empty=document.getElementById('emptyState'),fileInput=document.getElementById('fileInput');
  if(!form||!input||!send||!messages)return;
  const history=[],files=[]; let capabilities=null;
  const scroll=()=>{const a=document.getElementById('chatArea');if(a)a.scrollTop=a.scrollHeight;};
  const add=(text,role,meta='')=>{if(empty)empty.style.display='none';messages.classList.add('has-messages');const item=document.createElement('article');item.className='message '+role;const bubble=document.createElement('div');bubble.className='message-bubble';bubble.textContent=text;if(meta){const m=document.createElement('small');m.className='message-meta';m.textContent=meta;bubble.appendChild(m);}item.appendChild(bubble);messages.appendChild(item);scroll();return bubble;};
  const setBusy=b=>{send.disabled=b;send.setAttribute('aria-busy',String(b));input.disabled=b;};
  async function loadCapabilities(){try{const r=await fetch('/api/capabilities');if(r.ok)capabilities=await r.json();}catch{}}
  loadCapabilities();
  form.addEventListener('submit',async e=>{
    e.preventDefault();const text=input.value.trim();if(!text||send.disabled)return;
    add(text,'user',files.length?`${files.length} attachment${files.length===1?'':'s'}`:'');history.push({role:'user',content:text});input.value='';input.style.height='auto';
    setBusy(true);const bubble=add('TONY is thinking…','assistant','Using the integrated reasoning, research, validation and workflow stack');
    try{
      const payload={messages:history,attachments:files.map(f=>({name:f.name,type:f.type,size:f.size}))};
      const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Chat request failed');
      bubble.replaceChildren();bubble.append(document.createTextNode(data.reply||'I could not produce a response.'));
      const meta=[];if(data.confidence!=null)meta.push(`Confidence ${Math.round(Number(data.confidence)*100)}%`);if(data.requiresHuman)meta.push('Human review required');if(data.research?.length)meta.push(`${data.research.length} research source set${data.research.length===1?'':'s'}`);if(data.plan)meta.push('Plan verified');
      if(meta.length){const m=document.createElement('small');m.className='message-meta';m.textContent=meta.join(' • ');bubble.appendChild(m);}
      history.push({role:'assistant',content:data.reply||''});
    }catch(err){bubble.textContent=`TONY could not complete the request: ${err.message||'AI engine unavailable'}`;}
    finally{setBusy(false);input.focus();scroll();}
  });
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
  input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,160)+'px';});
  fileInput?.addEventListener('change',()=>{files.splice(0,files.length,...Array.from(fileInput.files||[]));});
  document.addEventListener('dragover',e=>e.preventDefault());
  document.addEventListener('drop',e=>{e.preventDefault();if(fileInput&&e.dataTransfer?.files?.length){fileInput.files=e.dataTransfer.files;fileInput.dispatchEvent(new Event('change'));}});
  window.TONY={getCapabilities:()=>capabilities,clearChat:()=>{history.length=0;messages.replaceChildren();messages.classList.remove('has-messages');if(empty)empty.style.display='grid';}};
})();
