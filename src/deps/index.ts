import * as exec from "@actions-kit/exec";
import * as log from "@actions-kit/log";
import * as io from "@actions/io";
import * as os from "os";
import * as action from "../action.js";
import * as pip from "./pip/index.js";

async function isMissing(tool: string): Promise<boolean> {
  try {
    await io.which(tool, true);
    return false;
  } catch {
    return true;
  }
}

async function chocoInstall(pkg: string) {
  const res = await exec.run("choco", "install", "-y", pkg);
  if (!res.isOk()) {
    throw new Error(
      `Failed to install Chocolatey package: ${pkg} (error code: ${res.code})`,
    );
  }
}

async function aptInstall(pkg: string) {
  const res = await exec.run("sudo", "apt-get", "install", "-y", pkg);
  if (!res.isOk()) {
    throw new Error(
      `Failed to install APT package: ${pkg} (error code: ${res.code})`,
    );
  }
}

async function brewInstall(pkg: string) {
  const res = await exec.run("brew", "install", pkg);
  if (!res.isOk()) {
    throw new Error(
      `Failed to install Homebrew package: ${pkg} (error code: ${res.code})`,
    );
  }
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
      throw new Error(`Unknown OS type: ${os.type()}`);
  }
}

async function checkGcovr() {
  log.info(`Checking ${log.emph("gcovr")}...`);
  if (await isMissing("gcovr")) {
    await pip.restoreOrInstallPackage("gcovr");
  }
}

async function checkLlvm() {
  log.info(`Checking ${log.emph("llvm-cov")}...`);
  if (await isMissing("llvm-cov")) {
    await log.group(`Installing ${log.emph("LLVM")}...`, async () => {
      await smartInstall("llvm");
    });
  }
}

export async function check(inputs: action.Inputs) {
  await checkGcovr();
  if (inputs.gcovExecutable !== undefined) {
    if (inputs.gcovExecutable.includes("llvm-cov")) {
      await checkLlvm();
    }
  }
}
