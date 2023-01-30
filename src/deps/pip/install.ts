import * as core from "@actions/core";
import * as exec from "../../exec";
import { showPackageInfo } from "./info";
import { cachePackage, restorePackage } from "./cache";

export async function installPackage(packageName: string) {
  core.info(`Checking ${packageName}...`);
  if ((await showPackageInfo(packageName)) !== null) {
    core.info(`Package ${packageName} already installed`);
    return;
  }
  await core.group(`Restoring ${packageName}...`, async () => {
    if (await restorePackage(packageName)) {
      core.info(`Done restoring ${packageName}`);
    } else {
      core.info(`Failed to restore ${packageName}`);
      await core.group(`Installing ${packageName}...`, async () => {
        await exec.exec("python3", [
          "-m",
          "pip",
          "install",
          "--user",
          "--no-deps",
          packageName,
        ]);
      });
      await core.group(`Caching ${packageName}...`, async () => {
        await cachePackage(packageName);
      });
    }
  });
  const pkgInfo = await showPackageInfo(packageName);
  if (pkgInfo === null) {
    throw new Error(
      `Could not find package ${packageName}. Cache or installation may corrupted!`
    );
  }
  await core.group(`Installing ${packageName} dependencies...`, async () => {
    for (const dependency of pkgInfo.dependencies) {
      core.info(`Installing ${dependency}...`);
      await installPackage(dependency);
    }
  });
}
