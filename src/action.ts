import * as envi from "@actions-kit/envi";
import * as log from "@actions-kit/log";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  root: string | null;
  gcovExecutable: string | null;
  exclude: string | null;
  failUnderLine: number | null;
  coverallsOut: string | null;
  coverallsSend: boolean;
  githubToken: string | null;
}

export function processInputs(): Inputs {
  log.info("Processing the action inputs...");
  const inputs: Inputs = {
    root: envi.getStringInput("root"),
    gcovExecutable: envi.getStringInput("gcov-executable"),
    exclude: envi.getStringInput("exclude"),
    failUnderLine: envi.getNumberInput("fail-under-line"),
    coverallsOut: envi.getStringInput("coveralls-out"),
    coverallsSend: envi.getBooleanInput("coveralls-send"),
    githubToken: envi.getStringInput("github-token"),
  };
  // Auto set coveralls output if not specified
  if (inputs.coverallsSend && inputs.coverallsOut === null) {
    inputs.coverallsOut = path.join(os.tmpdir(), "coveralls.json");
    log.info(`Auto set Coveralls output to ${log.emph(inputs.coverallsOut)}`);
  }
  return inputs;
}
