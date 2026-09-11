(() => {
  const form = document.getElementById('composer');
  const input = document.getElementById('messageInput');
  const send = document.getElementById('sendButton');
  const messages = document.getElementById('messages');
  const empty = document.getElementById('emptyState');
  if (!form || !input || !send || !messages) return;

  const history = [];
  const files = [];
  const add = (text, role) => {
    empty.style.display = 'none'; messages.classList.add('has-messages');
    const item=document.createElement('article'); item.className='message '+role;
    const bubble=document.createElement('div'); bubble.className='message-bubble'; bubble.textContent=text;
    item.appendChild(bubble); messages.appendChild(item);
    const area=document.getElementById('chatArea'); area.scrollTop=area.scrollHeight;
    return bubble;
  };
  form.addEventListener('submit', async e => {
    e.preventDefault(); const text=input.value.trim(); if(!text || send.disabled) return;
    add(text,'user'); history.push({role:'user',content:text}); input.value=''; input.dispatchEvent(new Event('input'));
    send.disabled=true; const bubble=add('TONY is thinking…','assistant');
    try {
      const res=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:history,attachments:files.map(f=>({name:f.name,type:f.type,size:f.size}))})});
      const data=await res.json(); if(!res.ok) throw new Error(data.error||'Chat request failed');
      bubble.textContent=data.reply||'I could not produce a response.'; history.push({role:'assistant',content:bubble.textContent});
    } catch(err) {
      bubble.textContent='TONY could not reach the AI engine. Make sure the server is running and OPENAI_API_KEY is configured.';
    } finally { send.disabled=false; input.focus(); }
  });
  const fileInput=document.getElementById('fileInput');
  fileInput?.addEventListener('change',()=>{ files.splice(0,files.length,...Array.from(fileInput.files)); });
})();
