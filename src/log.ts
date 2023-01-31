import * as core from "@actions/core";
import * as chrono from "./chrono";

export function warning(message: string) {
  core.info(`WARNING: ${message}`);
}

export function error(message: string) {
  core.info(`Error: ${message}`);
}

export async function group<Type>(
  name: string,
  fn: () => Promise<Type>
): Promise<Type> {
  return core.group(name, async () => {
    const time = chrono.now();
    try {
      const res = await fn();
      core.info(`Done in ${time.elapsed()}`);
      return res;
    } catch (err) {
      error(`Failed in ${time.elapsed()}`);
      throw err;
    }
  });
}
