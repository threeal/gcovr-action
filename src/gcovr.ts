import * as exec from "@actions-kit/exec";
import * as log from "@actions-kit/log";
import * as core from "@actions/core";
import * as action from "./action.js";
import * as coveralls from "./coveralls.js";

function getArgs(inputs: action.Inputs): string[] {
  let args: string[] = [];
  if (inputs.root !== undefined) {
    args = args.concat(["--root", inputs.root]);
  }
  if (inputs.gcovExecutable !== undefined) {
    args = args.concat("--gcov-executable", inputs.gcovExecutable);
  }
  for (const exclude of inputs.excludes) {
    args = args.concat("--exclude", exclude);
  }
  if (inputs.failUnderLine !== undefined) {
    args = args.concat("--fail-under-line", inputs.failUnderLine.toString());
  }
  if (inputs.xmlOut !== undefined) {
    args = args.concat("--xml", inputs.xmlOut);
  }
  if (inputs.coverallsOut !== undefined) {
    args = args.concat("--coveralls", inputs.coverallsOut);
  }
  return args;
}

export async function run(inputs: action.Inputs) {
  const args = getArgs(inputs);
  await log.group("Generating code coverage report...", async () => {
    if (inputs.githubToken !== undefined) {
      const label = log.emph("COVERALLS_REPO_TOKEN");
      log.info(`Setting ${label} to ${log.emph(inputs.githubToken)}...`);
      try {
        core.exportVariable("COVERALLS_REPO_TOKEN", inputs.githubToken);
      } catch (err) {
        const errMessage = `${err instanceof Error ? err.message : err}`;
        throw new Error(
          `Failed to set ${label} to ${inputs.githubToken}: ${errMessage}`,
        );
      }
    }
    const res = await exec.run("python3", "-m", "gcovr", ...args);
    if (!res.isOk()) {
      let errMessage: string;
      if ((res.code | 2) > 0) {
        errMessage = `coverage is under ${inputs.failUnderLine}%`;
      } else {
        errMessage = `unknown error (error code ${res.code})`;
      }
      throw new Error(`Failed to generate code coverage report: ${errMessage}`);
    }
    if (inputs.coverallsOut !== undefined) {
      log.info("Patching Coveralls API report...");
      try {
        coveralls.patch(inputs.coverallsOut);
      } catch (err) {
        const errMessage = `${err instanceof Error ? err.message : err}`;
        throw new Error(`Failed to patch Coveralls API report: ${errMessage}`);
      }
      log.info(
        `Coveralls API report outputted to ${log.emph(inputs.coverallsOut)}`,
      );
    }
  });
}
