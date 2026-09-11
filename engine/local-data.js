// Offline data-analysis helpers for common structured-data tasks.
const num=v=>Number(v);
export const localData=Object.freeze({
  numeric(values=[]){return values.map(num).filter(Number.isFinite);},
  statistics(values=[]){const a=this.numeric(values).sort((x,y)=>x-y);if(!a.length)return {count:0};const sum=a.reduce((x,y)=>x+y,0),mean=sum/a.length;const mid=Math.floor(a.length/2),median=a.length%2?a[mid]:(a[mid-1]+a[mid])/2;const variance=a.reduce((x,y)=>x+(y-mean)**2,0)/a.length;return {count:a.length,sum,mean,median,min:a[0],max:a[a.length-1],variance,standardDeviation:Math.sqrt(variance)};},
  filter(rows=[],predicate){return rows.filter(predicate);},
  select(rows=[],keys=[]){return rows.map(r=>Object.fromEntries(keys.map(k=>[k,r?.[k]])));},
  join(left=[],right=[],leftKey,rightKey=leftKey){const index=new Map(right.map(r=>[r?.[rightKey],r]));return left.map(l=>({...l,...(index.get(l?.[leftKey])||{})}));},
  pivot(rows=[],rowKey,columnKey,valueKey){const out={};for(const r of rows){const a=r?.[rowKey],b=r?.[columnKey];(out[a]??={})[b]=r?.[valueKey];}return out;},
  frequency(values=[]){const out={};for(const v of values)out[v]=(out[v]||0)+1;return out;},
  movingAverage(values=[],window=3){const a=this.numeric(values),n=Math.max(1,Number(window)||3);return a.map((_,i)=>i+1<n?null:a.slice(i-n+1,i+1).reduce((x,y)=>x+y,0)/n);},
  correlation(a=[],b=[]){const x=this.numeric(a),y=this.numeric(b),n=Math.min(x.length,y.length);if(n<2)return null;const X=x.slice(0,n),Y=y.slice(0,n),mx=X.reduce((s,v)=>s+v,0)/n,my=Y.reduce((s,v)=>s+v,0)/n;let p=0,xx=0,yy=0;for(let i=0;i<n;i++){const dx=X[i]-mx,dy=Y[i]-my;p+=dx*dy;xx+=dx*dx;yy+=dy*dy;}return xx&&yy?p/Math.sqrt(xx*yy):null;}
});
if(typeof window!=='undefined')window.TONYLocalData=localData;
