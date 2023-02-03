import { beforeAll, describe, expect, test } from "@jest/globals";
import { PackageInfo, showPackageInfo } from "./info";
import { installPackage, uninstallPackage } from "./install";

describe("test install a pip package", () => {
  describe("install a valid package (requests)", () => {
    beforeAll(async () => {
      await uninstallPackage("requests");
    });

    const testInstallPackage = async () => {
      const res = installPackage("requests");
      await expect(res).resolves.toBeUndefined();
    };

    const testShowPackageInfo = async () => {
      const res = showPackageInfo("pip");
      await expect(res).resolves.toBeInstanceOf(PackageInfo);
    };

    test("should be resolved", testInstallPackage);

    describe("show the package info", () => {
      test("should be valid", testShowPackageInfo);
    });

    describe("install the package again", () => {
      test("should be resolved", testInstallPackage);
    });

    describe("show the package info again", () => {
      test("should be valid", testShowPackageInfo);
    });
  });

  describe("install an invalid package", () => {
    test("should be rejected", async () => {
      const res = installPackage("an-invalid-package");
      await expect(res).rejects.toThrow();
    });
  });
});
