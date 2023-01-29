import * as core from "@actions/core";
import * as exec from "../exec";

type PackageVers = { [key: string]: string };

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

interface PackageInfo {
  name: string;
  version: string;
  location: string;
}

async function showPackageInfo(packageName: string): Promise<PackageInfo> {
  const out: string = await exec.execOut("pip3", ["show", packageName]);
  const lines = out.split("\n");
  const info: { [key: string]: string } = {};
  for (let i = 0; i < lines.length - 1; ++i) {
    const strs = lines[i].split(/:(.*)/s);
    if (strs.length >= 2) {
      info[strs[0].trim()] = strs[1].trim();
    } else {
      core.info(`WARNING: Invalid line: ${strs}`);
    }
  }
  return {
    name: info["Name"],
    version: info["Version"],
    location: info["Location"],
  };
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
  for (const name of Object.keys(packageVers)) {
    const packageInfo = await showPackageInfo(name);
    core.info(`'${name}' info: ${JSON.stringify(packageInfo)}`);
    await exec.exec("ls", [packageInfo.location]);
  }
}
