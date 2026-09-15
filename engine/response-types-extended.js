import { RESPONSE_TYPES as BASE_TYPES } from './response-types.js';

const DOMAINS = [
  ['weather','Weather',['weather','forecast','temperature','rain','wind'],['temperature','conditions','forecast','humidity','wind']],
  ['climate','Climate',['climate','climate change','warming','emissions'],['trend','emissions','temperature','precipitation','projection']],
  ['geography','Geography',['geography','country','continent','region'],['location','region','coordinates','area','population']],
  ['population','Population',['population','residents','census','people'],['population','residents','census','year','growth']],
  ['demographics','Demographics',['demographics','demographic','age group','household'],['age','gender','household','percentage','distribution']],
  ['economy','Economy',['economy','economic','gdp','inflation'],['gdp','inflation','growth','employment','forecast']],
  ['finance','Finance',['finance','financial','money','investment'],['price','return','risk','rate','value']],
  ['banking','Banking',['bank','banking','account','deposit'],['balance','fee','rate','account','deposit']],
  ['insurance','Insurance',['insurance','policy','premium','coverage'],['premium','coverage','deductible','policy','claim']],
  ['real-estate','Real estate',['real estate','home','house','property'],['price','mortgage','square feet','bedrooms','listing']],
  ['business','Business',['business','company','corporation','startup'],['revenue','employees','founded','headquarters','industry']],
  ['marketing','Marketing',['marketing','advertising','campaign','brand'],['audience','conversion','campaign','reach','cost']],
  ['retail','Retail',['store','retail','shopping','product'],['price','inventory','sale','availability','rating']],
  ['food','Food',['food','dish','meal','cuisine'],['ingredients','nutrition','calories','serving','price']],
  ['nutrition','Nutrition',['nutrition','nutrient','vitamin','protein'],['calories','protein','fat','carbohydrate','serving']],
  ['science','Science',['science','scientific','research','experiment'],['evidence','result','method','study','finding']],
  ['physics','Physics',['physics','force','energy','motion'],['equation','unit','force','energy','measurement']],
  ['chemistry','Chemistry',['chemistry','chemical','molecule','reaction'],['formula','reaction','compound','concentration','temperature']],
  ['biology','Biology',['biology','cell','organism','gene'],['species','gene','cell','function','process']],
  ['medicine','Medicine',['medicine','medical','disease','treatment'],['symptom','diagnosis','treatment','dose','risk']],
  ['anatomy','Anatomy',['anatomy','organ','body','skeleton'],['location','function','structure','size','system']],
  ['space','Space',['space','planet','galaxy','astronomy'],['distance','mass','orbit','discovery','temperature']],
  ['astronomy','Astronomy',['astronomy','star','planet','moon'],['magnitude','distance','orbit','composition','discovery']],
  ['environment','Environment',['environment','ecosystem','pollution','conservation'],['impact','species','pollution','habitat','measurement']],
  ['energy','Energy',['energy','electricity','power','fuel'],['capacity','generation','consumption','efficiency','cost']],
  ['technology','Technology',['technology','tech','device','system'],['feature','version','specification','compatibility','release']],
  ['software','Software',['software','app','program','application'],['version','feature','license','platform','release']],
  ['programming','Programming',['programming','code','developer','language'],['syntax','function','library','version','example']],
  ['web','Web',['website','web','browser','internet'],['url','performance','availability','page','protocol']],
  ['cybersecurity','Cybersecurity',['security','cybersecurity','vulnerability','attack'],['cve','patch','risk','advisory','mitigation']],
  ['data','Data',['data','dataset','database','records'],['count','field','value','schema','source']],
  ['artificial-intelligence','Artificial intelligence',['ai','artificial intelligence','machine learning'],['model','training','benchmark','parameter','capability']],
  ['education','Education',['education','school','college','university'],['admission','tuition','program','degree','enrollment']],
  ['careers','Careers',['career','job','employment','occupation'],['salary','requirements','growth','skills','outlook']],
  ['law','Law',['law','legal','court','statute'],['ruling','statute','case','jurisdiction','penalty']],
  ['government','Government',['government','agency','federal','state'],['policy','agency','official','budget','program']],
  ['politics','Politics',['politics','political','candidate','party'],['poll','vote','candidate','policy','result']],
  ['elections','Elections',['election','vote','voting','ballot'],['votes','percentage','candidate','result','turnout']],
  ['history','History',['history','historical','past','century'],['date','event','cause','leader','outcome']],
  ['culture','Culture',['culture','cultural','tradition','society'],['origin','tradition','meaning','practice','region']],
  ['language','Language',['language','word','translation','grammar'],['meaning','translation','usage','definition','grammar']],
  ['literature','Literature',['literature','book','novel','poem'],['author','publication','theme','plot','characters']],
  ['film','Film',['movie','film','cinema','actor'],['cast','director','release','runtime','rating']],
  ['television','Television',['tv','television','series','episode'],['season','episode','cast','premiere','runtime']],
  ['music','Music',['music','song','album','artist'],['artist','album','release','track','duration']],
  ['games','Games',['game','gaming','video game','console'],['release','developer','platform','score','rating']],
  ['sports','Sports',['sports','team','game','match'],['score','schedule','record','player','stats']],
  ['travel','Travel',['travel','trip','destination','vacation'],['distance','time','price','availability','location']],
  ['transportation','Transportation',['transportation','bus','train','car','route'],['schedule','fare','route','duration','station']],
];

