import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as os from "os";
import * as path from "path";
import * as exec from "../../exec";
import { initContext } from "./context";
import { showPackageInfo } from "./info";

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

async function cachePackage(packageName: string): Promise<void> {
  const info = await getCacheInfo(packageName);
  await cache.saveCache(info.paths, info.key);
}

async function restorePackage(packageName: string): Promise<boolean> {
  const info = await getCacheInfo(packageName);
  const key = await cache.restoreCache(info.paths, info.key);
  return key !== undefined;
}

export async function installPackage(packageName: string) {
  core.info(`Checking ${packageName}...`);
  const pkgInfo = await showPackageInfo(packageName);
  if (pkgInfo !== null) {
    core.info(`Package ${packageName} already installed`);
    return;
  }
  core.info(`Restoring ${packageName}...`);
  if (await restorePackage(packageName)) {
    core.info(`Done restoring ${packageName}...`);
    return;
  }
  await exec.exec("python3", ["-m", "pip", "install", "--user", packageName]);
  core.info(`Caching ${packageName}...`);
  await cachePackage(packageName);
}
