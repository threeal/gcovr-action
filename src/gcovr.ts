import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { Inputs } from "./inputs";

function getArgs(inputs: Inputs): string[] {
  let args: string[] = [];
  if (inputs.root !== null) {
    args = args.concat(["--root", inputs.root]);
  }
  if (inputs.gcovExecutable !== null) {
    args = args.concat("--gcov-executable", inputs.gcovExecutable);
  }
  if (inputs.exclude !== null) {
    args = args.concat("--exclude", inputs.exclude);
  }
  if (inputs.failUnderLine !== null) {
    args = args.concat("--fail-under-line", inputs.failUnderLine.toString());
  }
  return args;
}

export async function run(inputs: Inputs) {
  const args = getArgs(inputs);
  core.startGroup("Generate code coverage report using gcovr");
  await exec.exec("gcovr", args);
  core.endGroup();
}
