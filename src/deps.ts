import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as os from "os";
import * as action from "./action";

async function isMissing(tool: string): Promise<boolean> {
  try {
    await io.which(tool, true);
    return false;
  } catch {
    return true;
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

async function pipInstall(pkg: string) {
  await exec.exec("pip3", ["install", pkg]);
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

async function checkGcovr() {
  core.info("Checking gcovr...");
  if (await isMissing("gcovr")) {
    await core.group("Installing gcovr...", async () => {
      await pipInstall("gcovr");
    });
  }
}

async function checkLlvm() {
  core.info("Checking llvm-cov...");
  if (await isMissing("llvm-cov")) {
    await core.group("Installing LLVM...", async () => {
      await smartInstall("llvm");
    });
  }
}

export async function check(inputs: action.Inputs) {
  await checkGcovr();
  if (inputs.gcovExecutable !== null) {
    if (inputs.gcovExecutable.includes("llvm-cov")) {
      await checkLlvm();
    }
  }
}
