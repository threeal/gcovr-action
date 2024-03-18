import * as core from "@actions/core";
import * as action from "./action.mjs";
import * as coveralls from "./coveralls.mjs";
import * as deps from "./deps/index.mjs";
import * as gcovr from "./gcovr.mjs";

async function run(): Promise<void> {
  try {
    const inputs = action.processInputs();
    await deps.check();
    await gcovr.run(inputs);
    if (inputs.coverallsSend && inputs.coverallsOut.length > 0) {
      await coveralls.send(inputs.coverallsOut);
    }
  } catch (err) {
    core.setFailed(`${err instanceof Error ? err.message : err}`);
  }
}

run();
