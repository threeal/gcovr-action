import { afterAll, beforeAll, describe, test } from "@jest/globals";
import * as fs from "fs";
import * as os from "os";
import { errorAppend, expect } from "../../testing";
import { PackageCacheInfo, PackageContentCacheInfo } from "./cache";
import { showPackageInfo } from "./info";
import { installPackage, uninstallPackage } from "./install";

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
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
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

      test("key should be different from cache info's", () => {
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

    afterAll(async () => {
      await uninstallPackage(cacheInfo.name);
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

describe("test save cache of a pip package content info", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      packageCacheInfoRemoveRoot();
    });

    describe("check the cache", () => {
      test("content info file should not be exist", () => {
        expect(cacheInfo.path).not.toBeExist();
      });
    });

    describe("save the cache", () => {
      test("should be resolved", async () => {
        const prom = cacheInfo.saveContentInfo();
        await expect(prom).resolves.toBeInstanceOf(PackageContentCacheInfo);
      });
    });

    describe("check again the cache", () => {
      test("content info file should be exist", () => {
        expect(cacheInfo.path).toBeExist();
      });
    });

    afterAll(async () => {
      await uninstallPackage(cacheInfo.name);
      packageCacheInfoRemoveRoot();
    });
  });

  describe("using an invalid package", () => {
    const cacheInfo = new PackageCacheInfo("some-invalid-package");
    test("should be rejected", async () => {
      const prom = cacheInfo.saveContentInfo();
      await expect(prom).rejects.toThrow();
    });
  });
});

describe("test restore cache of a pip package content info", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    let source: PackageContentCacheInfo;
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      source = await cacheInfo.saveContentInfo();
      await uninstallPackage(cacheInfo.name);
      packageCacheInfoRemoveRoot();
    });

    describe("check the cache", () => {
      test("content info file should not be exist", () => {
        expect(cacheInfo.path).not.toBeExist();
      });
    });

    let res: PackageContentCacheInfo;
    describe("restore the cache", () => {
      test("should be resolved", async () => {
        const prom = cacheInfo.restoreContentInfo();
        await expect(prom).resolves.toBeInstanceOf(PackageContentCacheInfo);
        res = (await prom) as PackageContentCacheInfo;
      });
    });

    describe("check again the cache", () => {
      test("content info file should be exist", () => {
        expect(cacheInfo.path).toBeExist();
      });
    });

    describe("compare the results", () => {
      test("name should be equal", () => {
        expect(res.name).toBe(source.name);
      });
      test("key should be equal", () => {
        expect(res.key).toBe(source.key);
      });
      test("paths should be equal", () => {
        expect(res.paths.length).toBe(source.paths.length);
        const length = Math.min(res.paths.length, source.paths.length);
        for (let i = 0; i < length; ++i) {
          expect(res.paths[i]).toBe(source.paths[i]);
        }
      });
    });

    afterAll(() => {
      packageCacheInfoRemoveRoot();
    });
  });

  describe("using an invalid package", () => {
    const cacheInfo = new PackageCacheInfo("some-invalid-package");
    test("should be resolved with undefined", async () => {
      const prom = cacheInfo.restoreContentInfo();
      await expect(prom).resolves.toBeUndefined();
    });
  });
});

describe("test save cache of a pip package content", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    let contentInfo: PackageContentCacheInfo;
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      contentInfo = await cacheInfo.saveContentInfo();
    });

    describe("check the package", () => {
      test("files should be exist", () => {
        try {
          for (const path of contentInfo.paths) {
            expect(path).toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { paths: contentInfo.paths });
        }
      });
    });

    describe("save the cache", () => {
      test("should be resolved", async () => {
        const prom = contentInfo.save();
        await expect(prom).resolves.toBeUndefined();
      });
    });

    describe("check the cache", () => {
      test("should be saved", async () => {
        const prom = contentInfo.restore();
        await expect(prom).resolves.not.toBeUndefined();
      });
    });

    afterAll(async () => {
      await uninstallPackage(cacheInfo.name);
    });
  });
});

describe("test restore cache of a pip package content", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    let contentInfo: PackageContentCacheInfo;
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      contentInfo = await cacheInfo.accumulateContentInfo();
      await contentInfo.save();
      await uninstallPackage(cacheInfo.name);
      // TODO: automatically uninstall dependencies
      await uninstallPackage("pyasn1");
    });

    describe("check the package", () => {
      test("should not be installed", async () => {
        const prom = showPackageInfo(cacheInfo.name);
        await expect(prom).resolves.toBeNull();
      });
      test("files should not be exist", () => {
        try {
          for (const path of contentInfo.paths) {
            expect(path).not.toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { paths: contentInfo.paths });
        }
      });
    });

    describe("restore the cache", () => {
      test("should be resolved", async () => {
        const prom = contentInfo.restore();
        await expect(prom).resolves.not.toBeUndefined();
      });
    });

    describe("check again the package", () => {
      test("should be installed", async () => {
        const prom = showPackageInfo(cacheInfo.name);
        await expect(prom).resolves.not.toBeNull();
      });
      test("files should be exist", () => {
        try {
          for (const path of contentInfo.paths) {
            expect(path).toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { paths: contentInfo.paths });
        }
      });
    });

    afterAll(async () => {
      await uninstallPackage(cacheInfo.name);
    });
  });
});
