import { FormData } from "formdata-node";
import { fileFromPathSync } from "formdata-node/file-from-path";
import * as fs from "fs";
import { beginLogGroup, endLogGroup, logInfo } from "gha-utils";
import got from "got";

export function patch(coverallsOut: string) {
  let data: string = fs.readFileSync(coverallsOut).toString();
  data = data.replaceAll(
    '"service_name": "github-actions-ci"',
    '"service_name": "github"',
  );
  fs.writeFileSync(coverallsOut, data);
}

export async function send(coverallsOut: string) {
  beginLogGroup("Sending report to Coveralls...");
  try {
    const form = new FormData();
    form.set("json_file", fileFromPathSync(coverallsOut));

    const res = await got.post("https://coveralls.io/api/v1/jobs", {
      body: form,
    });
    logInfo(`HTTP status code ${res.statusCode.toString()}: ${res.body}`);
  } catch (err) {
    endLogGroup();
    throw err;
  }
  endLogGroup();
}
