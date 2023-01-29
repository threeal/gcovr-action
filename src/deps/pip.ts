import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as os from "os";
import * as path from "path";
import * as exec from "../exec";

interface PackageInfo {
  name: string;
  version: string;
  location: string;
}

type PackageInfos = { [key: string]: PackageInfo };

let tempUserSitePckages: string | null = null;

async function getUserSitePackages(): Promise<string> {
  if (tempUserSitePckages === null) {
    const cmd = "import site; print(site.getusersitepackages())";
    const out = await exec.execOut("python3", ["-c", cmd]);
    tempUserSitePckages = out.trim();
  }
  return tempUserSitePckages;
}

async function listPackageInfos(): Promise<PackageInfos> {
  const packageInfos: PackageInfos = {};
  const args = ["-m", "pip", "list", "-v"];
  const out: string = await exec.execOut("python3", args);
  const lines = out.split("\n");
  for (let i = 2; i < lines.length - 1; ++i) {
    const line = lines[i];
    const strs = line.split(/(\s+)/);
    if (strs.length >= 5) {
      packageInfos[strs[0]] = {
        name: strs[0],
        version: strs[2],
        location: strs[4],
      };
    } else {
      core.info(`WARNING: Invalid line: ${strs}`);
    }
  }
  return packageInfos;
}

function diffPackageInfos(
  previous: PackageInfos,
  current: PackageInfos
): PackageInfos {
  const diff: PackageInfos = {};
  for (const key of Object.keys(current)) {
    if (key in previous && previous[key].version === current[key].version) {
      continue;
    }
    diff[key] = current[key];
  }
  return diff;
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

async function cachePackage(packageInfo: PackageInfo): Promise<void> {
  const info = await getCacheInfo(packageInfo.name);
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
  let packageInfos = await listPackageInfos();
  await exec.exec("python3", ["-m", "pip", "install", "--user", packageName]);
  packageInfos = diffPackageInfos(packageInfos, await listPackageInfos());
  for (const packageInfo of Object.values(packageInfos)) {
    core.info(`Caching ${packageInfo.name}-${packageInfo.version}...`);
    await cachePackage(packageInfo);
  }
}
