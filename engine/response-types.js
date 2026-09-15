const TYPES = [
  ['temperature','Temperature','temperature|degrees|°|weather|hot|cold','degrees|°|°f|°c|fahrenheit|celsius|feels like|high|low','°'],
  ['weather','Weather','weather|forecast|rain|snow|wind|humidity|storm','temperature|degrees|°|rain|snow|wind|humidity|forecast|feels like',''],
  ['time','Time','what time|time in|current time|local time|clock','am|pm|:|utc|gmt|timezone',''],
  ['date','Date','what date|today|tomorrow|yesterday|date','january|february|march|april|may|june|july|august|september|october|november|december|202[0-9]|203[0-9]',''],
  ['currency','Currency conversion','currency|convert|exchange rate|dollar|euro|yen|pound','rate|exchange|usd|eur|gbp|jpy|amount|=',''],
  ['percentage','Percentage','percent|percentage|%','%|percent|rate|share|portion','%'],
  ['number','Numeric value','how many|how much|number of|count','\b\\d+(?:,\\d{3})*(?:\\.\\d+)?\b|million|billion|trillion',''],
  ['distance','Distance','distance|far|miles|kilometers|km|meters','miles|kilometers|km|meters|feet|ft|mi',''],
  ['speed','Speed','speed|mph|km/h|kilometers per hour','mph|km/h|km per hour|miles per hour|knots',''],
  ['weight','Weight','weight|weigh|pounds|kilograms|kg|lbs','pounds|kilograms|kg|lbs|ounces|oz|tons',''],
  ['length','Length','length|long|height|width|meters|feet|inches','meters|feet|inches|cm|centimeters|yards',''],
  ['area','Area','area|square feet|square miles|acre','square feet|square miles|acres|hectares',''],
  ['volume','Volume','volume|gallons|liters|litres|cups','gallons|liters|litres|cups|quarts|pints|milliliters',''],
  ['data-size','Data size','gigabyte|gb|megabyte|mb|terabyte|tb|file size','gb|mb|tb|kb|bytes|gigabytes|megabytes|terabytes',''],
  ['age','Age','age|how old|years old','years old|born|age|years','years'],
  ['population','Population','population|people live|residents','population|residents|people|inhabitants',''],
  ['rank','Ranking','rank|ranking|ranked|position','rank|ranking|place|position|number one|#1',''],
  ['score','Score','score|points|result','score|points|out of|won|lost',''],
  ['price','Price','price|cost|how much does|worth','\$|price|cost|usd|dollars|sale|retail',''],
  ['salary','Salary','salary|pay|wage|income','salary|per year|annually|hourly|wage|compensation',''],
  ['tax','Tax','tax|tax rate|sales tax|income tax','tax|rate|percent|deduction|bracket','%'],
  ['interest','Interest rate','interest rate|apr|apy|interest','interest|apr|apy|rate|yield','%'],
  ['mortgage','Mortgage','mortgage|home loan|monthly payment','principal|interest|mortgage|payment|apr|loan',''],
  ['loan','Loan','loan|borrow|lending|repayment','loan|principal|interest|payment|term|apr',''],
  ['stock-price','Stock price','stock price|share price|ticker','price|share|market|ticker|change|volume',''],
  ['market','Market data','market|market cap|trading|index','market|index|volume|capitalization|change|close|open',''],
  ['crypto-price','Cryptocurrency price','bitcoin|ethereum|crypto|cryptocurrency','price|usd|market cap|24h|change|btc|eth',''],
  ['news','News','latest news|news|breaking|headline','published|updated|report|news|headline|according to',''],
  ['current-event','Current event','latest|today|now|currently|recent','today|updated|latest|current|now|published',''],
  ['historical-date','Historical date','when did|what year|date of|founded|established','year|date|founded|established|occurred|century',''],
  ['history','History','history|historical|past','history|founded|established|century|war|event',''],
  ['biography','Biography','who is|biography|born|died','born|died|career|known for|biography|education',''],
  ['person-fact','Person fact','who|person|actor|athlete|ceo|president','born|age|position|career|works|served|founded',''],
  ['company-fact','Company fact','company|corporation|business|founded by','founded|headquarters|revenue|employees|ceo|company',''],
  ['product-fact','Product fact','product|model|specification|specs','model|specifications|features|dimensions|weight|capacity',''],
  ['product-price','Product price','how much|price|cost|product','price|cost|sale|retail|usd|dollars',''],
  ['availability','Availability','available|in stock|open|sold out','available|in stock|out of stock|sold out|opening|closed',''],
  ['hours','Business hours','hours|open|close|closing|opening time','hours|open|closed|am|pm|monday|tuesday|wednesday|thursday|friday|saturday|sunday',''],
  ['address','Address','address|located|where is|location','street|avenue|road|blvd|drive|suite|zip|address',''],
  ['phone','Phone number','phone|telephone|call|contact number','phone|tel|telephone|contact|\+?\\d[\\d ()-]{7,}',''],
  ['email','Email address','email|e-mail|contact email','@|email|e-mail|contact',''],
  ['website','Website','website|web site|official site|homepage','https?://|www\\.|official website|homepage',''],
  ['url','URL','url|link|web address','https?://|www\\.',''],
  ['definition','Definition','what is|what does|define|meaning of','definition|means|refers to|is a|defined as',''],
  ['explanation','Explanation','why|how does|explain|how it works','because|therefore|works|process|means|allows',''],
  ['comparison','Comparison','compare|difference|versus|vs|better than','compared|difference|versus|vs|whereas|while',''],
  ['pros-cons','Pros and cons','pros|cons|advantages|disadvantages|benefits|drawbacks','advantage|disadvantage|benefit|drawback|pros|cons',''],
  ['recommendation','Recommendation','recommend|best|which should|suggest','best|recommended|ideal|popular|rating|review',''],
  ['review','Review','review|reviews|rating|rated','rating|review|stars|score|pros|cons',''],
  ['rating','Rating','rating|stars|rated out of','stars|rating|out of|score|reviews',''],
  ['list','List','list|give me|show me|examples','1.|2.|3.|first|second|third|including',''],
  ['count-list','Counted list','how many|count|number of items','\b\\d+\b|total|count|items',''],
  ['steps','Steps','how to|steps|instructions|procedure','step|first|second|third|next|then|finally',''],
  ['tutorial','Tutorial','tutorial|guide|walkthrough','step|install|configure|create|run|then|next',''],
  ['recipe','Recipe','recipe|how to cook|ingredients|dish','ingredients|instructions|cook|bake|oven|minutes|tablespoon|teaspoon',''],
  ['ingredient','Ingredient','ingredients|ingredient|contains','ingredients|contains|made with|flour|sugar|salt|oil',''],
  ['nutrition','Nutrition','calories|nutrition|protein|carbs|fat','calories|protein|carbohydrate|fat|fiber|serving|nutrition',''],
  ['calories','Calories','calories|kcal|energy','calories|kcal|per serving|energy','kcal'],
  ['health-fact','Health fact','symptoms|condition|disease|health','symptoms|causes|treatment|diagnosis|risk|health',''],
  ['medicine','Medicine','medication|medicine|drug|dosage','dose|dosage|mg|milligrams|indication|side effects|prescribed',''],
  ['exercise','Exercise','exercise|workout|training|fitness','reps|sets|minutes|workout|exercise|training',''],
  ['sleep','Sleep','sleep|bedtime|hours of sleep','hours|sleep|bedtime|wake|night','hours'],
  ['travel-time','Travel time','how long to get|travel time|drive time|flight time','hours|minutes|duration|drive|flight|travel',''],
  ['distance-travel','Travel distance','distance between|how far|miles to','miles|kilometers|km|distance|route',''],
  ['flight','Flight','flight|airline|departure|arrival','flight|departure|arrival|terminal|gate|airline|airport',''],
  ['airport','Airport','airport|terminal|gate','airport|terminal|gate|arrivals|departures|baggage',''],
  ['hotel','Hotel','hotel|lodging|room|stay','room|hotel|check-in|check-out|amenities|rate',''],
  ['restaurant','Restaurant','restaurant|food|dining|menu','menu|hours|address|restaurant|reservation|dish',''],
  ['reservation','Reservation','reservation|book|booking|table','reservation|booking|available|table|party|time',''],
  ['event','Event','event|concert|festival|game|show','date|time|venue|tickets|event|doors|starts',''],
  ['sports-score','Sports score','score|game|match|final score','score|final|quarter|inning|period|goals|points',''],
  ['sports-schedule','Sports schedule','schedule|game time|match time|next game','schedule|date|time|opponent|game|match',''],
  ['sports-standings','Sports standings','standings|record|wins|losses','wins|losses|record|standings|points|rank',''],
  ['sports-stats','Sports statistics','stats|statistics|average|yards|goals','games|points|average|yards|goals|assists|rebounds',''],
  ['movie','Movie','movie|film|cast|release','cast|director|release|runtime|plot|rating',''],
  ['tv-show','TV show','tv show|series|episode|season','episode|season|cast|premiere|airdate|runtime',''],
  ['book','Book','book|novel|author|publication','author|published|pages|publisher|isbn|summary',''],
  ['music','Music','song|music|album|artist','artist|album|released|track|genre|duration',''],
  ['game','Video game','video game|game|console|pc','release|developer|publisher|platform|price|rating',''],
  ['software','Software','software|app|program|version','version|release|features|platform|download|license',''],
  ['technical-spec','Technical specification','specs|specification|technical|capacity|processor','model|processor|memory|storage|resolution|capacity|specification',''],
  ['compatibility','Compatibility','compatible|works with|support|supported','compatible|supports|requires|version|platform|device',''],
  ['version','Version','version|latest version|release version','version|released|release|build|update',''],
  ['release-date','Release date','release date|released|launch date','released|release|launch|premiere|date',''],
  ['license','License','license|licence|open source|terms','license|licensed|mit|apache|gpl|terms',''],
  ['security','Security','security|secure|vulnerability|cve','security|vulnerability|cve|patch|advisory|risk',''],
  ['privacy','Privacy','privacy|data collection|personal data','privacy|data|personal|collection|policy|cookies',''],
  ['legal','Legal information','legal|law|lawsuit|regulation|court','law|legal|court|regulation|statute|ruling',''],
  ['government','Government','government|agency|law|official','government|agency|department|official|policy',''],
  ['election','Election','election|vote|voting|candidate','votes|percent|candidate|election|polls|results','%'],
  ['education','Education','school|college|university|degree','school|university|degree|program|tuition|admission',''],
  ['course','Course','course|class|lesson|training','course|lesson|class|duration|curriculum|enroll',''],
  ['job','Job','job|career|position|hiring','job|position|salary|requirements|hiring|apply',''],
  ['location','Location','where|located|location|near','located|address|city|state|country|near',''],
  ['map-route','Route','route|directions|how do i get|navigation','route|directions|turn|street|highway|distance',''],
  ['timezone','Timezone','timezone|time zone|utc|gmt','utc|gmt|timezone|time zone|offset',''],
  ['unit-conversion','Unit conversion','convert|conversion|to inches|to pounds|to celsius','equals|convert|conversion|=|approximately',''],
  ['math-result','Math result','calculate|what is|solve|equation','=|equals|result|answer|approximately',''],
  ['formula','Formula','formula|equation|calculate|equation for','formula|equation|=|where|variables',''],
  ['code-answer','Code answer','code|javascript|python|sql|programming|function','function|class|const|let|return|SELECT|import|code',''],
  ['error-fix','Error troubleshooting','error|bug|fix|crash|not working','error|exception|fix|solution|cause|stack trace',''],
  ['documentation','Documentation','docs|documentation|api|reference','documentation|reference|parameter|method|example|usage',''],
  ['search-fact','Web fact','find|look up|search|according to','according to|source|reported|official|page',''],
  ['citation','Citation/source','source|citation|reference|where did','source|reference|citation|according to|published',''],
  ['summary','Summary','summarize|summary|overview|key points','summary|overview|key points|conclusion|in short',''],
  ['fact-check','Fact check','is it true|fact check|verify|true or false','verified|fact|false|true|evidence|source',''],
  ['cause-effect','Cause and effect','why did|cause|caused|result','because|caused|result|led to|due to|effect',''],
  ['forecast','Forecast','forecast|prediction|expected|projected','forecast|expected|projected|estimate|outlook|chance',''],
  ['probability','Probability','probability|odds|chance|likelihood','probability|chance|odds|likely|unlikely','%'],
  ['trend','Trend','trend|growing|declining|over time','trend|increase|decrease|growth|decline|year over year','%'],
  ['timeline','Timeline','timeline|chronology|sequence of events','timeline|year|date|event|before|after',''],
  ['comparison-table','Structured comparison','compare|side by side|which is better','price|features|pros|cons|rating|difference|compare',''],
  ['yes-no','Yes or no','is|can|does|do|will|should','yes|no|true|false|can|cannot|does|does not',''],
  ['contact','Contact information','contact|customer service|support number','phone|email|address|support|contact',''],
  ['definition-example','Definition with example','example of|meaning|define','means|example|refers to|such as',''],
  ['fact-list','Fact list','facts|tell me about|information about','is|has|includes|known|located|founded',''],
  ['availability-date','Date availability','available on|available date|when available','available|date|schedule|opening|booking',''],
  ['operating-status','Current status','open now|closed now|status|operating','open|closed|operating|status|currently',''],
  ['delivery-time','Delivery time','delivery|shipping|arrive|how long','delivery|ships|arrives|days|business days|estimated','days'],
  ['shipping-cost','Shipping cost','shipping cost|delivery fee|postage','shipping|delivery|fee|cost|price',''],
  ['capacity','Capacity','capacity|how many can|seats|holds','capacity|seats|holds|maximum|people|units',''],
  ['dimensions','Dimensions','dimensions|size|measurements','length|width|height|dimensions|inches|cm',''],
  ['material','Material','material|made of|fabric|composition','made of|material|cotton|steel|plastic|wood|composition',''],
  ['color','Color','color|colour|what color','color|colour|black|white|red|blue|green|yellow',''],
  ['quantity','Quantity','quantity|how many|amount|number','quantity|amount|count|units|pieces',''],
  ['identifier','Identifier','id|identifier|code|number','id|identifier|code|number|isbn|sku|ticker',''],
  ['contact-name','Named contact','who to contact|contact person|representative','contact|manager|representative|support|name',''],
  ['generic-factual','General factual answer','','','']
];

