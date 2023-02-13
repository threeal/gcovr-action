import * as exec from "../../exec";
import log from "../../log";
import { showPackageInfo } from "./info";
import { PackageCacheInfo } from "./cache";

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
  await exec.exec("python3", ["-m", "pip", "install", packageName]);
}

export async function uninstallPackage(packageName: string) {
  await exec.exec("python3", ["-m", "pip", "uninstall", "-y", packageName]);
}

export async function installCachedPackage(packageName: string) {
  const pkgInfo = await showPackageInfo(packageName);
  if (pkgInfo !== null) return;
  packageName = validatePackageName(packageName);
  await log.group(
    `Installing ${log.emph(packageName)} package...`,
    async () => {
      log.info("Checking for cache...");
      const cacheInfo = new PackageCacheInfo(packageName);
      const contentInfo = await cacheInfo.restoreContentInfo();
      if (contentInfo !== undefined) {
        log.info("Restoring package from cache...");
        const key = await contentInfo.restore();
        if (key !== undefined) {
          log.info("Validating package...");
          const pkgInfo = await showPackageInfo(packageName);
          if (pkgInfo !== null) {
            log.info("Package is valid");
            return;
          }
          log.warning("Invalid package! Cache probably is corrupted");
        } else {
          log.warning("Could not restore package from cache!");
        }
      }
      log.info("Installing package using pip...");
      await installPackage(packageName);
      log.info("Saving package to cache...");
      try {
        const contentInfo = await cacheInfo.accumulateContentInfo();
        await contentInfo.save();
        await cacheInfo.saveContentInfo();
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "unknown error";
        log.warning(`Could not save package to cache! ${errMsg}`);
      }
      log.info("Validating package...");
      const pkgInfo = await showPackageInfo(packageName);
      if (pkgInfo === null) {
        log.error("Invalid package! Installation probably is corrupted");
        throw new Error("Invalid package");
      }
      log.info("Package is valid");
    }
  );
}
