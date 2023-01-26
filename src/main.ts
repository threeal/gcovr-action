import * as core from "@actions/core";
import * as exec from "@actions/exec";

async function run(): Promise<void> {
  try {
    core.startGroup("Install gcovr");
    await exec.exec("pip3 install gcovr");
    core.endGroup();

    let args: string[] = [];
    const root: string = core.getInput("root");
    if (root) {
      args = args.concat(["--root", root]);
    }

    core.startGroup("Generate code coverage report using gcovr");
    await exec.exec("gcovr", args);
    core.endGroup();
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
