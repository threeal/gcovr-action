import * as core from "@actions/core";
import * as fs from "fs";
import * as http from "./http";

export async function send(coverallsOut: string) {
  await core.group("Send code coverage report to Coveralls", async () => {
    await http.postForm("https://coveralls.io/api/v1/jobs", {
      json_file: fs.createReadStream(coverallsOut),
    });
  });
}
