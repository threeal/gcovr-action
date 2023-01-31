import * as exec from "../../exec";

export interface Context {
  userSitePackage: string;
}

let gContext: Context | null = null;

async function getUserSitePackages(): Promise<string> {
  const cmd = "import site; print(site.getusersitepackages())";
  const out = await exec.execOut("python3", ["-c", cmd]);
  return out.trim();
}

export async function initContext(): Promise<Context> {
  if (gContext === null) {
    gContext = {
      userSitePackage: await getUserSitePackages(),
    };
  }
  return gContext;
}
