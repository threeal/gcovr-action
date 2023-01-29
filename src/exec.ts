import * as actionsExec from "@actions/exec";

export async function exec(
  commandLine: string,
  args?: string[] | undefined
): Promise<void> {
  await actionsExec.exec(commandLine, args);
}

export async function execOut(
  commandLine: string,
  args?: string[] | undefined
): Promise<string> {
  let out: string = "";
  await actionsExec.exec(commandLine, args, {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        out += data.toString();
      },
    },
  });
  return out;
}

export async function execCheck(
  commandLine: string,
  args?: string[] | undefined
): Promise<boolean> {
  const rc = await actionsExec.exec(commandLine, args, {
    silent: true,
    ignoreReturnCode: true,
  });
  return rc === 0;
}
