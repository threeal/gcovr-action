import * as exec from "@actions/exec";
import { getErrorMessage } from "catched-error-message";
import { beginLogGroup, endLogGroup, logInfo } from "gha-utils";
import * as action from "./action.js";
import * as coveralls from "./coveralls.js";

function getArgs(inputs: action.Inputs): string[] {
  let args: string[] = [];
  if (inputs.root.length > 0) {
    args = args.concat(["--root", inputs.root]);
  }
  if (inputs.gcovExecutable.length > 0) {
    args = args.concat("--gcov-executable", inputs.gcovExecutable);
  }
  for (const exclude of inputs.excludes) {
    args = args.concat("--exclude", exclude);
  }
  if (inputs.failUnderLine.length > 0) {
    args = args.concat("--fail-under-line", inputs.failUnderLine);
  }
  if (inputs.xmlOut.length > 0) {
    args = args.concat("--xml", inputs.xmlOut);
  }
  if (inputs.coverallsOut.length > 0) {
    args = args.concat("--coveralls", inputs.coverallsOut);
  }
  return args;
}

export async function run(inputs: action.Inputs) {
  const args = getArgs(inputs);
  beginLogGroup("Generating code coverage report...");
  try {
    const status = await exec.exec("gcovr", args, {
      ignoreReturnCode: true,
      env: {
        COVERALLS_REPO_TOKEN: inputs.githubToken,
      },
    });
    if (status !== 0) {
      let errMessage: string;
      if ((status | 2) > 0) {
        errMessage = `coverage is under ${inputs.failUnderLine}%`;
      } else {
        errMessage = `unknown error (error code ${status})`;
      }
      throw new Error(`Failed to generate code coverage report: ${errMessage}`);
    }
    if (inputs.coverallsOut.length > 0) {
      logInfo("Patching Coveralls API report...");
      try {
        coveralls.patch(inputs.coverallsOut);
      } catch (err) {
        throw new Error(
          `Failed to patch Coveralls API report: ${getErrorMessage(err)}`,
        );
      }
      logInfo(
        `Coveralls API report outputted to \u001b[34m${inputs.coverallsOut}\u001b[39m`,
      );
    }
  } catch (err) {
    endLogGroup();
    throw err;
  }
  endLogGroup();
}
