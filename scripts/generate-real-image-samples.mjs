import { mkdir, writeFile } from 'node:fs/promises';

const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('OPENAI_API_KEY is required to create real image samples; no placeholder images are permitted.');

const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const prompts = [
  'A red apple on a white table, studio photography',
  'A futuristic city at sunset, cinematic skyline',
  'A small wooden cabin beside a calm lake, natural landscape photography',
  'A friendly robot reading a book in a cozy room, detailed illustration',
  'A clean modern logo for a fictional coffee shop named North Star Coffee',
  'A rocket launching into space, dramatic but realistic aerospace photography',
  'A golden retriever running through a sunny park, natural pet photography',
  'A minimalist mountain landscape with misty peaks, fine art',
  'A blue bicycle parked beside the ocean, coastal photography',
  'A glass greenhouse full of lush green plants, architectural photography',
  'A dragon flying over a medieval castle, fantasy concept art',
  'A premium white sneaker on a neutral studio background, product photography',
  'A cozy library with tall wooden shelves and warm reading lamps, interior photography',
  'A cartoon-style astronaut standing on the moon, colorful illustration',
  'A tropical beach with palm trees and turquoise water, travel photography',
  'A simple star-shaped app icon, polished modern UI design',
  'A passenger train crossing a bridge over a river, cinematic landscape',
  'A watercolor garden filled with flowers, delicate traditional painting',
  'A futuristic electric car on a clean city street at night, automotive photography',
  'A bright comet crossing a clear night sky above a quiet landscape, astrophotography',
];

await mkdir('samples/generated-images', { recursive: true });

for (let i = 0; i < prompts.length; i++) {
  const response = await fetch(`${base}/images/generations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, prompt: prompts[i], size: '1024x1024', quality: 'auto', background: 'auto', output_format: 'png' }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Image ${i + 1}/20 failed: ${data?.error?.message || response.status}`);
  const encoded = data?.data?.[0]?.b64_json;
  if (!encoded) throw new Error(`Image ${i + 1}/20 failed: provider returned no image data`);
  await writeFile(`samples/generated-images/sample-${String(i + 1).padStart(2, '0')}.png`, Buffer.from(encoded, 'base64'));
  console.log(`created image ${i + 1}/20`);
}
