import * as core from "@actions/core";
import * as fs from "fs";
import * as chrono from "./chrono";
import * as http from "./http";

export async function patch(coverallsOut: string) {
  let data: string = fs.readFileSync(coverallsOut).toString();
  data = data.replaceAll(
    '"service_name": "github-actions-ci"',
    '"service_name": "github"'
  );
  fs.writeFileSync(coverallsOut, data);
}

export async function send(coverallsOut: string) {
  await core.group("Sending report to Coveralls...", async () => {
    const time = chrono.now();
    await http.postForm("https://coveralls.io/api/v1/jobs", {
      json_file: fs.createReadStream(coverallsOut),
    });
    core.info(`Done in ${time.elapsed()}`);
  });
}
