export class CapabilityCache {
  constructor({maxEntries=256,defaultTtlMs=30000}={}){this.maxEntries=maxEntries;this.defaultTtlMs=defaultTtlMs;this.entries=new Map();this.stats={hits:0,misses:0,stale:0,evictions:0,writes:0};}
  key(value){return typeof value==='string'?value:JSON.stringify(value);}
  prune(now=Date.now()){for(const [key,item] of this.entries)if(item.expiresAt<=now&&item.staleUntil<=now)this.entries.delete(key);}
  get(key,{allowStale=false}={}){const id=this.key(key),item=this.entries.get(id),now=Date.now();if(!item){this.stats.misses++;return {hit:false,value:undefined};}if(item.expiresAt>now){this.entries.delete(id);this.entries.set(id,item);this.stats.hits++;return {hit:true,value:item.value,stale:false,ageMs:now-item.createdAt};}if(allowStale&&item.staleUntil>now){this.stats.stale++;return {hit:true,value:item.value,stale:true,ageMs:now-item.createdAt};}this.entries.delete(id);this.stats.misses++;return {hit:false,value:undefined};}
  set(key,value,{ttlMs=this.defaultTtlMs,staleMs=ttlMs*3}={}){const id=this.key(key),now=Date.now();this.entries.delete(id);this.entries.set(id,{value,createdAt:now,expiresAt:now+Math.max(0,ttlMs),staleUntil:now+Math.max(0,ttlMs)+Math.max(0,staleMs)});this.stats.writes++;while(this.entries.size>this.maxEntries){this.entries.delete(this.entries.keys().next().value);this.stats.evictions++;}return value;}
  delete(key){return this.entries.delete(this.key(key));}
  clear(){this.entries.clear();}
  info(){return {size:this.entries.size,maxEntries:this.maxEntries,...this.stats};}
}
