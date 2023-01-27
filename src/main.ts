import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as gcovr from "./gcovr";
import { parseInputs } from "./inputs";

async function run(): Promise<void> {
  try {
    const inputs = parseInputs();
    core.startGroup("Install gcovr");
    await exec.exec("pip3 install gcovr");
    core.endGroup();
    await gcovr.run(inputs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
