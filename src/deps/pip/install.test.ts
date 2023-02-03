import { describe, expect, test } from "@jest/globals";
import { PackageInfo, showPackageInfo } from "./info";
import { installPackage } from "./install";

describe("test install a pip package", () => {
  describe("test install a valid package (requests)", () => {
    describe("install the package", () => {
      const res = installPackage("requests");
      test("should be resolved", async () => {
        await expect(res).resolves.toBeUndefined();
      });
    });

    describe("show the package info", () => {
      const pkgInfo = showPackageInfo("pip");
      test("should be valid", async () => {
        await expect(pkgInfo).resolves.toBeInstanceOf(PackageInfo);
      });
    });
  });

  describe("test install an invalid package", () => {
    describe("install the package", () => {
      const res = installPackage("an-invalid-package");
      test("should be rejected", async () => {
        await expect(res).rejects.toThrow();
      });
    });
  });
});
