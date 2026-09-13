// TONY offline Live scene search.
// Uses a bundled synthetic/public environment catalog when remote search is unavailable.
const SCENES=[
 ['New York City','urban skyline, streets, parks, daylight and night scene presets'],
 ['Tokyo','urban streets, neon districts, parks, transit and skyline presets'],
 ['California Coast','coastline, ocean, cliffs, beaches, sunset and marine environment presets'],
 ['Yosemite Mountains','granite cliffs, forest, alpine terrain, rivers and daylight presets'],
 ['Redwood Forest','temperate forest, tall trees, understory, fog and filtered light presets'],
 ['Mojave Desert','desert terrain, rock formations, sparse vegetation and warm light presets'],
 ['Grand Canyon','layered canyon terrain, river corridor, rock strata and atmospheric depth presets'],
 ['Honolulu','tropical coastline, ocean, palms, urban shore and sunset presets'],
 ['London','urban architecture, parks, riverfront, overcast and evening presets'],
 ['Paris','urban architecture, boulevards, riverfront and daylight presets']
];
export function searchOfflineLiveScenes(query,{limit=8}={}){const q=String(query||'').toLowerCase().trim();if(!q)return[];const terms=q.split(/\s+/).filter(Boolean);return SCENES.map(([title,description])=>{const text=`${title} ${description}`.toLowerCase();const score=terms.reduce((n,t)=>n+(text.includes(t)?1:0),0);return{title,description,score,source:'TONY local synthetic live-scene catalog',live:false,synthetic:true}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,limit).map(({score,...x})=>x);}
if(typeof window!=='undefined')window.TONYOfflineLiveScenes={searchOfflineLiveScenes};
