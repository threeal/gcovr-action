import * as envi from "@actions-kit/envi";
import * as log from "@actions-kit/log";
import * as os from "os";
import * as path from "path";

export interface Inputs {
  root: string | undefined;
  gcovExecutable: string | undefined;
  excludes: string[];
  failUnderLine: number | undefined;
  xmlOut: string | undefined;
  coverallsOut: string | undefined;
  coverallsSend: boolean | undefined;
  githubToken: string | undefined;
}

export function processInputs(): Inputs {
  log.info("Processing the action inputs...");
  try {
    const inputs: Inputs = {
      root: envi.getStringInput("root"),
      gcovExecutable: envi.getStringInput("gcov-executable"),
      excludes: envi.getMultilineInput("excludes"),
      failUnderLine: envi.getNumberInput("fail-under-line"),
      xmlOut: envi.getStringInput("xml-out"),
      coverallsOut: envi.getStringInput("coveralls-out"),
      coverallsSend: envi.getBooleanInput("coveralls-send"),
      githubToken: envi.getStringInput("github-token"),
    };
    // Auto set coveralls output if not specified
    if (inputs.coverallsSend && inputs.coverallsOut === undefined) {
      inputs.coverallsOut = path.join(os.tmpdir(), "coveralls.json");
      log.info(`Auto set Coveralls output to ${log.emph(inputs.coverallsOut)}`);
    }
    return inputs;
  } catch (err) {
    const errMessage = `${err instanceof Error ? err.message : err}`;
    throw new Error(`Failed to process the action inputs: ${errMessage}`);
  }
}
