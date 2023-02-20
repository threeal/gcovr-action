import * as io from "@actions-kit/io";
import * as cache from "@actions/cache";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
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

  async saveContentInfo(contentInfo: PackageContentCacheInfo) {
    PackageCacheInfo.createRoot();
    io.writeJsonFile(this.path, contentInfo);
    await cache.saveCache([this.path], this.key);
  }

  async restoreContentInfo(): Promise<PackageContentCacheInfo | undefined> {
    const restoreKey = await cache.restoreCache([this.path], this.key);
    if (restoreKey === undefined) return undefined;
    const contentInfo = new PackageContentCacheInfo();
    Object.assign(contentInfo, io.readJsonFile(this.path));
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
    if (packageInfo === undefined) {
      throw new Error(
        `Could not get cache paths of unknown package: ${packageName}`
      );
    }
    const executables = await packageInfo.executables();
    let paths = executables.concat(packageInfo.directories());
    for (const dep of packageInfo.requires) {
      const depPaths = await PackageContentCacheInfo.accumulatePaths(dep);
      paths = paths.concat(depPaths);
    }
    return paths;
  }

  async save() {
    await cache.saveCache(this.paths, this.key);
  }

  async restore(): Promise<string | undefined> {
    return await cache.restoreCache(this.paths, this.key);
  }
}
