import * as core from "@actions/core";
import * as fs from "fs";
import * as http from "./http";

export async function patch(coverallsOut: string) {
  // Read file and replace search sentences in lines with a replacement sentence
  let file = await fs.promises.open(coverallsOut, "r");
  const lines: string[] = [];
  const search = '"service_name": "github-actions-ci"';
  const replacement = '"service_name": "github"';
  for await (const line of file.readLines()) {
    lines.push(line.replaceAll(search, replacement));
  }
  await file.close();
  // Write back replaced lines to the file
  file = await fs.promises.open(coverallsOut, "w");
  await file.writeFile(lines.join());
  await file.close();
}

export async function send(coverallsOut: string) {
  await core.group("Send code coverage report to Coveralls", async () => {
    await http.postForm("https://coveralls.io/api/v1/jobs", {
      json_file: fs.createReadStream(coverallsOut),
    });
  });
}
