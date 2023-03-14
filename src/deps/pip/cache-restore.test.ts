import { afterAll, beforeAll, describe, test } from "@jest/globals";
import { errorAppend, expect } from "../../testing";
import { packageCacheInfoRemoveRoot, validPkgName } from "./cache.test";
import { PackageCacheInfo, PackageContentCacheInfo } from "./cache";
import { installPackage, uninstallPackage } from "./install";
import { PackageInfo, showPackageInfo } from "./info";

describe("test restore cache of a pip package content info", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    let source: PackageContentCacheInfo;
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      source = await cacheInfo.accumulateContentInfo();
      await cacheInfo.saveContentInfo(source);
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
        await expect(prom).resolves.toBeUndefined();
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
        await expect(prom).resolves.toBeInstanceOf(PackageInfo);
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
