import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { parseInputs } from "./inputs";

async function run(): Promise<void> {
  try {
    core.startGroup("Install gcovr");
    await exec.exec("pip3 install gcovr");
    core.endGroup();

    let args: string[] = [];
    const inputs = parseInputs();
    if (inputs.root) {
      args = args.concat(["--root", inputs.root]);
    }

    core.startGroup("Generate code coverage report using gcovr");
    await exec.exec("gcovr", args);
    core.endGroup();
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
