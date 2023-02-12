import { tmpNameSync } from "tmp";
import { copySync } from "fs-extra";

class Cache {
  path: string = "";
  cachePath: string = "";

  constructor(path: string) {
    this.path = path;
    this.cachePath = tmpNameSync();
  }

  save() {
    copySync(this.path, this.cachePath, { overwrite: true });
  }

  restore() {
    copySync(this.cachePath, this.path, { overwrite: true });
  }
}

const cachesMap: { [key: string]: Cache[] } = {};

export async function restoreCache(
  paths: string[],
  key: string
): Promise<string | undefined> {
  if (!cachesMap.hasOwnProperty(key)) return undefined;
  for (const cache of cachesMap[key]) {
    if (paths.includes(cache.path)) {
      cache.restore();
    }
  }
  return key;
}

export async function saveCache(paths: string[], key: string) {
  let caches: Cache[] = [];
  if (cachesMap.hasOwnProperty(key)) {
    caches = cachesMap[key];
  }
  for (const path of paths) {
    const cache = new Cache(path);
    cache.save();
    caches.push(cache);
  }
  cachesMap[key] = caches;
}
