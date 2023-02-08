import { beforeAll, describe, test } from "@jest/globals";
import * as os from "os";
import { errorAppend, expect } from "../../testing";
import { getPackageCacheInfo, PackageCacheInfo } from "./cache";
import { installPackage } from "./install";

const validPkgName = "rsa";

describe("test get cache info of a pip package", () => {
  describe(`get cache info of a valid package (${validPkgName})`, () => {
    beforeAll(async () => {
      await installPackage(validPkgName);
    });

    let cacheInfo: PackageCacheInfo;
    test("should be valid", async () => {
      const res = getPackageCacheInfo(validPkgName);
      await expect(res).resolves.toBeInstanceOf(PackageCacheInfo);
      cacheInfo = await res;
    });

    describe("check contents of the cache info", () => {
      test("key should be valid", () => {
        expect(cacheInfo.key).not.toBeEmpty();
        expect(cacheInfo.key).toBeIncludes(os.type());
        expect(cacheInfo.key).toBeIncludes(validPkgName);
      });

      test("paths should be exist", () => {
        try {
          // 2 from dependencies of rsa, except on Linux
          const expected = 8 + (os.type() !== "Linux" ? 2 : 0);
          expect(cacheInfo.paths.length).toBe(expected);
          for (const path of cacheInfo.paths) {
            expect(path).toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { paths: cacheInfo.paths });
        }
      });
    });
  });

  describe("get cache info of an invalid package", () => {
    test("should be rejected", async () => {
      const res = getPackageCacheInfo("an-invalid-package");
      await expect(res).rejects.toThrow();
    });
  });
});
