import * as core from "@actions/core";
import * as exec from "../exec";

type PkgVers = { [key: string]: string | string };

async function list(): Promise<PkgVers> {
  const pkgVers: PkgVers = {};
  const out: string = await exec.execOut("pip3", ["list"]);
  const lines = out.split("\n");
  for (let i = 2; i < lines.length - 1; ++i) {
    const line = lines[i];
    const strs = line.split(/(\s+)/);
    if (strs.length === 3) {
      pkgVers[strs[0]] = strs[2];
    } else {
      core.info(`WARNING: Invalid line: ${strs}`);
    }
  }
  return pkgVers;
}

function diffPkgVers(prev: PkgVers, current: PkgVers): PkgVers {
  const diff: PkgVers = {};
  for (const key of Object.keys(current)) {
    if (key in prev && prev[key] === current[key]) {
      continue;
    }
    diff[key] = current[key];
  }
  return diff;
}

async function isPackageExist(pkg: string): Promise<boolean> {
  return await exec.execCheck("pip3", ["show", pkg]);
}

export async function pipInstall(pkg: string) {
  if (await isPackageExist(pkg)) {
    core.info(`Package ${pkg} already installed`);
    return;
  }
  const prev = await list();
  core.info(`Package list: ${JSON.stringify(prev)}`);
  await exec.exec("pip3", ["install", pkg]);
  const current = await list();
  core.info(`After install package list: ${JSON.stringify(current)}`);
  const diff = diffPkgVers(prev, current);
  core.info(`After install package list: ${JSON.stringify(diff)}`);
}
