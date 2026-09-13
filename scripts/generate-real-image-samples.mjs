import { mkdir, writeFile } from 'node:fs/promises';
import { tonyAIProvider } from '../engine/tonyai-provider.js';

const prompts = [
  'A red apple on a white table, studio composition', 'A futuristic city at sunset, cinematic skyline', 'A small wooden cabin beside a calm lake, natural landscape', 'A friendly robot reading a book in a cozy room', 'A clean modern logo for a fictional coffee shop named North Star Coffee', 'A rocket launching into space, dramatic aerospace scene', 'A golden retriever running through a sunny park', 'A minimalist mountain landscape with misty peaks', 'A blue bicycle parked beside the ocean', 'A glass greenhouse full of lush green plants', 'A dragon flying over a medieval castle', 'A premium white sneaker on a neutral studio background', 'A cozy library with tall wooden shelves and warm reading lamps', 'A cartoon-style astronaut standing on the moon', 'A tropical beach with palm trees and turquoise water', 'A simple star-shaped app icon, polished modern UI design', 'A passenger train crossing a bridge over a river', 'A watercolor garden filled with flowers', 'A futuristic electric car on a clean city street at night', 'A bright comet crossing a clear night sky above a quiet landscape'
];

await mkdir('samples/generated-images', { recursive: true });
for (let i = 0; i < prompts.length; i++) {
  const result = tonyAIProvider.generateImage({prompt:prompts[i],size:'1024x1024'});
  if (!result?.ok || !result.image?.startsWith('data:image/svg+xml;base64,')) throw new Error(`Image ${i + 1}/20 failed: native provider returned no image`);
  const encoded=result.image.slice('data:image/svg+xml;base64,'.length);
  await writeFile(`samples/generated-images/sample-${String(i + 1).padStart(2, '0')}.svg`, Buffer.from(encoded,'base64'));
  console.log(`created native image ${i + 1}/20`);
}
