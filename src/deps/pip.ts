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

let tempSitePckages: string | null = null;

async function getSitePackages(): Promise<string> {
  if (tempSitePckages === null) {
    const cmd = "import site; print(site.getusersitepackages())";
    const out = await exec.execOut("python3", ["-c", cmd]);
    tempSitePckages = out.trim();
  }
  return tempSitePckages;
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

async function cachePackage(packageInfo: PackageInfo): Promise<void> {
  const loc = packageInfo.location;
  await cache.saveCache(
    [
      path.join(loc, packageInfo.name.toLowerCase()),
      path.join(loc, `${packageInfo.name}-${packageInfo.version}.dist-info`),
    ],
    `pip-${os.type()}-${packageInfo.name}-${packageInfo.version}`
  );
}

async function isPackageExist(packageName: string): Promise<boolean> {
  return await exec.execCheck("python3", ["-m", "pip", "show", packageName]);
}

export async function installPackage(packageName: string) {
  if (await isPackageExist(packageName)) {
    core.info(`Package ${packageName} already installed`);
    return;
  }
  core.info(`Using site packages: ${await getSitePackages()}`);
  let packageInfos = await listPackageInfos();
  await exec.exec("python3", ["-m", "pip", "install", packageName]);
  packageInfos = diffPackageInfos(packageInfos, await listPackageInfos());
  for (const packageInfo of Object.values(packageInfos)) {
    core.info(`Caching ${packageInfo.name}-${packageInfo.version}...`);
    await cachePackage(packageInfo);
  }
}
