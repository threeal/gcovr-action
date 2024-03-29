import * as core from "@actions/core";
import { getErrorMessage } from "catched-error-message";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  root: string;
  gcovExecutable: string;
  excludes: string[];
  failUnderLine: string;
  xmlOut: string;
  coverallsOut: string;
  coverallsSend: boolean;
  githubToken: string;
}

export function processInputs(): Inputs {
  core.info("Processing the action inputs...");
  try {
    const inputs: Inputs = {
      root: core.getInput("root"),
      gcovExecutable: core.getInput("gcov-executable"),
      excludes: core.getMultilineInput("excludes"),
      failUnderLine: core.getInput("fail-under-line"),
      xmlOut: core.getInput("xml-out"),
      coverallsOut: core.getInput("coveralls-out"),
      coverallsSend: core.getBooleanInput("coveralls-send"),
      githubToken: core.getInput("github-token"),
    };
    // Auto set coveralls output if not specified
    if (inputs.coverallsSend && inputs.coverallsOut.length <= 0) {
      inputs.coverallsOut = path.join(os.tmpdir(), "coveralls.json");
      core.info(
        `Auto set Coveralls output to \u001b[34m${inputs.coverallsOut}\u001b[39m`,
      );
    }
    return inputs;
  } catch (err) {
    throw new Error(
      `Failed to process the action inputs: ${getErrorMessage(err)}`,
    );
  }
}
