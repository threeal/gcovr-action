import * as core from "@actions/core";
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
  core.info(`Checking \u001b[34mgcovr\u001b[39m...`);
  if (await isMissing("gcovr")) {
    await pipxInstallAction("gcovr");
  }
}

export async function check() {
  await checkGcovr();
}
