import { describe, expect, jest, test } from "@jest/globals";
import { showPackageInfo } from "./info";

describe("pip module", () => {
  test("show pip package info", async () => {
    const pkgInfo = await showPackageInfo("pip");
    expect(pkgInfo).not.toBeNull();
    if (pkgInfo === null) {
      throw new Error("`showPackageInfo` should not return null");
    }
    expect(pkgInfo.name).toBe("pip");
    expect(pkgInfo.version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
  });
});
