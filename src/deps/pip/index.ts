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
    return;
  }
  await exec.exec("python3", ["-m", "pip", "install", "--user", packageName]);
  core.info(`Caching ${packageName}...`);
  await cachePackage(packageName);
}
