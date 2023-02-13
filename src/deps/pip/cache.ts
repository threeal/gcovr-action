import * as cache from "@actions/cache";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as io from "../../io";
import { initContext } from "./context";
import { showPackageInfo } from "./info";

export class PackageCacheInfo {
  name: string = "";
  key: string = "";
  path: string = "";

  constructor(packageName: string) {
    this.name = packageName;
    this.key = `pip-${os.type()}-${packageName}-cache-info`;
    const root = PackageCacheInfo.root();
    this.path = path.join(root, `${packageName}.json`);
  }

  async accumulateContentInfo(): Promise<PackageContentCacheInfo> {
    return await PackageContentCacheInfo.accumulate(this.name);
  }

  async saveContentInfo(): Promise<PackageContentCacheInfo> {
    const contentInfo = await this.accumulateContentInfo();
    PackageCacheInfo.createRoot();
    io.writeJson(this.path, contentInfo);
    await cache.saveCache([this.path], this.key);
    return contentInfo;
  }

  async restoreContentInfo(): Promise<PackageContentCacheInfo | undefined> {
    const restoreKey = await cache.restoreCache([this.path], this.key);
    if (restoreKey === undefined) return undefined;
    const contentInfo = new PackageContentCacheInfo();
    Object.assign(contentInfo, io.readJson(this.path));
    return contentInfo;
  }

  static root(): string {
    return path.join(os.homedir(), ".pip_cache_info");
  }

  static createRoot() {
    const root = PackageCacheInfo.root();
    if (!fs.existsSync(root)) fs.mkdirSync(root);
  }
}

export class PackageContentCacheInfo {
  name: string = "";
  key: string = "";
  paths: string[] = [];

  static async accumulate(
    packageName: string
  ): Promise<PackageContentCacheInfo> {
    const cacheInfo = new PackageContentCacheInfo();
    cacheInfo.name = packageName;
    cacheInfo.key = `pip-${os.type()}-${packageName}`;
    cacheInfo.paths = await PackageContentCacheInfo.accumulatePaths(
      packageName
    );
    return cacheInfo;
  }

  static async accumulatePaths(packageName: string): Promise<string[]> {
    const packageInfo = await showPackageInfo(packageName);
    if (packageInfo === null) {
      throw new Error(
        `Could not get cache paths of unknown package: ${packageName}`
      );
    }
    const executables = await packageInfo.executables();
    let paths = executables.concat(packageInfo.directories());
    for (const dep of packageInfo.dependencies) {
      const depPaths = await PackageContentCacheInfo.accumulatePaths(dep);
      paths = paths.concat(depPaths);
    }
    return paths;
  }

  async save() {
    await cache.saveCache(this.paths, this.key);
  }
}

interface CacheInfo {
  paths: string[];
  key: string;
}

async function getCacheInfo(packageName: string): Promise<CacheInfo> {
  const context = await initContext();
  return {
    paths: [
      path.join(context.userSitePackage, `${packageName.toLowerCase()}*`),
      path.join(context.userSitePackage, `${packageName}*`),
    ],
    key: `pip-${os.type()}-${packageName}`,
  };
}

export async function cachePackage(packageName: string): Promise<void> {
  const info = await getCacheInfo(packageName);
  await cache.saveCache(info.paths, info.key);
}

export async function restorePackage(packageName: string): Promise<boolean> {
  const info = await getCacheInfo(packageName);
  const key = await cache.restoreCache(info.paths, info.key);
  return key !== undefined;
}
