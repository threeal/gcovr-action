import { afterAll, beforeAll, describe, test } from "@jest/globals";
import * as fs from "fs";
import * as os from "os";
import { errorAppend, expect } from "../../testing";
import {
  PackageCacheInfo,
  PackageCacheInfoCacheInfo,
  savePackageCacheInfoCache,
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

function removePackageCacheInfoCacheRoot() {
  fs.rmSync(PackageCacheInfoCacheInfo.root(), { recursive: true, force: true });
}

describe("test get cache info of a pip package cache info", () => {
  describe(`get cache info of a valid package cache info (${validPkgName})`, () => {
    let cacheInfo: PackageCacheInfoCacheInfo;
    test("should not error", async () => {
      expect(() => {
        cacheInfo = new PackageCacheInfoCacheInfo(validPkgName);
      }).not.toThrow();
      expect(cacheInfo).toBeInstanceOf(PackageCacheInfoCacheInfo);
    });

    describe("check contents of the cache info", () => {
      beforeAll(async () => {
        await installPackage(validPkgName);
      });

      test("name should be valid", () => {
        expectValidCacheInfoName(cacheInfo.name, validPkgName);
      });

      test("key should be valid", () => {
        expectValidCacheInfoKey(cacheInfo.key, validPkgName);
      });

      test("key should be different from package cache info's", async () => {
        const packageCacheInfo = await cacheInfo.accumulateContent();
        expect(cacheInfo.key).not.toBe(packageCacheInfo.key);
      });

      test("paths should be valid", () => {
        expect(cacheInfo.path).not.toBeEmpty();
        expect(cacheInfo.path).toIncludes(os.homedir());
        expect(cacheInfo.path).toIncludes(validPkgName);
      });
    });
  });
});

describe("test get cache info of a pip package", () => {
  describe(`get cache info of a valid package (${validPkgName})`, () => {
    beforeAll(async () => {
      await installPackage(validPkgName);
    });

    let cacheInfo: PackageCacheInfo;
    test("should be valid", async () => {
      const res = PackageCacheInfo.accumulate(validPkgName);
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
      const res = PackageCacheInfo.accumulate("an-invalid-package");
      await expect(res).rejects.toThrow();
    });
  });
});

describe("test save and restore cache of a pip package cache info", () => {
  describe(`using valid package (${validPkgName})`, () => {
    beforeAll(async () => {
      await installPackage(validPkgName);
      removePackageCacheInfoCacheRoot();
    });

    let cacheInfo: PackageCacheInfoCacheInfo;
    describe("get the cache info", () => {
      test("should not error", () => {
        expect(() => {
          cacheInfo = new PackageCacheInfoCacheInfo(validPkgName);
        }).not.toThrow();
      });
    });

    describe("check the cache", () => {
      test("cache info file should not be exist", async () => {
        expect(cacheInfo.path).not.toBeExist();
      });
    });

    describe("save the cache", () => {
      test("should be resolved", async () => {
        const res = savePackageCacheInfoCache(cacheInfo);
        await expect(res).resolves.toBeUndefined();
      });
    });

    describe("check again the cache", () => {
      test("cache info file should be exist", async () => {
        expect(cacheInfo.path).toBeExist();
      });
    });

    afterAll(() => {
      removePackageCacheInfoCacheRoot();
    });
  });
});