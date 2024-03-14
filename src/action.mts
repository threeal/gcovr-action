import * as core from "@actions/core";
import * as envi from "@actions-kit/envi";
import * as log from "@actions-kit/log";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  root: string;
  gcovExecutable: string;
  excludes: string[];
  failUnderLine: number | undefined;
  xmlOut: string;
  coverallsOut: string;
  coverallsSend: boolean;
  githubToken: string;
}

export function processInputs(): Inputs {
  log.info("Processing the action inputs...");
  try {
    const inputs: Inputs = {
      root: core.getInput("root"),
      gcovExecutable: core.getInput("gcov-executable"),
      excludes: envi.getMultilineInput("excludes"),
      failUnderLine: envi.getNumberInput("fail-under-line"),
      xmlOut: core.getInput("xml-out"),
      coverallsOut: core.getInput("coveralls-out"),
      coverallsSend: core.getBooleanInput("coveralls-send"),
      githubToken: core.getInput("github-token"),
    };
    // Auto set coveralls output if not specified
    if (inputs.coverallsSend && inputs.coverallsOut.length <= 0) {
      inputs.coverallsOut = path.join(os.tmpdir(), "coveralls.json");
      log.info(`Auto set Coveralls output to ${log.emph(inputs.coverallsOut)}`);
    }
    return inputs;
  } catch (err) {
    const errMessage = `${err instanceof Error ? err.message : err}`;
    throw new Error(`Failed to process the action inputs: ${errMessage}`);
  }
}
