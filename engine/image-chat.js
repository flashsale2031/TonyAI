(() => {
  const generate = async (prompt, options={}) => {
    const response = await fetch('/api/image',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt,...options})});
    const data=await response.json();
    if(!response.ok) throw new Error(data?.error||'Image generation failed');
    return data;
  };
  window.TONYImageChat=Object.freeze({generate,async render(prompt,container,options={}){const data=await generate(prompt,options);const img=new Image();img.src=data.image;img.alt=prompt;img.loading='lazy';if(container)container.append(img);return data;}});
})();
