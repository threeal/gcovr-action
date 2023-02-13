import { expect as jestExpect } from "@jest/globals";
import * as fs from "fs";

const expect = Object.assign(jestExpect);

interface Result {
  message: () => string;
  pass: boolean;
}

function pass(message: string): Result {
  return {
    message: () => message,
    pass: true,
  };
}

function notPass(message: string): Result {
  return {
    message: () => message,
    pass: false,
  };
}

expect.extend({
  toIncludes(received: string, substring: string): Result {
    return received.includes(substring)
      ? pass(`expected '${received}' not to includes '${substring}'`)
      : notPass(`expected '${received}' to includes '${substring}'`);
  },
  toBeEmpty(received: string | Array<unknown>): Result {
    return received.length > 0
      ? notPass(`expected to be empty, got length ${received.length}`)
      : pass(`expected not to be empty`);
  },
  toBeExist(received: string): Result {
    return fs.existsSync(received)
      ? pass(`expected path '${received}' not to be exist`)
      : notPass(`expected path '${received}' to be exist`);
  },
});

export default expect;
