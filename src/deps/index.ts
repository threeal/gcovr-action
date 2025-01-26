import * as io from "@actions/io";
import { logInfo } from "gha-utils";
import { pipxInstallAction } from "pipx-install-action";
import * as action from "../action.js";

async function isMissing(tool: string): Promise<boolean> {
  try {
    await io.which(tool, true);
    return false;
  } catch {
    return true;
  }
}

async function checkGcovr(inputs: action.Inputs) {
  logInfo(`Checking \u001b[34mgcovr\u001b[39m...`);
  if (inputs.force_install || (await isMissing("gcovr"))) {
    await pipxInstallAction("gcovr" + inputs.version);
  }
}

export async function check(inputs: action.Inputs) {
  await checkGcovr(inputs);
}
