import { pip } from "./pip";

export async function installPackage(packageName: string) {
  const res = await pip.exec("install", packageName);
  if (!res.isOk()) {
    throw new Error(
      `Failed to install pip package: ${packageName} (error code: ${res.code})`
    );
  }
}

export async function uninstallPackage(packageName: string) {
  const res = await pip.exec("uninstall", "-y", packageName);
  if (!res.isOk()) {
    throw new Error(
      `Failed to uninstall pip package: ${packageName} (error code: ${res.code})`
    );
  }
}
