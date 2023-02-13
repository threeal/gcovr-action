export function errorAppend(
  err: unknown,
  info: { [key: string]: any }
): unknown {
  if (err instanceof Error) {
    for (const [key, value] of Object.entries(info)) {
      const str = JSON.stringify(value, undefined, 2);
      err.message = `${err.message}\n${key}: ${str}`;
    }
  }
  return err;
}
