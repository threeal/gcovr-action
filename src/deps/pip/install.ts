import * as exec from "../../exec";

export async function installPackage(packageName: string) {
  await exec.exec("python3", ["-m", "pip", "install", packageName]);
}

export async function uninstallPackage(packageName: string) {
  await exec.exec("python3", ["-m", "pip", "uninstall", "-y", packageName]);
}
