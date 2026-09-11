import 'dotenv/config';
const checks={OPENAI_API_KEY:!!process.env.OPENAI_API_KEY,PLAYWRIGHT:true};
console.log('TONY Ultimate AI doctor');
console.log('OPENAI_API_KEY=',checks.OPENAI_API_KEY?'configured':'missing');
console.log('DASHBOARD_URL=',process.env.DASHBOARD_URL||'not configured (chat-only mode)');
console.log('AUTO_SUBMIT=',process.env.AUTO_SUBMIT||'false');
console.log('RESEARCH_ENABLED=',process.env.RESEARCH_ENABLED||'true');
console.log('External navigation=',process.env.ALLOW_EXTERNAL_NAVIGATION||'false');
process.exit(checks.OPENAI_API_KEY?0:1);
