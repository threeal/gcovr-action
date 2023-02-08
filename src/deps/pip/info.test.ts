import { beforeAll, describe, test } from "@jest/globals";
import { errorAppend, expect } from "../../testing";
import { PackageInfo, showPackageInfo } from "./info";
import { installPackage } from "./install";

describe("test show info of a pip package", () => {
  describe("show info of a valid package (rsa)", () => {
    beforeAll(async () => {
      await installPackage("rsa");
    });

    let pkgInfo: PackageInfo;
    test("should be valid", async () => {
      const res = showPackageInfo("rsa");
      await expect(res).resolves.toBeInstanceOf(PackageInfo);
      pkgInfo = (await res) as PackageInfo;
    });

    describe("check contents of the package info", () => {
      test("name should be valid", () => {
        expect(pkgInfo.name).toBe("rsa");
      });
      test("version should be valid", () => {
        expect(pkgInfo.version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
      });
      test("location should be exist", () => {
        expect(pkgInfo.location).toBeExist();
      });

      test("dependencies should be valid", () => {
        const deps = pkgInfo.dependencies;
        try {
          expect(deps.length).toBe(1);
        } catch (err) {
          throw errorAppend(err, { deps: deps });
        }
      });

      test("files should be valid", () => {
        const files = pkgInfo.files;
        try {
          expect(files).not.toBeEmpty();
        } catch (err) {
          throw errorAppend(err, { files: files });
        }
      });

      test("directories should be exist", () => {
        const dirs = pkgInfo.directories();
        try {
          expect(dirs.length).toBe(2);
          for (const dir of dirs) {
            expect(dir).toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { dirs: dirs });
        }
      });

      test("executables should be exist", async () => {
        const execs = await pkgInfo.executables();
        try {
          expect(execs.length).toBe(6);
          for (const exec of execs) {
            expect(exec).toBeExist();
          }
        } catch (err) {
          throw errorAppend(err, { execs: execs });
        }
      });
    });
  });

  describe("show info of an invalid package", () => {
    test("should be null", async () => {
      const pkgInfo = showPackageInfo("an-invalid-package");
      await expect(pkgInfo).resolves.toBeNull();
    });
  });
});