export const RESPONSE_TYPES = TYPES.map(([id,name,keywords,characteristics,unit])=>({
  id,name,
  keywords:keywords.split('|').filter(Boolean),
  characteristics:characteristics.split('|').filter(Boolean),
  unit
}));

const escRe=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function classifyResponseType(question=''){
  const q=String(question).toLowerCase();
  let best=RESPONSE_TYPES[RESPONSE_TYPES.length-1],bestScore=0;
  for(const type of RESPONSE_TYPES){
    let score=0;
    for(const keyword of type.keywords){
      if(!keyword)continue;
      if(new RegExp('(^|[^a-z0-9])'+escRe(keyword.toLowerCase())+'([^a-z0-9]|$)','i').test(q))score+=keyword.length>5?3:2;
    }
    if(type.id==='temperature' && /\b(temperature|degrees|°f|°c|fahrenheit|celsius)\b|°/i.test(q))score+=8;
    if(type.id==='time' && /\bwhat time|current time|time in\b/i.test(q))score+=6;
    if(score>bestScore){bestScore=score;best=type;}
  }
  return {...best,score:bestScore};
}

function sentenceBlocks(text){
  return String(text||'').replace(/\r/g,'').split(/(?<=[.!?])\s+|\n+/).map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s.length>=20&&s.length<=900);
}
function matchingCharacteristics(text,type){
  const lower=text.toLowerCase();
  return type.characteristics.filter(c=>new RegExp(c,'i').test(lower));
}

