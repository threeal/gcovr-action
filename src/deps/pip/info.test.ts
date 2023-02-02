import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import { PackageInfo, showPackageInfo } from "./info";

function expectPathExist(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error(`Expect ${path} to be exist`);
  }
}

describe("test show info of a pip package", () => {
  describe("show info of a valid package (pip)", () => {
    const pkgInfo = showPackageInfo("pip");
    test("should not return null", async () => {
      expect(await pkgInfo).not.toBeNull();
    });

    describe("check contents of a package info (pip info)", () => {
      const info = pkgInfo as Promise<PackageInfo>;

      test("name should be valid", async () => {
        expect((await info).name).toBe("pip");
      });
      test("version should be valid", async () => {
        expect((await info).version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
      });
      test("location should be exist", async () => {
        expectPathExist((await info).location);
      });
      test("dependencies should be valid", async () => {
        expect((await info).dependencies.length).toBe(0);
      });
      test("files should be valid", async () => {
        expect((await info).files.length).toBeGreaterThan(0);
      });

      test("directories should be exist", async () => {
        const dirs = (await info).directories();
        expect(dirs.length).toBeGreaterThan(0);
        for (const dir of dirs) {
          expectPathExist(dir);
        }
      });

      test("executables should be exist", async () => {
        const execs = await (await info).executables();
        expect(execs.length).toBeGreaterThan(0);
        for (const exec of execs) {
          expectPathExist(exec);
        }
      });
    });
  });

  describe("show info of an invalid package", () => {
    const pkgInfo = showPackageInfo("an-invalid-package");
    test("should return null", async () => {
      expect(await pkgInfo).toBeNull();
    });
  });
});
