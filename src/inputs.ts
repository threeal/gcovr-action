import * as core from "@actions/core";

export interface Inputs {
  root: string;
  gcovExecutable: string;
  exclude: string;
  failUnderLine: number;
  coverallsOut: string;
  coverallsSend: boolean;
  githubToken: string;
}

function getNumberInput(key: string): number {
  return parseInt(core.getInput(key), 10);
}

export function parseInputs(): Inputs {
  return {
    root: core.getInput("root"),
    gcovExecutable: core.getInput("gcov-executable"),
    exclude: core.getInput("exclude"),
    failUnderLine: getNumberInput("fail-under-line"),
    coverallsOut: core.getInput("coveralls-out"),
    coverallsSend: core.getBooleanInput("coveralls-send"),
    githubToken: core.getInput("github-token"),
  };
}
