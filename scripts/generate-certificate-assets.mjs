import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const [assetRoot, manifestPath] = process.argv.slice(2);

if (!assetRoot || !manifestPath) {
  throw new Error("Usage: node scripts/generate-certificate-assets.mjs <asset-root> <manifest-path>");
}

const root = path.resolve(assetRoot);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const execFileAsync = promisify(execFile);

const jobs = [];
for (const provider of manifest.providers) {
  for (const document of provider.documents) {
    const thumbnailPages = [];
    const pageDimensions = [];

    for (const pageUrl of document.pages) {
      const relativePath = decodeURIComponent(pageUrl.replace(/^\/certificates\//, ""));
      const sourcePath = path.resolve(root, relativePath);
      if (!sourcePath.startsWith(`${root}${path.sep}`)) throw new Error(`Invalid certificate path: ${pageUrl}`);
      const extension = path.extname(sourcePath);
      const thumbnailPath = sourcePath.slice(0, -extension.length) + ".thumb.jpg";
      thumbnailPages.push(pageUrl.slice(0, -extension.length) + ".thumb.jpg");
      pageDimensions.push(null);
      jobs.push({ sourcePath, thumbnailPath, pageDimensions, pageIndex: pageDimensions.length - 1 });
    }

    document.thumbnails = thumbnailPages;
    document.pageDimensions = pageDimensions;
  }
}

let nextJob = 0;
const worker = async () => {
  while (nextJob < jobs.length) {
    const job = jobs[nextJob++];
    const { stdout } = await execFileAsync("sips", [
      "-g", "pixelWidth", "-g", "pixelHeight", job.sourcePath,
    ], { encoding: "utf8", maxBuffer: 1024 * 1024 });
    const width = Number(stdout.match(/^\s*pixelWidth:\s*(\d+)\s*$/m)?.[1]);
    const height = Number(stdout.match(/^\s*pixelHeight:\s*(\d+)\s*$/m)?.[1]);
    if (!width || !height) throw new Error(`Could not read image dimensions: ${job.sourcePath}\n${stdout}`);
    job.pageDimensions[job.pageIndex] = { width, height };
    await execFileAsync("sips", [
      "-s", "format", "jpeg",
      "-s", "formatOptions", "48",
      "-Z", "320",
      job.sourcePath,
      "--out", job.thumbnailPath,
    ], { encoding: "utf8", maxBuffer: 1024 * 1024 });
  }
};

await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker));
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
