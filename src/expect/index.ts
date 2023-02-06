import { expect as jestExpect } from "@jest/globals";
import * as fs from "fs";

const expect = Object.assign(jestExpect);

expect.extend({
  pathToBeExist(received: string) {
    if (fs.existsSync(received)) {
      return {
        message: () => `expected path '${received}' to be exist`,
        pass: true,
      };
    }
    return {
      message: () => `expected path ${received} not to be exist`,
      pass: false,
    };
  },
});

export default expect;
