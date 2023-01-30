import * as core from "@actions/core";
import * as exec from "../../exec";
import { showPackageInfo } from "./info";
import { cachePackage, restorePackage } from "./cache";

export async function installPackage(packageName: string) {
  core.info(`Checking ${packageName}...`);
  const pkgInfo = await showPackageInfo(packageName);
  if (pkgInfo !== null) {
    core.info(`Package ${packageName} already installed`);
    return;
  }
  core.info(`Restoring ${packageName}...`);
  if (await restorePackage(packageName)) {
    core.info(`Done restoring ${packageName}...`);
    const pkgInfo = await showPackageInfo(packageName);
    if (pkgInfo !== null) {
      for (const dependency of pkgInfo.dependencies) {
        core.info(`Installing ${dependency}...`);
        await installPackage(dependency);
      }
    } else {
      core.info(`WARNING: Package cache of ${packageName} is corrupted!`);
    }
  }
  const args = ["-m", "pip", "install", "--user", "--no-deps", packageName];
  await exec.exec("python3", args);
  core.info(`Caching ${packageName}...`);
  await cachePackage(packageName);
}
