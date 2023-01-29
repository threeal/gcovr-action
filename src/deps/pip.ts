import * as core from "@actions/core";
import * as exec from "@actions/exec";

type PkgVers = { [key: string]: string | string };

export async function list(): Promise<PkgVers> {
  const pkgVers: PkgVers = {};
  let out: string = "";
  await exec.exec("pip3", ["list"], {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        out += data.toString();
      },
    },
  });
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

async function isPackageExist(pkg: string): Promise<boolean> {
  const rc = await exec.exec("pip3", ["show", pkg], {
    silent: true,
    ignoreReturnCode: true,
  });
  return rc === 0;
}

export async function pipInstall(pkg: string) {
  if (await isPackageExist(pkg)) {
    core.info(`Package ${pkg} already installed`);
    return;
  }
  core.info(`Package list: ${JSON.stringify(await list())}`);
  await exec.exec("pip3", ["install", pkg]);
  core.info(`After install package list: ${JSON.stringify(await list())}`);
}
