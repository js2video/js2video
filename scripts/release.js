import { exec } from "child_process";
import { promisify } from "util";
import packageJson from "../package.json" assert { type: "json" };

const execPromise = promisify(exec);

async function runCommand(command, options = {}) {
  try {
    console.log(`Executing command: ${command}`);
    const { stdout, stderr } = await execPromise(command, options);
    if (stdout) {
      console.log(`${stdout}`);
    }
    if (stderr) {
      console.warn(`${stderr}`);
    }
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
  }
}

const version = packageJson.version;

console.log(`Version: ${version}`);

// update versions in all workspaces
await runCommand(`pnpm -r exec npm version ${version} --no-git-tag-version`);

// build all workspaces
await runCommand(`pnpm -r build`);

// add to git
await runCommand("git add .");
await runCommand(`git commit -m "release ${version}"`);
await runCommand(`git tag v${version}`);
await runCommand(`git push`);
await runCommand(`git push --tags`);

// publish to npm registry
await runCommand(`pnpm -r publish --access public`);