const INTENTS = [
  ['current','Current information',['current','now','today','right now'],['current','today','now','updated']],
  ['historical','Historical information',['historical','history','in the past','previous'],['year','date','historical','past']],
  ['definition','Definition',['what is','define','meaning','what does'],['definition','means','refers to','defined']],
  ['comparison','Comparison',['compare','difference','versus','vs','better'],['compared','difference','versus','whereas','while']],
  ['ranking','Ranking',['best','top','rank','ranking','highest','lowest'],['rank','ranking','top','highest','lowest']],
  ['count','Count',['how many','count','number of','total'],['count','number','total','items']],
  ['price','Price',['price','cost','how much','fee'],['price','cost','fee','usd','dollars']],
  ['availability','Availability',['available','in stock','open','sold out'],['available','in stock','out of stock','open','closed']],
  ['schedule','Schedule',['schedule','when','what time','date','next'],['schedule','date','time','next','starts']],
  ['location','Location',['where','located','location','near'],['address','located','city','state','country','near']],
  ['distance','Distance',['how far','distance','miles','kilometers'],['distance','miles','kilometers','km','route']],
  ['duration','Duration',['how long','duration','length of time'],['duration','hours','minutes','days','time']],
  ['quantity','Quantity',['how much','quantity','amount','volume'],['amount','quantity','total','units','volume']],
  ['percentage','Percentage',['percent','percentage','share','rate'],['percent','percentage','rate','share','%']],
  ['specification','Specification',['spec','specs','specification','technical details'],['specification','model','capacity','dimensions','features']],
  ['requirements','Requirements',['requirements','needed','needs','prerequisite'],['requirements','required','needs','prerequisite','must']],
  ['cause','Cause',['why','cause','caused by','reason'],['because','cause','reason','due to','led to']],
  ['process','Process',['how does','how it works','process','procedure'],['process','step','works','method','procedure']],
  ['forecast','Forecast',['forecast','prediction','expected','projected'],['forecast','expected','projected','estimate','outlook']],
  ['evidence','Evidence',['evidence','proof','source','verify','according to'],['evidence','source','verified','according to','study']],
];

function makeType(domain, intent) {
  const [did, dname, dkeywords, dchars] = domain;
  const [iid, iname, ikeywords, ichars] = intent;
  const unit = iid === 'percentage' ? '%' : '';
  return {
    id: `${did}-${iid}`,
    name: `${dname} — ${iname}`,
    keywords: [...dkeywords, ...ikeywords, `${dname.toLowerCase()} ${iname.toLowerCase()}`],
    characteristics: [...new Set([...dchars, ...ichars])],
    unit,
    domain: did,
    intent: iid,
    searchProfile: [...new Set([...dkeywords, ...dchars, ...ikeywords, ...ichars])]
  };
}

export const EXTENDED_RESPONSE_TYPES = DOMAINS.flatMap(domain => INTENTS.map(intent => makeType(domain, intent)));

if (EXTENDED_RESPONSE_TYPES.length !== 1000) {
  throw new Error(`Expected 1000 extended response types, got ${EXTENDED_RESPONSE_TYPES.length}`);
}

export const RESPONSE_TYPES = [...BASE_TYPES, ...EXTENDED_RESPONSE_TYPES];
export const RESPONSE_TYPE_COUNT = RESPONSE_TYPES.length;

export function getResponseTypeProfile(type) {
  return {
    id: type.id,
    name: type.name,
    characteristics: type.characteristics,
    searchTerms: type.searchProfile || type.characteristics,
    unit: type.unit || ''
  };
}
