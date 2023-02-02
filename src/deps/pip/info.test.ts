import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { showPackageInfo } from "./info";

function expectPathExist(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error(`Expect ${path} to be exist`);
  }
}

describe("pip module", () => {
  test("show pip package info", async () => {
    const pkgInfo = await showPackageInfo("pip");
    expect(pkgInfo).not.toBeNull();
    if (pkgInfo === null) {
      throw new Error("`showPackageInfo` should not return null");
    }
    expect(pkgInfo.name).toBe("pip");
    expect(pkgInfo.version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
    expectPathExist(pkgInfo.location);
    for (const file of pkgInfo.absoluteFiles()) {
      expectPathExist(file);
    }
  });
  test("show invalid package info return null", async () => {
    const pkgInfo = await showPackageInfo("an-invalid-package");
    expect(pkgInfo).toBeNull();
  });
});
