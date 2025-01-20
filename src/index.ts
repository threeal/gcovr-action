import { logError } from "gha-utils";
import * as action from "./action.js";
import * as coveralls from "./coveralls.js";
import * as deps from "./deps/index.js";
import * as gcovr from "./gcovr.js";

try {
  const inputs = action.processInputs();
  await deps.check();
  await gcovr.run(inputs);
  if (inputs.coverallsSend && inputs.coverallsOut.length > 0) {
    await coveralls.send(inputs.coverallsOut);
  }
} catch (err) {
  logError(err);
  process.exit(1);
}
