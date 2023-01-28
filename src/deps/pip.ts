import * as exec from "@actions/exec";

export async function pipInstall(pkg: string) {
  await exec.exec("pip3", ["install", pkg]);
}
