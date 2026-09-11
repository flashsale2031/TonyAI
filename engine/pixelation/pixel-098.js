/* Pixel 098 — frame timeline for procedural pixel animation. */
export function timeline(frameCount=8,fps=8,render=()=>{}){let frame=0,last=0,running=false;const tick=t=>{if(!running)return;if(t-last>=1000/fps){render(frame,t);frame=(frame+1)%frameCount;last=t;}requestAnimationFrame(tick);};return{start(){if(!running){running=true;requestAnimationFrame(tick);}},stop(){running=false;},reset(){frame=0;last=0;},get frame(){return frame;}};}
if(typeof window!=='undefined')window.TONYPixel098={timeline};
