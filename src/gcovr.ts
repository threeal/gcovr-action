import * as exec from "@actions/exec";
import { getErrorMessage } from "catched-error-message";
import { beginLogGroup, endLogGroup, logInfo } from "gha-utils";
import * as process from "process";
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
  for (const filter of inputs.filter) {
    args = args.concat("--filter", filter);
  }
  if (inputs.failUnderLine.length > 0) {
    args = args.concat("--fail-under-line", inputs.failUnderLine);
  }
  if (inputs.failUnderBranch.length > 0) {
    args = args.concat("--fail-under-branch", inputs.failUnderBranch);
  }
  if (inputs.failUnderFunction.length > 0) {
    args = args.concat("--fail-under-function", inputs.failUnderFunction);
  }
  if (inputs.failUnderDecision.length > 0) {
    args = args.concat("--fail-under-decision", inputs.failUnderDecision);
  }
  if (inputs.coberturaOut.length > 0) {
    args = args.concat("--cobertura", inputs.coberturaOut);
  }
  if (inputs.coberturaPretty) {
    args = args.concat("--cobertura-pretty");
  }
  if (inputs.htmlOut.length > 0) {
    if (inputs.htmlOutDetails) {
      args = args.concat("--html-details", inputs.htmlOut);
    } else {
      args = args.concat("--html", inputs.htmlOut);
    }
  }
  if (inputs.htmlTheme.length > 0) {
    args = args.concat("--html-theme", inputs.htmlTheme);
  }
  if (inputs.htmlTitle.length > 0) {
    args = args.concat("--html-title", inputs.htmlTitle);
  }
  if (inputs.jsonOut.length > 0) {
    args = args.concat("--json", inputs.jsonOut);
  }
  if (inputs.jsonPretty) {
    args = args.concat("--json-pretty");
  }
  if (inputs.jsonSummaryOut.length > 0) {
    args = args.concat("--json-summary", inputs.jsonSummaryOut);
  }
  if (inputs.jsonSummaryPretty) {
    args = args.concat("--json-summary-pretty");
  }
  if (inputs.lcovOut.length > 0) {
    args = args.concat("--lcov", inputs.lcovOut);
  }
  if (inputs.sonarqubeOut.length > 0) {
    args = args.concat("--sonarqube", inputs.sonarqubeOut);
  }
  if (inputs.txtOut.length > 0) {
    args = args.concat("--txt", inputs.txtOut);
  }
  if (inputs.xmlOut.length > 0) {
    args = args.concat("--xml", inputs.xmlOut);
  }
  if (inputs.coverallsOut.length > 0) {
    args = args.concat("--coveralls", inputs.coverallsOut);
  }
  if (inputs.calls) {
    args = args.concat("--calls");
  }
  if (inputs.decisions) {
    args = args.concat("--decisions");
  }
  if (inputs.jobs) {
    if (typeof inputs.jobs === "number") {
      args = args.concat("-j", inputs.jobs.toString());
    } else if (typeof inputs.jobs === "boolean") {
      args = args.concat("-j");
    }
  }
  if (inputs.printSummary) {
    args = args.concat("--print-summary");
  }
  return args;
}

export async function run(inputs: action.Inputs) {
  const args = getArgs(inputs);
  beginLogGroup("Generating code coverage report...");
  if (inputs.workingDirectory.length > 0) {
    process.chdir(inputs.workingDirectory);
    console.log(`Current directory: ${process.cwd()}`);
  }
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
        errMessage = `coverage is under configured targets.`;
      } else {
        errMessage = `unknown error (error code ${status.toString()})`;
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
