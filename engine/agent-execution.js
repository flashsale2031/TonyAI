import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(process.env.TONY_WORKSPACE || process.cwd());
const TOKEN = String(process.env.TONY_AGENT_TOKEN || '');
const MAX_OUTPUT = 120_000;
const MAX_FILE = 250_000;
const TIMEOUT_MS = Math.min(Math.max(Number(process.env.TONY_AGENT_TIMEOUT_MS) || 20_000, 1_000), 60_000);

function auth(value) {
  return TOKEN.length > 0 && value === `Bearer ${TOKEN}`;
}
function safePath(input) {
  const candidate = path.resolve(ROOT, String(input || '.'));
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${path.sep}`)) throw new Error('Path is outside the workspace');
  return candidate;
}
function trimOutput(value) {
  const text = String(value || '');
  return text.length > MAX_OUTPUT ? `${text.slice(0, MAX_OUTPUT)}\n[output truncated]` : text;
}
async function list(relative = '.') {
  const directory = safePath(relative);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries.filter(entry => !['.git', 'node_modules'].includes(entry.name)).map(entry => ({ name: entry.name, type: entry.isDirectory() ? 'directory' : 'file' }));
}
async function read(relative) {
  const filename = safePath(relative);
  const stat = await fs.stat(filename);
  if (!stat.isFile()) throw new Error('Only files can be read');
  if (stat.size > MAX_FILE) throw new Error('File exceeds safe read limit');
  return fs.readFile(filename, 'utf8');
}
function run(command, args = []) {
  const allowed = new Map([
    ['syntax', ['node', ['--check']]],
    ['tests', ['node', ['--test']]],
    ['doctor', ['node', ['scripts/doctor.js']]],
    ['lint', ['npm', ['run', 'lint']]]
  ]);
  const spec = allowed.get(command);
  if (!spec) throw new Error('Command is not allowlisted');
  const [program, defaults] = spec;
  const finalArgs = command === 'syntax' ? [...defaults, ...args.slice(0, 10).map(safePath)] : defaults;
  return new Promise((resolve, reject) => {
    const child = spawn(program, finalArgs, { cwd: ROOT, shell: false, env: { ...process.env, CI: '1' } });
    let stdout = '', stderr = '';
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Execution timed out')); }, TIMEOUT_MS);
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout: trimOutput(stdout), stderr: trimOutput(stderr) }); });
  });
}
async function github(pathname, method = 'GET', body) {
  const token = String(process.env.GITHUB_TOKEN || '');
  const owner = process.env.GITHUB_OWNER || 'flashsale2031';
  const repo = process.env.GITHUB_REPO || 'TonyAI';
  if (!token) throw new Error('GITHUB_TOKEN is not configured');
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${pathname.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url, { method, headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'x-github-api-version': '2022-11-28', 'user-agent': 'TonyAI-agent' }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = { text }; }
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${data?.message || 'request failed'}`);
  return data;
}
export async function executeAgent(request, authorization) {
  if (!auth(authorization)) return { status: 401, body: { error: 'Unauthorized agent request' } };
  const action = String(request?.action || '');
  try {
    if (action === 'diagnostics') return { status: 200, body: { ok: true, workspace: ROOT, node: process.version, actions: ['diagnostics', 'list', 'read', 'run', 'github-read'] } };
    if (action === 'list') return { status: 200, body: { entries: await list(request.path) } };
    if (action === 'read') return { status: 200, body: { path: request.path, content: await read(request.path) } };
    if (action === 'run') return { status: 200, body: { action, result: await run(request.command, Array.isArray(request.args) ? request.args : []) } };
    if (action === 'github-read') return { status: 200, body: await github(String(request.path || '')) };
    return { status: 400, body: { error: 'Unknown or disallowed action' } };
  } catch (error) {
    return { status: 500, body: { error: String(error?.message || error) } };
  }
}
