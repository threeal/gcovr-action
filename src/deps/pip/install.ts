import * as exec from "../../exec";
import log from "../../log";
import { PackageInfo, showPackageInfo } from "./info";
import { cachePackage, restorePackage } from "./cache";

function validatePackageName(packageName: string): string {
  switch (packageName.toLowerCase()) {
    case "jinja2":
      return "Jinja2";
    case "pygments":
      return "Pygments";
  }
  return packageName;
}

export async function installPackage(packageName: string) {
  await exec.exec("python3", [
    "-m",
    "pip",
    "install",
    "--no-deps",
    packageName,
  ]);
}

export async function uninstallPackage(packageName: string) {
  await exec.exec("python3", ["-m", "pip", "uninstall", "-y", packageName]);
}

export async function installCachedPackage(packageName: string) {
  let pkgInfo = await showPackageInfo(packageName);
  if (pkgInfo === null) {
    packageName = validatePackageName(packageName);
    pkgInfo = await log.group(
      `Installing ${log.emph(packageName)} package...`,
      async (): Promise<PackageInfo> => {
        log.info("Restoring package from cache...");
        if (await restorePackage(packageName)) {
          log.info("Validating package...");
          const pkgInfo = await showPackageInfo(packageName);
          if (pkgInfo !== null) {
            log.info("Package is valid");
            return pkgInfo;
          }
          log.warning("Invalid package. Cache probably is corrupted!");
        }
        log.info("Installing package using pip...");
        installPackage(packageName);
        log.info("Saving package to cache...");
        await cachePackage(packageName);
        log.info("Validating package...");
        const pkgInfo = await showPackageInfo(packageName);
        if (pkgInfo === null) {
          throw new Error(
            "Invalid package. Installation probably is corrupted!"
          );
        }
        log.info("Package is valid");
        return pkgInfo;
      }
    );
  }
  for (const dependency of pkgInfo.dependencies) {
    await installCachedPackage(dependency);
  }
}
