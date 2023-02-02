import * as fs from "fs";
import * as path from "path";
import * as exec from "../../exec";
// import log from "../../log";  temporarily disabled

function determineBinLocation(siteLocation: string): string {
  let iterLocation = siteLocation;
  while (true) {
    const parsedPath = path.parse(iterLocation);
    if (parsedPath.root === parsedPath.dir) {
      throw new Error(`Failed to determine bin location of '${siteLocation}'`);
    }
    const binLocation = path.join(iterLocation, "bin");
    if (fs.existsSync(binLocation)) {
      return binLocation;
    }
    iterLocation = path.join(iterLocation, "..");
  }
}

export class PackageInfo {
  name: string = "";
  version: string = "";
  location: string = "";
  dependencies: string[] = [];
  files: string[] = [];

  absoluteFiles(): string[] {
    const absFiles: string[] = [];
    let binLocation: string | null = null;
    for (let i = 0; i < this.files.length; ++i) {
      let file = this.files[i];
      let filePath = path.parse(file);
      if (filePath.dir.toLowerCase().startsWith(this.name.toLowerCase())) {
        absFiles.push(path.join(this.location, file));
      } else {
        // it's a binary file
        if (binLocation === null) {
          binLocation = determineBinLocation(this.location);
        }
        absFiles.push(path.join(binLocation, filePath.base));
      }
    }
    return absFiles;
  }
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
        const line = lines[j].trim();
        if (line.length > 0) packageInfo.files.push(line);
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
