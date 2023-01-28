import * as core from "@actions/core";
import * as exec from "@actions/exec";

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
  await exec.exec("pip3", ["install", pkg]);
}
