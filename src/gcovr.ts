import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { parseInputs } from "./inputs";

function parseArgs(): string[] {
  let args: string[] = [];
  const inputs = parseInputs();
  if (inputs.root !== null) {
    args = args.concat(["--root", inputs.root]);
  }
  if (inputs.gcovExecutable !== null) {
    args = args.concat("--gcov-executable", inputs.gcovExecutable);
  }
  if (inputs.exclude !== null) {
    args = args.concat("--exclude", inputs.exclude);
  }
  return args;
}

export async function runGcovr() {
  const args = parseArgs();
  core.startGroup("Generate code coverage report using gcovr");
  await exec.exec("gcovr", args);
  core.endGroup();
}
