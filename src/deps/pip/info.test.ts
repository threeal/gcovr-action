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
        const deps = (await info).dependencies;
        try {
          expect(deps.length).toBe(0);
        } catch (err) {
          if (err instanceof Error) {
            const str = JSON.stringify(deps, null, 2);
            err.message = `${err.message}\ndeps: ${str}`;
          }
          throw err;
        }
      });

      test("files should be valid", async () => {
        const files = (await info).files;
        try {
          expect(files.length).toBeGreaterThan(0);
        } catch (err) {
          if (err instanceof Error) {
            const str = JSON.stringify(files, null, 2);
            err.message = `${err.message}\nfiles: ${str}`;
          }
          throw err;
        }
      });

      test("directories should be exist", async () => {
        const dirs = (await info).directories();
        try {
          expect(dirs.length).toBe(2);
          for (const dir of dirs) {
            expectPathExist(dir);
          }
        } catch (err) {
          if (err instanceof Error) {
            const str = JSON.stringify(dirs, null, 2);
            err.message = `${err.message}\ndirs: ${str}`;
          }
          throw err;
        }
      });

      test("executables should be exist", async () => {
        const execs = await (await info).executables();
        try {
          expect(execs.length).toBe(3);
          for (const exec of execs) {
            expectPathExist(exec);
          }
        } catch (err) {
          if (err instanceof Error) {
            const str = JSON.stringify(execs, null, 2);
            err.message = `${err.message}\nexecs: ${str}`;
          }
          throw err;
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
