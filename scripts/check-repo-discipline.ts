import { execFileSync } from "node:child_process";

const USER_FACING_PREFIXES = ["app/", "components/", "public/", "types/"];
const TECHNICAL_PREFIXES = ["app/api/", "lib/", "prisma/", "tests/", "scripts/"];
const TECHNICAL_FILES = [
  ".env.example",
  ".env.docker.example",
  "Dockerfile",
  "compose.yaml",
  "next.config.ts",
  "package.json",
  "playwright.config.ts",
  "prisma.config.ts",
];
const IGNORED_CHANGED_FILES = [
  "desktop.ini",
  "docs/RYTHM - PRD + BRD + TRD.txt",
  "docs/Rythm PRD + BRD + TRD .txt",
];

type Options = {
  base?: string;
  head?: string;
  staged?: boolean;
};

function readArgs() {
  const args = process.argv.slice(2);
  const options: Options = {};

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];

    if (value === "--base") {
      options.base = args[index + 1];
      index += 1;
      continue;
    }

    if (value === "--head") {
      options.head = args[index + 1];
      index += 1;
      continue;
    }

    if (value === "--staged") {
      options.staged = true;
    }
  }

  return options;
}

function runGit(args: string[]) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function hasRef(ref: string) {
  try {
    runGit(["rev-parse", "--verify", ref]);
    return true;
  } catch {
    return false;
  }
}

function isZeroRef(ref?: string) {
  return !ref || /^0+$/.test(ref);
}

function getChangedFiles(options: Options) {
  if (options.staged) {
    return runGit(["diff", "--name-only", "--diff-filter=ACMR", "--cached"]);
  }

  if (options.base && !isZeroRef(options.base)) {
    const head = options.head ?? "HEAD";

    return runGit([
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      options.base,
      head,
    ]);
  }

  if (hasRef("HEAD")) {
    const trackedChanges = runGit(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]);
    const untrackedFiles = runGit(["ls-files", "--others", "--exclude-standard"]);

    return [trackedChanges, untrackedFiles].filter(Boolean).join("\n");
  }

  return "";
}

function normalizeFiles(rawOutput: string) {
  return rawOutput
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function hasPrefix(files: string[], prefixes: string[]) {
  return files.some((file) => prefixes.some((prefix) => file.startsWith(prefix)));
}

function hasExact(files: string[], expectedFiles: string[]) {
  return files.some((file) => expectedFiles.includes(file));
}

function hasCanonicalDoc(files: string[], docs: string[]) {
  return files.some((file) => docs.includes(file));
}

function main() {
  const options = readArgs();
  const changedFiles = normalizeFiles(getChangedFiles(options));
  const relevantFiles = changedFiles.filter(
    (file) => !IGNORED_CHANGED_FILES.includes(file),
  );

  if (!relevantFiles.length) {
    console.log("Repo discipline check skipped: no changed files detected.");
    return;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  const touchesQuestCompanion = relevantFiles.some((file) =>
    file.startsWith("quest-companion/"),
  );
  const touchesNonDocFiles = relevantFiles.some((file) => !file.startsWith("docs/"));
  const touchesUserFacingFiles = hasPrefix(relevantFiles, USER_FACING_PREFIXES);
  const touchesTechnicalFiles =
    hasPrefix(relevantFiles, TECHNICAL_PREFIXES) || hasExact(relevantFiles, TECHNICAL_FILES);

  if (touchesQuestCompanion) {
    errors.push(
      "Product implementation must stay in the root app. Changes under `quest-companion/` are blocked.",
    );
  }

  if (touchesNonDocFiles && !relevantFiles.includes("docs/to_dos.md")) {
    errors.push(
      "Non-doc changes require an update to `docs/to_dos.md` so task progress stays canonical.",
    );
  }

  if (
    touchesUserFacingFiles &&
    !hasCanonicalDoc(relevantFiles, ["docs/overview.md", "docs/to_dos.md"])
  ) {
    warnings.push(
      "User-facing changes detected without updates to `docs/overview.md` or `docs/to_dos.md`.",
    );
  }

  if (
    touchesTechnicalFiles &&
    !hasCanonicalDoc(relevantFiles, [
      "docs/techplan.md",
      "docs/environment.md",
      "docs/local_docker.md",
      "docs/vercel_deployment.md",
      "docs/to_dos.md",
    ])
  ) {
    warnings.push(
      "Technical boundary changes detected without updates to canonical technical docs.",
    );
  }

  console.log("Changed files:");
  for (const file of relevantFiles) {
    console.log(`- ${file}`);
  }

  if (warnings.length) {
    console.warn("\nWarnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (errors.length) {
    console.error("\nErrors:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("\nRepo discipline check passed.");
}

main();
