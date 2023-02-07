import { beforeAll, describe, test } from "@jest/globals";
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
        expect(paths.length).toBe(8 + 2); // 2 from dependencies of rsa
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
