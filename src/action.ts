import { getErrorMessage } from "catched-error-message";
import { getInput, logInfo } from "gha-utils";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  root: string;
  gcovExecutable: string;
  excludes: string[];
  failUnderLine: string;
  htmlOut: string;
  htmlTheme: string;
  xmlOut: string;
  coverallsOut: string;
  coverallsSend: boolean;
  githubToken: string;
}

export function processInputs(): Inputs {
  logInfo("Processing the action inputs...");
  try {
    const inputs: Inputs = {
      root: getInput("root"),
      gcovExecutable: getInput("gcov-executable"),
      excludes: getInput("excludes")
        .split(/\s+/)
        .map((val) => val.trim())
        .filter((val) => val !== ""),
      failUnderLine: getInput("fail-under-line"),
      htmlOut: getInput("html-out"),
      htmlTheme: getInput("html-theme"),
      xmlOut: getInput("xml-out"),
      coverallsOut: getInput("coveralls-out"),
      coverallsSend: getInput("coveralls-send") === "false",
      githubToken: getInput("github-token"),
    };
    // Auto set coveralls output if not specified
    if (inputs.coverallsSend && inputs.coverallsOut.length <= 0) {
      inputs.coverallsOut = path.join(os.tmpdir(), "coveralls.json");
      logInfo(
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
