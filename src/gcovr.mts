import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as action from "./action.mjs";
import * as coveralls from "./coveralls.mjs";

function getArgs(inputs: action.Inputs): string[] {
  let args: string[] = [];
  if (inputs.root.length > 0) {
    args = args.concat(["--root", inputs.root]);
  }
  if (inputs.gcovExecutable.length > 0) {
    args = args.concat("--gcov-executable", inputs.gcovExecutable);
  }
  for (const exclude of inputs.excludes) {
    args = args.concat("--exclude", exclude);
  }
  if (inputs.failUnderLine.length > 0) {
    args = args.concat("--fail-under-line", inputs.failUnderLine);
  }
  if (inputs.xmlOut.length > 0) {
    args = args.concat("--xml", inputs.xmlOut);
  }
  if (inputs.coverallsOut.length > 0) {
    args = args.concat("--coveralls", inputs.coverallsOut);
  }
  return args;
}

export async function run(inputs: action.Inputs) {
  const args = getArgs(inputs);
  await core.group("Generating code coverage report...", async () => {
    if (inputs.githubToken.length > 0) {
      core.exportVariable("COVERALLS_REPO_TOKEN", inputs.githubToken);
    }
    const status = await exec.exec("gcovr", args, { ignoreReturnCode: true });
    if (status !== 0) {
      let errMessage: string;
      if ((status | 2) > 0) {
        errMessage = `coverage is under ${inputs.failUnderLine}%`;
      } else {
        errMessage = `unknown error (error code ${status})`;
      }
      throw new Error(`Failed to generate code coverage report: ${errMessage}`);
    }
    if (inputs.coverallsOut.length > 0) {
      core.info("Patching Coveralls API report...");
      try {
        coveralls.patch(inputs.coverallsOut);
      } catch (err) {
        const errMessage = `${err instanceof Error ? err.message : err}`;
        throw new Error(`Failed to patch Coveralls API report: ${errMessage}`);
      }
      core.info(
        `Coveralls API report outputted to \u001b[34m${inputs.coverallsOut}\u001b[39m`,
      );
    }
  });
}
