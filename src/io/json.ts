import * as fs from "fs";

export function writeJson(file: fs.PathOrFileDescriptor, data: any) {
  const str = JSON.stringify(data);
  fs.writeFileSync(file, str);
}

export function readJson<Type>(file: fs.PathOrFileDescriptor): Type {
  const buf = fs.readFileSync(file);
  return JSON.parse(buf.toString());
}
