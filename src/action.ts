import * as core from "@actions/core";
import * as os from "os";
import * as path from "path";
import log from "./log";

export interface Inputs {
  root: string | null;
  gcovExecutable: string | null;
  exclude: string | null;
  failUnderLine: number | null;
  coverallsOut: string | null;
  coverallsSend: boolean;
  githubToken: string | null;
}

function getStringInput(key: string): string | null {
  const val = core.getInput(key);
  return val.length > 0 ? val : null;
}

function getNumberInput(key: string): number | null {
  const val = getStringInput(key);
  if (val === null) return null;
  return parseInt(val, 10);
}

export function processInputs(): Inputs {
  log.info("Processing the action inputs...");
  const inputs: Inputs = {
    root: getStringInput("root"),
    gcovExecutable: getStringInput("gcov-executable"),
    exclude: getStringInput("exclude"),
    failUnderLine: getNumberInput("fail-under-line"),
    coverallsOut: getStringInput("coveralls-out"),
    coverallsSend: core.getBooleanInput("coveralls-send"),
    githubToken: getStringInput("github-token"),
  };
  // Auto set coveralls output if not specified
  if (inputs.coverallsSend && inputs.coverallsOut === null) {
    inputs.coverallsOut = path.join(os.tmpdir(), "coveralls.json");
    log.info(`Auto set Coveralls output to '${inputs.coverallsOut}'`);
  }
  return inputs;
}
