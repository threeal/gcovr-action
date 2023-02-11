import { afterAll, beforeAll, describe, test } from "@jest/globals";
import * as fs from "fs";
import * as os from "os";
import { errorAppend, expect } from "../../testing";
import { PackageCacheInfo, PackageContentCacheInfo } from "./cache";
import { installPackage } from "./install";

const validPackageName = "rsa";

function expectValidCacheInfoName(name: string, packageName: string) {
  expect(name).not.toBeEmpty();
  expect(name.toLowerCase()).toBe(packageName.toLowerCase());
}

function expectValidCacheInfoKey(key: string, packageName: string) {
  expect(key).not.toBeEmpty();
  expect(key).toIncludes(os.type());
  expect(key).toIncludes(packageName);
}

function packageCacheInfoRemoveRoot() {
  fs.rmSync(PackageCacheInfo.root(), { recursive: true, force: true });
}

describe("test create cache info of a pip package", () => {
  describe(`using any package name`, () => {
    const packageName = "any-package-name";
    let res: PackageCacheInfo;
    test("should not error", () => {
      expect(() => {
        res = new PackageCacheInfo(packageName);
      }).not.toThrow();
      expect(res).toBeInstanceOf(PackageCacheInfo);
    });

    describe("check the result", () => {
      test("name should be valid", () => {
        expectValidCacheInfoName(res.name, packageName);
      });

      test("key should be valid", () => {
        expectValidCacheInfoKey(res.key, packageName);
      });

      test("path should be valid", () => {
        expect(res.path).not.toBeEmpty();
        expect(res.path).toIncludes(PackageCacheInfo.root());
        expect(res.path).toIncludes(packageName);
      });
    });
  });
});

describe("test accumulate content info of a pip package cache info", () => {
  describe(`using a valid package (${validPackageName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPackageName);
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
    });

    let res: PackageContentCacheInfo;
    test("should be resolved", async () => {
      const prom = cacheInfo.accumulateContentInfo();
      await expect(prom).resolves.toBeInstanceOf(PackageContentCacheInfo);
      res = await prom;
    });

    describe("check the result", () => {
      test("name should be valid", () => {
        expectValidCacheInfoName(res.name, cacheInfo.name);
      });

      test("key should be valid", () => {
        expectValidCacheInfoKey(res.key, cacheInfo.name);
      });

      test("key should be different from cache info's", async () => {
        expect(res.key).not.toBe(cacheInfo.key);
      });

      test("paths should be exist", () => {
        try {
          // 2 from dependencies of rsa, except on Linux
          const expected = 8 + (os.type() !== "Linux" ? 2 : 0);
          expect(res.paths.length).toBe(expected);
          for (const path of res.paths) {
            expect(path).toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { paths: res.paths });
        }
      });
    });
  });

  describe("using an invalid package", () => {
    const cacheInfo = new PackageCacheInfo("some-invalid-package");
    test("should be rejected", async () => {
      const res = cacheInfo.accumulateContentInfo();
      await expect(res).rejects.toThrow();
    });
  });
});

describe("test save and restore cache of a pip package content info", () => {
  describe(`using a valid package (${validPackageName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPackageName);
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      packageCacheInfoRemoveRoot();
    });

    describe("check the cache", () => {
      test("content info file should not be exist", async () => {
        expect(cacheInfo.path).not.toBeExist();
      });
    });

    let contentInfo: PackageContentCacheInfo;
    describe("save the cache", () => {
      test("should be resolved", async () => {
        const prom = cacheInfo.saveContentInfo();
        await expect(prom).resolves.toBeInstanceOf(PackageContentCacheInfo);
        contentInfo = await prom;
      });
    });

    describe("check again the cache", () => {
      test("content info file should be exist", async () => {
        expect(cacheInfo.path).toBeExist();
      });
    });

    afterAll(() => {
      packageCacheInfoRemoveRoot();
    });
  });
});
