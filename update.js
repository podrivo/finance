import { readCache, writeCache } from './cache.js';
import * as ipca from './ipca.js';
import * as selic from './selic.js';

const INDEXES = [
  ['IPCA', ipca.CACHE_FILE, ipca.fetchIPCA],
  ['Selic', selic.CACHE_FILE, selic.fetchSelic],
];

for (const [name, file, fetchIndex] of INDEXES) {
  try {
    const previous = await readCache(file);
    const data = await fetchIndex({ previous, retries: 3 });

    if (JSON.stringify(data.series) === JSON.stringify(previous?.series)) {
      console.log(`${name}: no new data (latest: ${data.series.at(-1).date})`);
    } else {
      await writeCache(file, data);
      console.log(`${name}: updated from ${data.source} (latest: ${data.series.at(-1).date})`);
    }
  } catch (err) {
    console.error(`${name}: ${err.message}`);
    process.exitCode = 1;
  }
}
