import * as core from "@actions/core";
import * as action from "./action";
import * as coveralls from "./coveralls";
import * as deps from "./deps";
import * as gcovr from "./gcovr";

async function run(): Promise<void> {
  try {
    const inputs = action.parseInputs();
    await deps.check(inputs);
    await gcovr.run(inputs);
    if (inputs.coverallsSend && inputs.coverallsOut !== null) {
      await coveralls.send(inputs.coverallsOut);
    }
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
