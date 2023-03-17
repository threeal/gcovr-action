import * as exec from "@actions-kit/exec";
import * as log from "@actions-kit/log";
import * as core from "@actions/core";
import * as action from "./action";
import * as coveralls from "./coveralls";

function getArgs(inputs: action.Inputs): string[] {
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
  if (inputs.coverallsOut !== null) {
    args = args.concat("--coveralls", inputs.coverallsOut);
  }
  return args;
}

export async function run(inputs: action.Inputs) {
  const args = getArgs(inputs);
  await log.group("Generating code coverage report...", async () => {
    if (inputs.githubToken !== null) {
      const label = log.emph("COVERALLS_REPO_TOKEN");
      log.info(`Setting ${label} to ${log.emph(inputs.githubToken)}...`);
      try {
        core.exportVariable("COVERALLS_REPO_TOKEN", inputs.githubToken);
      } catch (err) {
        const errMessage = `${err instanceof Error ? err.message : err}`;
        throw new Error(
          `Failed to set ${label} to ${inputs.githubToken}: ${errMessage}`
        );
      }
    }
    const res = await exec.exec("python3", "-m", "gcovr", ...args);
    if (!res.isOk()) {
      let errMessage: string;
      if ((res.code | 2) > 0) {
        errMessage = `coverage is under ${inputs.failUnderLine}%`;
      } else {
        errMessage = `unknown error (error code ${res.code})`;
      }
      throw new Error(`Failed to generate code coverage report: ${errMessage}`);
    }
    if (inputs.coverallsOut !== null) {
      log.info("Patching Coveralls API report...");
      try {
        coveralls.patch(inputs.coverallsOut);
      } catch (err) {
        const errMessage = `${err instanceof Error ? err.message : err}`;
        throw new Error(`Failed to patch Coveralls API report: ${errMessage}`);
      }
      log.info(
        `Coveralls API report outputted to ${log.emph(inputs.coverallsOut)}`
      );
    }
  });
}
