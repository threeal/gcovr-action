import { beforeAll, describe, test } from "@jest/globals";
import * as os from "os";
import { errorAppend, expect } from "../../testing";
import { getPackageCachePaths } from "./cache";
import { installPackage } from "./install";

describe("test get cache paths of a pip package", () => {
  describe("get cache paths of a valid package (rsa)", () => {
    beforeAll(async () => {
      await installPackage("rsa");
    });

    test("should be resolved and exist", async () => {
      const res = getPackageCachePaths("rsa");
      await expect(res).resolves.toBeInstanceOf(Array);
      const paths = await res;
      try {
        // 2 from dependencies of rsa, except on Linux
        const expected = 8 + (os.type() !== "Linux" ? 2 : 0);
        expect(paths.length).toBe(expected);
        for (const path of paths) {
          expect(path).toBeExist();
        }
      } catch (err) {
        throw errorAppend(err, { paths: paths });
      }
    });
  });

  describe("get cache paths of an invalid package", () => {
    test("should be rejected", async () => {
      const res = getPackageCachePaths("an-invalid-package");
      await expect(res).rejects.toThrow();
    });
  });
});
