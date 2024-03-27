import * as core from "@actions/core";
import { FormData } from "formdata-node";
import { fileFromPathSync } from "formdata-node/file-from-path";
import * as fs from "fs";
import got from "got";

export async function patch(coverallsOut: string) {
  let data: string = fs.readFileSync(coverallsOut).toString();
  data = data.replaceAll(
    '"service_name": "github-actions-ci"',
    '"service_name": "github"',
  );
  fs.writeFileSync(coverallsOut, data);
}

export async function send(coverallsOut: string) {
  await core.group("Sending report to Coveralls...", async () => {
    const form = new FormData();
    form.set("json_file", fileFromPathSync(coverallsOut));
    await got.post("https://coveralls.io/api/v1/jobs", { body: form });
  });
}
