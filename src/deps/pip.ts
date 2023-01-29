import * as core from "@actions/core";
import * as exec from "../exec";

type PackageVers = { [key: string]: string | string };

async function listPackageVers(): Promise<PackageVers> {
  const packageVers: PackageVers = {};
  const out: string = await exec.execOut("pip3", ["list"]);
  const lines = out.split("\n");
  for (let i = 2; i < lines.length - 1; ++i) {
    const line = lines[i];
    const strs = line.split(/(\s+)/);
    if (strs.length >= 3) {
      packageVers[strs[0]] = strs[2];
    } else {
      core.info(`WARNING: Invalid line: ${strs}`);
    }
  }
  return packageVers;
}

function diffPackageVers(
  previous: PackageVers,
  current: PackageVers
): PackageVers {
  const diff: PackageVers = {};
  for (const key of Object.keys(current)) {
    if (key in previous && previous[key] === current[key]) {
      continue;
    }
    diff[key] = current[key];
  }
  return diff;
}

async function isPackageExist(packageName: string): Promise<boolean> {
  return await exec.execCheck("pip3", ["show", packageName]);
}

export async function installPackage(packageName: string) {
  if (await isPackageExist(packageName)) {
    core.info(`Package ${packageName} already installed`);
    return;
  }
  let packageVers = await listPackageVers();
  await exec.exec("pip3", ["install", packageName]);
  packageVers = diffPackageVers(packageVers, await listPackageVers());
  core.info(`After install package list: ${JSON.stringify(packageVers)}`);
}
