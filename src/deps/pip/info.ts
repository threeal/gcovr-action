import * as exec from "../../exec";
// import log from "../../log";  temporarily disabled

export class PackageInfo {
  name: string = "";
  version: string = "";
  location: string = "";
  dependencies: string[] = [];
  files: string[] = [];
}

export async function showPackageInfo(
  packageName: string
): Promise<PackageInfo | null> {
  const args = ["-m", "pip", "show", "-f", packageName];
  const [out, ok] = await exec.execOutCheck("python3", args);
  if (!ok) return null;
  const lines = out.split("\n");
  let packageInfo = new PackageInfo();
  for (let i = 0; i < lines.length - 1; ++i) {
    const strs = lines[i].split(/:(.*)/s);
    if (strs.length >= 1 && strs[0] === "Files") {
      for (let j = i + 1; j < lines.length; ++j) {
        let line = lines[j].trim();
        if (line.length < 0) continue;
        // Fix wrong pip path on bin directory
        if (line.startsWith("../../bin")) {
          line = `../${line}`;
        }
        packageInfo.files.push(line);
      }
      break;
    } else if (strs.length >= 2) {
      switch (strs[0]) {
        case "Name":
          packageInfo.name = strs[1].trim();
          break;
        case "Version":
          packageInfo.version = strs[1].trim();
          break;
        case "Location":
          packageInfo.location = strs[1].trim();
          break;
        case "Requires":
          packageInfo.dependencies = strs[1]
            .split(",")
            .map((str) => str.trim())
            .filter((str) => str.length > 0);
          break;
      }
    } else {
      // log.warning(`Invalid line: ${strs}`);
    }
  }
  return packageInfo;
}