export function extractAnswerForType(text,question,type=classifyResponseType(question)){
  const blocks=sentenceBlocks(text);
  const qTerms=String(question||'').toLowerCase().split(/[^a-z0-9°]+/).filter(x=>x.length>2);
  const ranked=blocks.map((block,index)=>{
    const lower=block.toLowerCase();
    const characteristicHits=type.characteristics.filter(c=>lower.includes(c.toLowerCase())).length;
    const questionHits=qTerms.filter(term=>lower.includes(term)).length;
    let valueHits=0;
    if(type.id==='temperature')valueHits=(block.match(/[-+]?\d+(?:\.\d+)?\s*(?:°\s*[fc]|degrees?\s*(?:fahrenheit|celsius|f|c)?|fahrenheit|celsius)/gi)||[]).length;
    const score=characteristicHits*5+questionHits*2+valueHits*12;
    return {block,index,score,characteristicHits,questionHits,valueHits};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
  const selected=[];const seen=new Set();
  for(const item of ranked){if(seen.has(item.block))continue;seen.add(item.block);selected.push(item);if(selected.length>=8)break;}
  const characteristicHits=matchingCharacteristics(text,type);
  const valueMatches=type.id==='temperature' ? (String(text).match(/[-+]?\d+(?:\.\d+)?\s*(?:°\s*[FCfc]|degrees?\s*(?:Fahrenheit|Celsius|F|C)?|Fahrenheit|Celsius)/g)||[]) : [];
  return {
    typeId:type.id,
    responseType:type.name,
    unit:type.unit,
    characteristics:characteristicHits,
    valueMatches,
    facts:selected.map(x=>x.block),
    matchScore:selected.length?selected[0].score:0
  };
}

export function buildPageSearchProfile(question){
  const type=classifyResponseType(question);
  return {type, characteristics:type.characteristics, pageSignals:type.characteristics.join(' OR ')};
}

if(typeof window!=='undefined')window.TONY_RESPONSE_TYPES=RESPONSE_TYPES;
