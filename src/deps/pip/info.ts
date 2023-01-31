import * as exec from "../../exec";
import * as log from "../../log";

export interface PackageInfo {
  name: string;
  version: string;
  dependencies: string[];
}

export async function showPackageInfo(
  packageName: string
): Promise<PackageInfo | null> {
  const args = ["-m", "pip", "show", packageName];
  const [out, ok] = await exec.execOutCheck("python3", args);
  if (!ok) return null;
  const lines = out.split("\n");
  const info: { [key: string]: string } = {};
  for (let i = 0; i < lines.length - 1; ++i) {
    const strs = lines[i].split(/:(.*)/s);
    if (strs.length >= 2) {
      info[strs[0].trim()] = strs[1].trim();
    } else {
      log.warning(`Invalid line: ${strs}`);
    }
  }
  return {
    name: info["Name"],
    version: info["Version"],
    dependencies: info["Requires"]
      .split(",")
      .map((str) => str.trim())
      .filter((str) => str.length > 0),
  };
}
