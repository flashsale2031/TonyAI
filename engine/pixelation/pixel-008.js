/* TONY Pixel Lab 008 — pixel circles. */
export function circle(cx,cy,r,plot){let x=r,y=0,e=1-r;while(x>=y){for(const p of [[cx+x,cy+y],[cx+y,cy+x],[cx-x,cy+y],[cx-y,cy+x],[cx-x,cy-y],[cx-y,cy-x],[cx+x,cy-y],[cx+y,cy-x]])plot(p[0],p[1]);y++;if(e<=0)e+=2*y+1;else{x--;e+=2*(y-x)+1;}}}
if(typeof window!=='undefined')window.TONYPixel008={circle};
