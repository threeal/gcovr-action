import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as os from "os";
import * as path from "path";
import * as exec from "../exec";

let tempUserSitePckages: string | null = null;

async function getUserSitePackages(): Promise<string> {
  if (tempUserSitePckages === null) {
    const cmd = "import site; print(site.getusersitepackages())";
    const out = await exec.execOut("python3", ["-c", cmd]);
    tempUserSitePckages = out.trim();
  }
  return tempUserSitePckages;
}

interface CacheInfo {
  paths: string[];
  key: string;
}

async function getCacheInfo(packageName: string): Promise<CacheInfo> {
  const root = await getUserSitePackages();
  return {
    paths: [
      path.join(root, `${packageName.toLowerCase()}*`),
      path.join(root, `${packageName}*`),
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

async function isPackageExist(packageName: string): Promise<boolean> {
  return await exec.execCheck("python3", ["-m", "pip", "show", packageName]);
}

export async function installPackage(packageName: string) {
  if (await isPackageExist(packageName)) {
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
