import { beforeEach, describe, expect, test } from "@jest/globals";
import { PackageInfo, showPackageInfo } from "./info";
import { installPackage, uninstallPackage } from "./install";

describe("test install a pip package", () => {
  describe("install a valid package (requests)", () => {
    beforeEach(async () => {
      await uninstallPackage("requests");
    });

    test("should be resolved", async () => {
      const res = installPackage("requests");
      await expect(res).resolves.toBeUndefined();
    });

    describe("show the package info", () => {
      test("should be valid", async () => {
        const res = showPackageInfo("pip");
        await expect(res).resolves.toBeInstanceOf(PackageInfo);
      });
    });
  });

  describe("install an invalid package", () => {
    test("should be rejected", async () => {
      const res = installPackage("an-invalid-package");
      await expect(res).rejects.toThrow();
    });
  });
});
