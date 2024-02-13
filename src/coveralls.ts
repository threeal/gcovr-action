import * as log from "@actions-kit/log";
import * as fs from "fs";
import * as http from "./http.js";

export async function patch(coverallsOut: string) {
  let data: string = fs.readFileSync(coverallsOut).toString();
  data = data.replaceAll(
    '"service_name": "github-actions-ci"',
    '"service_name": "github"',
  );
  fs.writeFileSync(coverallsOut, data);
}

export async function send(coverallsOut: string) {
  await log.group("Sending report to Coveralls...", async () => {
    await http.postForm("https://coveralls.io/api/v1/jobs", {
      json_file: fs.createReadStream(coverallsOut),
    });
  });
}
