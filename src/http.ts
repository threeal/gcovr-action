import FormData from "form-data";
import * as fs from "fs";

type Form = { [key: string]: string | fs.ReadStream };

export async function postForm(url: string, form: Form): Promise<Buffer[]> {
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
  return new Promise<Buffer[]>((resolve, reject) => {
    formData.submit(options, (err, res) => {
      if (err) return reject(err);
      const body: Buffer[] = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => {
        if (res.statusCode === undefined) {
          reject(new Error(`HTTP status code unknown: ${body.toString()}`));
        } else if (res.statusCode < 200 || res.statusCode > 299) {
          reject(
            new Error(`HTTP status code ${res.statusCode}: ${body.toString()}`)
          );
        } else {
          resolve(body);
        }
      });
    });
  });
}
