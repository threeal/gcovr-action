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
  toBeEmpty(received: string | Array<unknown>): Result {
    return received.length > 0
      ? notPass(`expected not to be empty`)
      : pass(`expected to be empty, got length ${received.length}`);
  },
  toBeExist(received: string): Result {
    return fs.existsSync(received)
      ? pass(`expected path '${received}' to be exist`)
      : notPass(`expected path ${received} not to be exist`);
  },
});

export default expect;
