import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as action from "./action";
import * as coveralls from "./coveralls";
import log from "./log";

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
      core.exportVariable("COVERALLS_REPO_TOKEN", inputs.githubToken);
    }
    await exec.exec("python3", ["-m", "gcovr", ...args]);
    if (inputs.coverallsOut !== null) {
      log.info("Patching Coveralls API report...");
      coveralls.patch(inputs.coverallsOut);
      log.info(
        `Coveralls API report outputted to ${log.emph(inputs.coverallsOut)}`
      );
    }
  });
}
