/* TONY artifact generator. Builds browser-downloadable files and ZIP archives without native OS dependencies. */
import { Buffer } from 'node:buffer';

const MIME={txt:'text/plain',md:'text/markdown',json:'application/json',csv:'text/csv',html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml',xml:'application/xml',yaml:'text/yaml',yml:'text/yaml'};
const cleanName=(name='download.txt')=>{let n=String(name).replace(/[\\/]/g,'_').replace(/[^a-zA-Z0-9._ -]/g,'_').trim();if(!n)n='download.txt';return n.slice(0,180)};
const mimeFor=(name,mime)=>mime||MIME[String(name).split('.').pop().toLowerCase()]||'application/octet-stream';
function crc32(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function u16(n){const b=Buffer.alloc(2);b.writeUInt16LE(n);return b}
function u32(n){const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b}
export function makeFile({filename='download.txt',content='',mime}={}){const name=cleanName(filename);const data=Buffer.from(String(content),'utf8');return {filename:name,mime:mimeFor(name,mime),bytes:data.length,dataUrl:`data:${mimeFor(name,mime)};base64,${data.toString('base64')}`};}
export function makeZip(files=[],zipName='tony-downloads.zip'){
  const entries=[];let offset=0;const now=new Date();const dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|Math.floor(now.getSeconds()/2);const dosDate=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  for(const item of Array.isArray(files)?files:[]){const f=makeFile(item);const name=Buffer.from(f.filename,'utf8');const data=Buffer.from(String(item.content??''),'utf8');const crc=crc32(data);const local=Buffer.concat([Buffer.from([0x50,0x4b,0x03,0x04]),u16(20),u16(0),u16(0),u16(dosTime),u16(dosDate),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);entries.push({f,name,data,crc,offset});offset+=local.length;entries[entries.length-1].local=local;}
  const central=[];for(const e of entries){central.push(Buffer.concat([Buffer.from([0x50,0x4b,0x01,0x02]),u16(20),u16(20),u16(0),u16(0),u16(dosTime),u16(dosDate),u32(e.crc),u32(e.data.length),u32(e.data.length),u16(e.name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(e.offset),e.name]));}
  const body=Buffer.concat(entries.map(e=>e.local));const cd=Buffer.concat(central);const end=Buffer.concat([Buffer.from([0x50,0x4b,0x05,0x06]),Buffer.alloc(6),u16(entries.length),u16(entries.length),u32(cd.length),u32(body.length),u16(0)]);const zip=Buffer.concat([body,cd,end]);return {filename:cleanName(zipName.endsWith('.zip')?zipName:`${zipName}.zip`),mime:'application/zip',bytes:zip.length,dataUrl:`data:application/zip;base64,${zip.toString('base64')}`,fileCount:entries.length};
}
export function generateArtifacts({files=[],zip=false,zipName='tony-downloads.zip'}={}){const normalized=(Array.isArray(files)?files:[]).slice(0,50).map(makeFile);const out={files:normalized};if(zip&&normalized.length){out.zip=makeZip(files,zipName)}return out;}
