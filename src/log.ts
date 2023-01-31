import * as core from "@actions/core";
import * as chrono from "./chrono";

export function warning(message: string) {
  core.info(`WARNING: ${message}`);
}

export async function group<Type>(
  name: string,
  fn: () => Promise<Type>
): Promise<Type> {
  const res = await core.group(name, async () => {
    const time = chrono.now();
    const res = await fn();
    core.info(`Done in ${time.elapsed()}`);
    return res;
  });
  return res;
}
