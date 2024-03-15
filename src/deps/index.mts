import * as log from "@actions-kit/log";
import * as io from "@actions/io";
import { pipxInstallAction } from "pipx-install-action";

async function isMissing(tool: string): Promise<boolean> {
  try {
    await io.which(tool, true);
    return false;
  } catch {
    return true;
  }
}

async function checkGcovr() {
  log.info(`Checking ${log.emph("gcovr")}...`);
  if (await isMissing("gcovr")) {
    await pipxInstallAction("gcovr");
  }
}

export async function check() {
  await checkGcovr();
}
