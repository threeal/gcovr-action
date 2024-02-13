import * as log from "@actions-kit/log";
import * as action from "./action.js";
import * as coveralls from "./coveralls.js";
import * as deps from "./deps/index.js";
import * as gcovr from "./gcovr.js";

async function run(): Promise<void> {
  try {
    const inputs = action.processInputs();
    await deps.check(inputs);
    await gcovr.run(inputs);
    if (inputs.coverallsSend && inputs.coverallsOut !== undefined) {
      await coveralls.send(inputs.coverallsOut);
    }
  } catch (err) {
    log.fatal(`${err instanceof Error ? err.message : err}`);
  }
}

run();
