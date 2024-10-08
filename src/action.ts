import { getErrorMessage } from "catched-error-message";
import { getInput, logInfo } from "gha-utils";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  root: string;
  gcovExecutable: string;
  excludes: string[];
  failUnderLine: string;
  failUnderBranch: string;
  failUnderFunction: string;
  htmlOut: string;
  htmlOutDetails: boolean;
  htmlTheme: string;
  htmlTitle: string;
  xmlOut: string;
  coverallsOut: string;
  coverallsSend: boolean;
  githubToken: string;
  workingDirectory: string;
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
      failUnderBranch: getInput("fail-under-branch"),
      failUnderFunction: getInput("fail-under-function"),
      htmlOut: getInput("html-out"),
      htmlOutDetails: getInput("html-details") === "true",
      htmlTheme: getInput("html-theme"),
      htmlTitle: getInput("html-title"),
      xmlOut: getInput("xml-out"),
      coverallsOut: getInput("coveralls-out"),
      coverallsSend: getInput("coveralls-send") === "true",
      githubToken: getInput("github-token"),
      workingDirectory: getInput("working-directory"),
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
