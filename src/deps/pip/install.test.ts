import { describe, expect, test } from "@jest/globals";
import { installPackage } from "./install";

describe("test install a pip package", () => {
  describe("install an invalid package", () => {
    const res = installPackage("an-invalid-package");
    test("should return a rejected promise", async () => {
      await expect(res).rejects.toThrow();
    });
  });
});
