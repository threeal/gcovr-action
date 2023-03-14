import { afterAll, beforeAll, describe, test } from "@jest/globals";
import { errorAppend, expect } from "../../testing";
import { packageCacheInfoRemoveRoot, validPkgName } from "./cache.test";
import { PackageCacheInfo, PackageContentCacheInfo } from "./cache";
import { installPackage, uninstallPackage } from "./install";

describe("test save cache of a pip package content info", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    let contentInfo: PackageContentCacheInfo;
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      contentInfo = await cacheInfo.accumulateContentInfo();
      packageCacheInfoRemoveRoot();
    });

    describe("check the cache", () => {
      test("content info file should not be exist", () => {
        expect(cacheInfo.path).not.toBeExist();
      });
    });

    describe("save the cache", () => {
      test("should be resolved", async () => {
        const prom = cacheInfo.saveContentInfo(contentInfo);
        await expect(prom).resolves.toBeUndefined();
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
});

describe("test save cache of a pip package content", () => {
  describe(`using a valid package (${validPkgName})`, () => {
    const cacheInfo = new PackageCacheInfo(validPkgName);
    let contentInfo: PackageContentCacheInfo;
    beforeAll(async () => {
      await installPackage(cacheInfo.name);
      contentInfo = await cacheInfo.accumulateContentInfo();
      await cacheInfo.saveContentInfo(contentInfo);
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
