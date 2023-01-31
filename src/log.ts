import * as core from "@actions/core";
import styles from "ansi-styles";
import * as chrono from "./chrono";

export function emph(message: string): string {
  return `${styles.blue.open}${message}${styles.blue.close}`;
}

export const info = core.info;

export function warning(message: string) {
  const label = `${styles.yellow.open}Warning:${styles.yellow.close}`;
  core.info(`${label} ${message}`);
}

export function error(message: string) {
  const label = `${styles.red.open}Error:${styles.red.close}`;
  core.info(`${label} ${message}`);
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

export default { emph, info, warning, error, group };
