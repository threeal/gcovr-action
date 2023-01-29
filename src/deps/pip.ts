import * as core from "@actions/core";
import * as exec from "../exec";

interface PackageInfo {
  name: string;
  version: string;
  location: string;
}

type PackageInfos = { [key: string]: PackageInfo };

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

async function isPackageExist(packageName: string): Promise<boolean> {
  return await exec.execCheck("python3", ["-m", "pip", "show", packageName]);
}

export async function installPackage(packageName: string) {
  if (await isPackageExist(packageName)) {
    core.info(`Package ${packageName} already installed`);
    return;
  }
  let packageInfos = await listPackageInfos();
  await exec.exec("python3", ["-m", "pip", "install", packageName]);
  packageInfos = diffPackageInfos(packageInfos, await listPackageInfos());
  core.info(`After install package list: ${JSON.stringify(packageInfos)}`);
  for (const packageInfo of Object.values(packageInfos)) {
    core.info(`'${packageInfo.name}' info: ${JSON.stringify(packageInfo)}`);
    await exec.exec("ls", [packageInfo.location]);
  }
}
