import { writeFile, mkdir } from 'node:fs/promises';
import { CACHE_FILE, readCache, fetchIPCA } from './ipca.js';

const previous = await readCache();
const data = await fetchIPCA({ previous, retries: 3 });

if (JSON.stringify(data.series) === JSON.stringify(previous?.series)) {
  console.log(`No new data (latest: ${data.series.at(-1).date})`);
} else {
  await mkdir(new URL('.', CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
  console.log(`Updated from ${data.source} (latest: ${data.series.at(-1).date})`);
}
