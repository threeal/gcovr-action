import * as core from "@actions/core";
import * as chrono from "./chrono";

export async function group(
  name: string,
  fn: () => Promise<unknown>
): Promise<unknown> {
  const res = await core.group(name, async () => {
    const time = chrono.now();
    const res = await fn();
    core.info(`Done in ${time.elapsed()}`);
    return res;
  });
  return res;
}
