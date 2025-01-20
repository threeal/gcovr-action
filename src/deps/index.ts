import * as io from "@actions/io";
import { logInfo } from "gha-utils";
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
  logInfo(`Checking \u001b[34mgcovr\u001b[39m...`);
  if (await isMissing("gcovr")) {
    await pipxInstallAction("gcovr");
  }
}

export async function check() {
  await checkGcovr();
}
