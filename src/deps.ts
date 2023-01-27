import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as os from "os";

async function isAvailable(tool: string): Promise<boolean> {
  try {
    await io.which(tool, true);
    return true;
  } catch {
    return false;
  }
}

async function chocoInstall(pkg: string) {
  await exec.exec("choco", ["install", "-y", pkg]);
}

async function aptInstall(pkg: string) {
  await exec.exec("sudo", ["apt-get", "install", "-y", pkg]);
}

async function brewInstall(pkg: string) {
  await exec.exec("brew", ["install", pkg]);
}

async function smartInstall(pkg: string) {
  switch (os.type()) {
    case "Windows_NT":
      await chocoInstall(pkg);
      break;
    case "Linux":
      await aptInstall(pkg);
      break;
    case "Darwin":
      await brewInstall(pkg);
      break;
    default:
      throw new Error(`unknown OS type: ${os.type()}`);
  }
}

export async function checkLlvm() {
  const available = await isAvailable("llvm-cov");
  if (!available) {
    await core.group("Install LLVM", async () => {
      await smartInstall("llvm");
    });
  }
}
