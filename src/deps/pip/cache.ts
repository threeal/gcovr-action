import * as cache from "@actions/cache";
import * as os from "os";
import * as path from "path";
import { initContext } from "./context";
import { showPackageInfo } from "./info";

export class PackageCacheInfo {
  key: string = "";
  paths: string[] = [];

  infoPath(): string {
    return path.join(os.homedir(), `${this.key}.json`);
  }
}

interface CacheInfo {
  paths: string[];
  key: string;
}

export async function getPackageCacheInfo(
  packageName: string
): Promise<PackageCacheInfo> {
  const cacheInfo = new PackageCacheInfo();
  cacheInfo.key = `pip-${os.type()}-${packageName}`;
  cacheInfo.paths = await getPackageCachePaths(packageName);
  return cacheInfo;
}

async function getPackageCachePaths(packageName: string): Promise<string[]> {
  const packageInfo = await showPackageInfo(packageName);
  if (packageInfo === null) {
    throw new Error(
      `Could not get cache paths of unknown package: ${packageName}`
    );
  }
  const executables = await packageInfo.executables();
  let paths = executables.concat(packageInfo.directories());
  for (const dep of packageInfo.dependencies) {
    const depPaths = await getPackageCachePaths(dep);
    paths = paths.concat(depPaths);
  }
  return paths;
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
