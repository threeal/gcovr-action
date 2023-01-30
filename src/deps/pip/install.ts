import * as core from "@actions/core";
import * as exec from "../../exec";
import { showPackageInfo } from "./info";
import { cachePackage, restorePackage } from "./cache";

export async function installPackage(packageName: string) {
  const pkgInfo = await core.group(
    `Installing ${packageName} package...`,
    async () => {
      core.info(`Checking ${packageName} package...`);
      let pkgInfo = await showPackageInfo(packageName);
      if (pkgInfo !== null) {
        core.info(`Package ${packageName} is already installed`);
        return pkgInfo;
      }
      core.info(`Restoring ${packageName} package from cache...`);
      if (await restorePackage(packageName)) {
        core.info(`Done restoring ${packageName} package from cache`);
      } else {
        core.info(`Failed to restore ${packageName} package from cache`);
        core.info(`Installing ${packageName} package using pip...`);
        await exec.exec("python3", [
          "-m",
          "pip",
          "install",
          "--user",
          "--no-deps",
          packageName,
        ]);
        core.info(`Saving ${packageName} package to cache...`);
        await cachePackage(packageName);
      }
      core.info(`Validating ${packageName} package...`);
      pkgInfo = await showPackageInfo(packageName);
      if (pkgInfo === null) {
        throw new Error(
          `Could not find ${packageName} package. Cache or installation may corrupted!`
        );
      }
      return pkgInfo;
    }
  );
  for (const dependency of pkgInfo.dependencies) {
    await installPackage(dependency);
  }
}
