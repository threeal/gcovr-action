import * as log from "@actions-kit/log";
import FormData from "form-data";
import * as fs from "fs";

type Form = { [key: string]: string | fs.ReadStream };

export async function postForm(url: string, form: Form): Promise<null> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(form)) {
    formData.append(key, value);
  }
  const urlObj = new URL(url);
  const options: FormData.SubmitOptions = {
    host: urlObj.host,
    path: urlObj.pathname,
    method: "POST",
    protocol: "https:",
  };
  return new Promise<null>((resolve, reject) => {
    formData.submit(options, (err, res) => {
      if (err) return reject(err);
      const body: Buffer[] = [];
      res.on("data", (chunk) => {
        const prev = body.length;
        body.push(chunk);
        log.info(`Received ${chunk.length - prev} bytes of data`);
      });
      res.on("end", () => {
        if (res.statusCode === undefined) {
          reject(new Error(`HTTP status code unknown: ${body.toString()}`));
        } else if (res.statusCode < 200 || res.statusCode > 299) {
          reject(
            new Error(`HTTP status code ${res.statusCode}: ${body.toString()}`)
          );
        } else {
          log.info(`HTTP status code ${res.statusCode}: ${body.toString()}`);
          resolve(null);
        }
      });
    });
  });
}
