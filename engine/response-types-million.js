import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// 1,000,000 additional contextual response types. The 10,000 existing
// domain/intent types are expanded across 100 distinct question contexts.
// Context terms become part of the type's characteristics and Web-search profile.
const CONTEXTS = [
  ['direct','Direct answer',['direct','answer']], ['verified','Verified',['verified','confirmed']],
  ['official','Official source',['official','source']], ['local','Local',['local','nearby']],
  ['regional','Regional',['regional','region']], ['national','National',['national','country']],
  ['international','International',['international','global']], ['recent','Recent',['recent','latest']],
  ['historical-context','Historical context',['historical','context']], ['today','Today',['today','current']],
  ['yesterday','Yesterday',['yesterday','previous day']], ['tomorrow','Tomorrow',['tomorrow','next day']],
  ['this-week','This week',['this week','weekly']], ['this-month','This month',['this month','monthly']],
  ['this-year','This year',['this year','annual']], ['quarterly','Quarterly',['quarter','quarterly']],
  ['annual','Annual',['annual','yearly']], ['long-term','Long term',['long term','long-range']],
  ['short-term','Short term',['short term','near-term']], ['real-time','Real time',['real-time','live']],
  ['updated','Updated',['updated','revision']], ['latest-release','Latest release',['latest','release']],
  ['newest','Newest',['newest','new']], ['current-version','Current version',['current version','version']],
  ['previous-version','Previous version',['previous version','older version']], ['future','Future',['future','upcoming']],
  ['forecast-period','Forecast period',['forecast','period']], ['historical-period','Historical period',['historical','period']],
  ['average-case','Average case',['average','typical']], ['best-case','Best case',['best case','optimistic']],
  ['worst-case','Worst case',['worst case','pessimistic']], ['typical','Typical',['typical','usual']],
  ['unusual','Unusual',['unusual','atypical']], ['maximum-case','Maximum case',['maximum','peak']],
  ['minimum-case','Minimum case',['minimum','floor']], ['median-case','Median case',['median','middle']],
  ['high-confidence','High confidence',['high confidence','certainty']], ['low-confidence','Low confidence',['low confidence','uncertainty']],
  ['evidence-based','Evidence based',['evidence','research']], ['source-based','Source based',['source','citation']],
  ['data-driven','Data driven',['data','measurement']], ['statistical','Statistical',['statistics','statistical']],
  ['quantitative','Quantitative',['quantity','numeric']], ['qualitative','Qualitative',['quality','descriptive']],
  ['measured','Measured',['measured','measurement']], ['estimated','Estimated',['estimate','estimated']],
  ['calculated','Calculated',['calculation','calculated']], ['reported','Reported',['reported','report']],
  ['observed','Observed',['observed','observation']], ['projected','Projected',['projected','projection']],
  ['predicted','Predicted',['predicted','prediction']], ['expected','Expected',['expected','expectation']],
  ['actual','Actual',['actual','observed']], ['planned','Planned',['planned','plan']],
  ['scheduled','Scheduled',['scheduled','schedule']], ['available-now','Available now',['available','now']],
  ['currently-open','Currently open',['open','currently']], ['currently-closed','Currently closed',['closed','currently']],
  ['in-stock','In stock',['in stock','inventory']], ['out-of-stock','Out of stock',['out of stock','unavailable']],
  ['price-sensitive','Price focused',['price','cost']], ['cost-breakdown','Cost breakdown',['cost','breakdown']],
  ['budget-focused','Budget focused',['budget','spending']], ['performance-focused','Performance focused',['performance','speed']],
  ['quality-focused','Quality focused',['quality','reliability']], ['safety-focused','Safety focused',['safety','risk']],
  ['privacy-focused','Privacy focused',['privacy','data']], ['security-focused','Security focused',['security','protection']],
  ['compatibility-focused','Compatibility focused',['compatibility','support']], ['feature-focused','Feature focused',['feature','capability']],
  ['requirement-focused','Requirement focused',['requirements','needed']], ['location-focused','Location focused',['location','address']],
  ['schedule-focused','Schedule focused',['schedule','time']], ['distance-focused','Distance focused',['distance','miles']],
  ['duration-focused','Duration focused',['duration','time']], ['percentage-focused','Percentage focused',['percentage','percent']],
  ['comparison-focused','Comparison focused',['comparison','difference']], ['ranking-focused','Ranking focused',['ranking','top']],
  ['trend-focused','Trend focused',['trend','change']], ['growth-focused','Growth focused',['growth','increase']],
  ['decline-focused','Decline focused',['decline','decrease']], ['cause-focused','Cause focused',['cause','reason']],
  ['process-focused','Process focused',['process','steps']], ['instructional','Instructional',['instructions','guide']],
  ['tutorial-focused','Tutorial focused',['tutorial','walkthrough']], ['example-focused','Example focused',['example','sample']],
  ['recommendation-focused','Recommendation focused',['recommendation','suggestion']], ['alternative-focused','Alternative focused',['alternative','option']],
  ['review-focused','Review focused',['review','evaluation']], ['rating-focused','Rating focused',['rating','score']],
  ['summary-focused','Summary focused',['summary','overview']], ['detail-focused','Detail focused',['details','specifics']],
  ['list-focused','List focused',['list','items']], ['checklist-focused','Checklist focused',['checklist','verify']],
  ['troubleshooting-focused','Troubleshooting focused',['troubleshooting','error']], ['solution-focused','Solution focused',['solution','fix']],
  ['eligibility-focused','Eligibility focused',['eligibility','qualify']], ['policy-focused','Policy focused',['policy','rules']],
  ['legal-focused','Legal focused',['legal','law']], ['research-focused','Research focused',['research','study']],
  ['technical-focused','Technical focused',['technical','specification']], ['consumer-focused','Consumer focused',['consumer','user']],
  ['business-focused','Business focused',['business','commercial']], ['expert-focused','Expert focused',['expert','professional']],
  ['beginner-focused','Beginner focused',['beginner','basic']], ['advanced-focused','Advanced focused',['advanced','expert']],
  ['plain-language','Plain language',['plain language','simple']], ['detailed','Detailed answer',['detailed','comprehensive']],
  ['concise','Concise answer',['concise','brief']], ['step-by-step','Step by step',['step-by-step','steps']],
  ['source-comparison','Source comparison',['sources','compare']], ['cross-checked','Cross checked',['cross-check','multiple sources']],
];

function contextualize(base, context, index) {
  const [cid, cname, cterms] = context;
  const characteristics = [...new Set([...(base.characteristics || []), ...cterms, cname.toLowerCase()])];
  return {
    ...base,
    id: `million-${index}-${base.id}-${cid}`,
    name: `${base.name} — ${cname}`,
    keywords: [...new Set([...(base.keywords || []), ...cterms])],
    characteristics,
    context: cid,
    searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...cterms])]
  };
}

export const MILLION_RESPONSE_TYPES = MEGA_RESPONSE_TYPES.flatMap((base, index) =>
  CONTEXTS.map(context => contextualize(base, context, index))
);

if (MILLION_RESPONSE_TYPES.length !== 1000000) {
  throw new Error(`Expected 1000000 million response types, got ${MILLION_RESPONSE_TYPES.length}`);
}

export const RESPONSE_TYPE_COUNT = MILLION_RESPONSE_TYPES.length;
export { CONTEXTS };
