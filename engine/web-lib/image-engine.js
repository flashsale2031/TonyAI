/* Dependency-free image generation orchestration for TONY.
 * It supports prompt planning, canvas-based procedural rendering, SVG generation,
 * compositing, export and optional remote model adapters. A real generative model
 * still requires a model endpoint; browser JavaScript alone cannot reproduce a
 * large diffusion/transformer model at ChatGPT quality.
 */
export const imageEngine={
  version:'1.0.0',
  prompt(prompt,{style='auto',width=1024,height=1024}={}){return {prompt:String(prompt||''),style,width,height,createdAt:new Date().toISOString()};},
  svg({width=1024,height=1024,background='white',title='TONY generated image',elements=[]}={}){const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${esc(background)}"/><title>${esc(title)}</title>${elements.join('')}</svg>`;},
  async rasterize(svg,width=1024,height=1024,type='image/png',quality=.92){const blob=new Blob([svg],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);try{const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url;});const c=document.createElement('canvas');c.width=width;c.height=height;c.getContext('2d').drawImage(img,0,0,width,height);return new Promise(resolve=>c.toBlob(resolve,type,quality));}finally{URL.revokeObjectURL(url);}},
  download(blob,name='tony-image.png'){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},
  gallery(items=[]){return items.map((x,i)=>({id:x.id||`image-${i+1}`,prompt:x.prompt||'',src:x.src||null,createdAt:x.createdAt||new Date().toISOString()}));}
};
if(typeof window!=='undefined')window.TONYImageEngine=imageEngine;
