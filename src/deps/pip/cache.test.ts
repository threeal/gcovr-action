import { beforeAll, describe, test } from "@jest/globals";
import * as os from "os";
import { errorAppend, expect } from "../../testing";
import {
  getPackageCacheInfo,
  getPackageContentCacheInfo,
  PackageCacheInfo,
} from "./cache";
import { installPackage } from "./install";

const validPkgName = "rsa";

function expectValidCacheInfoName(name: string, packageName: string) {
  expect(name).not.toBeEmpty();
  expect(name.toLowerCase()).toBe(packageName.toLowerCase());
}

function expectValidCacheInfoKey(key: string, packageName: string) {
  expect(key).not.toBeEmpty();
  expect(key).toIncludes(os.type());
  expect(key).toIncludes(packageName);
}

describe("test get cache info of a pip package", () => {
  describe(`get cache info of a valid package (${validPkgName})`, () => {
    let cacheInfo: PackageCacheInfo;
    test("should not error", async () => {
      const call = () => (cacheInfo = getPackageCacheInfo(validPkgName));
      expect(call).not.toThrow();
      expect(cacheInfo).toBeInstanceOf(PackageCacheInfo);
    });

    describe("check contents of the cache info", () => {
      test("name should be valid", () => {
        expectValidCacheInfoName(cacheInfo.name, validPkgName);
      });

      test("key should be valid", () => {
        expectValidCacheInfoKey(cacheInfo.key, validPkgName);
      });

      test("paths should be valid", () => {
        try {
          expect(cacheInfo.paths.length).toBe(1);
          for (const path of cacheInfo.paths) {
            expect(path).toIncludes(os.homedir());
            expect(path).toIncludes(validPkgName);
          }
        } catch (err) {
          throw errorAppend(err, { paths: cacheInfo.paths });
        }
      });
    });
  });
});

describe("test get cache info of a pip package content", () => {
  describe(`get cache info of a valid package content (${validPkgName})`, () => {
    beforeAll(async () => {
      await installPackage(validPkgName);
    });

    let cacheInfo: PackageCacheInfo;
    test("should be valid", async () => {
      const res = getPackageContentCacheInfo(validPkgName);
      await expect(res).resolves.toBeInstanceOf(PackageCacheInfo);
      cacheInfo = await res;
    });

    describe("check contents of the cache info", () => {
      test("name should be valid", () => {
        expectValidCacheInfoName(cacheInfo.name, validPkgName);
      });

      test("key should be valid", () => {
        expectValidCacheInfoKey(cacheInfo.key, validPkgName);
      });

      test("key should be different from package cache info", () => {
        const packageCacheInfo = getPackageCacheInfo(validPkgName);
        expect(cacheInfo.key).not.toBe(packageCacheInfo.key);
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

  describe("get cache info of an invalid package content", () => {
    test("should be rejected", async () => {
      const res = getPackageContentCacheInfo("an-invalid-package");
      await expect(res).rejects.toThrow();
    });
  });
});
