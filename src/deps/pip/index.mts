import * as log from "@actions-kit/log";
import * as pip from "@actions-kit/pip";

async function restorePackage(packageName: string): Promise<boolean> {
  try {
    const cacheInfo = new pip.PackageCacheInfo(packageName);
    const contentInfo = await cacheInfo.restoreContentInfo();
    if (contentInfo === undefined) {
      log.warning("Cache does not exist!");
      return false;
    }
    const key = await contentInfo.restore();
    if (key === undefined) {
      log.warning("Content cache does not exist");
      return false;
    }
    log.info("Validating package...");
    const pkgInfo = await pip.showPackageInfo(packageName);
    if (pkgInfo === undefined) {
      log.error("Invalid package! Cache probably is corrupted");
      return false;
    }
    log.info("Package is valid");
    return true;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "unknown error";
    log.error(`Could not restore package from cache! ${errMsg}`);
    return false;
  }
}

async function savePackage(packageName: string) {
  const cacheInfo = new pip.PackageCacheInfo(packageName);
  try {
    const contentInfo = await cacheInfo.accumulateContentInfo();
    await contentInfo.save();
    await cacheInfo.saveContentInfo(contentInfo);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "unknown error";
    log.error(`Could not save package to cache! ${errMsg}`);
  }
}

export async function restoreOrInstallPackage(packageName: string) {
  let pkgInfo = await pip.showPackageInfo(packageName);
  if (pkgInfo !== undefined) return;
  await log.group(
    `Installing ${log.emph(packageName)} package...`,
    async () => {
      log.info("Restoring package from cache...");
      if (await restorePackage(packageName)) return;
      log.info("Installing package using pip...");
      await pip.installPackage(packageName);
      log.info("Saving package to cache...");
      await savePackage(packageName);
      log.info("Validating package...");
      pkgInfo = await pip.showPackageInfo(packageName);
      if (pkgInfo === undefined) {
        log.error("Invalid package! Installation probably is corrupted");
        throw new Error("Invalid package");
      }
      log.info("Package is valid");
    },
  );
}
