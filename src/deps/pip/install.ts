import * as exec from "@actions-kit/exec";

export async function installPackage(packageName: string) {
  const res = await exec.exec("python3", ["-m", "pip", "install", packageName]);
  if (!res.isOk()) {
    throw new Error(
      `Failed to install pip package: ${packageName} (error code: ${res.code})`
    );
  }
}

export async function uninstallPackage(packageName: string) {
  const args = ["-m", "pip", "uninstall", "-y", packageName];
  const res = await exec.exec("python3", args);
  if (!res.isOk()) {
    throw new Error(
      `Failed to uninstall pip package: ${packageName} (error code: ${res.code})`
    );
  }
}
