import * as fs from "fs";

export function writeJson(file: fs.PathOrFileDescriptor, data: any) {
  const str = JSON.stringify(data);
  fs.writeFileSync(file, str);
}
