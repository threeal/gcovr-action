import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as action from "./action";
import * as gcovr from "./gcovr";

async function run(): Promise<void> {
  try {
    const inputs = action.parseInputs();
    core.startGroup("Install gcovr");
    await exec.exec("pip3 install gcovr");
    core.endGroup();
    await gcovr.run(inputs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
