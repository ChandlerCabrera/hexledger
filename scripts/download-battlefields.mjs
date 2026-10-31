import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const CATALOG_URL = 'https://openrift.app/api/v1/catalog';
const MEDIA_URL = 'https://openrift.app/media/cards';
const OUT_DIR = join('public', 'battlefields');
const THUMBNAIL_DIR = join(OUT_DIR, 'thumbnails');

// Prefer English, normal finish, standard art, non-signed printings
const rank = (p) =>
  (p.language === 'EN' ? 0 : 100) +
  (p.finish === 'normal' ? 0 : 10) +
  (p.artVariant === 'normal' ? 0 : 5) +
  (p.isSigned ? 5 : 0) +
  (p.isOvernumbered ? 2 : 0);

const res = await fetch(CATALOG_URL);
if (!res.ok) throw new Error(`Catalog request failed: HTTP ${res.status}`);
const data = await res.json();

const byCard = new Map();
for (const p of Object.values(data.printings)) {
  if (!p.images?.length) continue;
  const list = byCard.get(p.cardId) ?? [];
  list.push(p);
  byCard.set(p.cardId, list);
}

await mkdir(OUT_DIR, { recursive: true });
await mkdir(THUMBNAIL_DIR, { recursive: true });

const manifest = [];
for (const [cardId, card] of Object.entries(data.cards)) {
  if (!card.types?.includes('battlefield')) continue;
  const best = (byCard.get(cardId) ?? []).sort((a, b) => rank(a) - rank(b))[0];
  if (!best) {
    console.warn(`No image for ${card.name}`);
    continue;
  }
  const file = `${card.slug}.webp`;
  const imgRes = await fetch(`${MEDIA_URL}/${best.images[0].imageId}-full.webp`);
  if (!imgRes.ok) {
    console.warn(`Failed ${card.name}: HTTP ${imgRes.status}`);
    continue;
  }
  const image = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(join(OUT_DIR, file), image);
  const thumbnail = `battlefields/thumbnails/${file}`;
  await sharp(image).resize({ width: 320 }).webp({ quality: 70 }).toFile(join(THUMBNAIL_DIR, file));
  manifest.push({ id: cardId, name: card.name, image: `battlefields/${file}`, thumbnail });
  console.log(`Saved ${file}`);
}

manifest.sort((a, b) => a.name.localeCompare(b.name));
await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Done: ${manifest.length} battlefields`);
