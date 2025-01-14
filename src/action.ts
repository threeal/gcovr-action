import { getErrorMessage } from "catched-error-message";
import { getInput, logInfo } from "gha-utils";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  version: string;
  force_install: boolean;
  root: string;
  gcovExecutable: string;
  excludes: string[];
  filter: string[];
  failUnderLine: string;
  failUnderBranch: string;
  failUnderFunction: string;
  failUnderDecision: string;
  coberturaOut: string;
  coberturaPretty: boolean;
  htmlOut: string;
  htmlOutDetails: boolean;
  htmlTheme: string;
  htmlTitle: string;
  jacocoOut: string;
  jsonOut: string;
  jsonPretty: boolean;
  jsonSummaryOut: string;
  jsonSummaryPretty: boolean;
  lcovOut: string;
  sonarqubeOut: string;
  txtOut: string;
  xmlOut: string;
  coverallsOut: string;
  coverallsSend: boolean;
  githubToken: string;
  workingDirectory: string;
  decisions: boolean;
  calls: boolean;
  j: boolean | number;
  printSummary: boolean;
}

export function processInputs(): Inputs {
  logInfo("Processing the action inputs...");
  try {
    const inputs: Inputs = {
      version: getInput("version"),
      force_install: getInput("force_install") === "true",
      root: getInput("root"),
      gcovExecutable: getInput("gcov-executable"),
      excludes: getInput("excludes")
        .split(/\s+/)
        .map((val) => val.trim())
        .filter((val) => val !== ""),
      filter: getInput("filter")
        .split(/\s+/)
        .map((val) => val.trim())
        .filter((val) => val !== ""),
      failUnderLine: getInput("fail-under-line"),
      failUnderBranch: getInput("fail-under-branch"),
      failUnderFunction: getInput("fail-under-function"),
      failUnderDecision: getInput("fail-under-decision"),
      coberturaOut: getInput("cobertura-out"),
      coberturaPretty: getInput("cobertura-pretty") === "true",
      htmlOut: getInput("html-out"),
      htmlOutDetails: getInput("html-details") === "true",
      htmlTheme: getInput("html-theme"),
      htmlTitle: getInput("html-title"),
      jacocoOut: getInput("jacoco-out"),
      jsonOut: getInput("json-out"),
      jsonPretty: getInput("json-pretty") === "true",
      jsonSummaryOut: getInput("json-summary-out"),
      jsonSummaryPretty: getInput("json-summary-pretty") === "true",
      lcovOut: getInput("lcov-out"),
      sonarqubeOut: getInput("sonarqube-out"),
      txtOut: getInput("txt-out"),
      xmlOut: getInput("xml-out"),
      coverallsOut: getInput("coveralls-out"),
      coverallsSend: getInput("coveralls-send") === "true",
      githubToken: getInput("github-token"),
      workingDirectory: getInput("working-directory"),
      decisions: getInput("decisions") === "true",
      calls: getInput("calls") === "true",
      j: (() => {
        const val = getInput("j");
        if (val === "true") return true;
        if (val === "false") return false;
        const asNumber = parseInt(val, 10);
        return isNaN(asNumber) ? false : asNumber;
      })(),
      printSummary: getInput("print-summary") === "true",
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
