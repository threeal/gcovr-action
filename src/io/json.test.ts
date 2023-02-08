import { describe, test } from "@jest/globals";
import * as tmp from "tmp";
import { expect } from "../testing";
import { writeJson } from "./json";

describe("test write and read JSON", () => {
  describe("write and read JSON object", () => {
    const path = tmp.tmpNameSync();
    const obj = {
      name: "John Doe",
      age: 27,
    };

    describe("write JSOn object to a file", () => {
      test("should not error", () => {
        expect(() => writeJson(path, obj)).not.toThrow();
      });
    });

    describe("check the file", () => {
      test("should be exist", () => {
        expect(path).toBeExist();
      });
    });
  });
});
