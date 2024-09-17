// release.js
import { argv } from "process";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

async function runCommand(command, options = {}) {
  try {
    console.log(`Executing command: ${command}`);
    const { stdout, stderr } = await execPromise(command, options);
    if (stdout) {
      console.log(`Standard Output:\n${stdout}`);
    }
    if (stderr) {
      console.error(`Standard Error:\n${stderr}`);
    }
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
  }
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("-", "");
    const value = args[i + 1];
    options[key] = value;
  }
  return options;
}

const args = parseArgs(argv.slice(2));

console.log(args);

const version = args["v"];
const changelog = args["c"];

if (!version || !changelog) {
  console.error("Version and changelog are required.");
  process.exit(1);
}

console.log(`Version: ${version}`);
console.log(`Changelog: ${changelog}`);

// update versions in all workspaces
await runCommand(
  `pnpm -r exec npm version ${version} --allow-same-version --no-git-tag-version`
);

// build all workspaces
await runCommand(`pnpm -r build`);

// publish to npm registry
// await runCommand(`pnpm -r publish --access public --dry-run`);

await runCommand("git add .");
await runCommand(`git commit -m "release ${version}"`);
await runCommand(`git tag v${version}`);
await runCommand(`git push`);
await runCommand(`git push --tags`);

// Add your release logic here
