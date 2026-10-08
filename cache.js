import { readFile, writeFile, mkdir } from 'node:fs/promises';

export const DATA_DIR = new URL('./data/', import.meta.url);

export async function readCache(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

export async function writeCache(file, data) {
  await mkdir(new URL('.', file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2));
}
