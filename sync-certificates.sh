#!/bin/bash

set -euo pipefail

REPOSITORY_URL="https://github.com/TheAndreyZakharov/Certificates-and-Diplomas.git"
BRANCH="main"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$PROJECT_ROOT/public/certificates"
MANIFEST_FILE="$PROJECT_ROOT/src/certificates.json"
TEMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/certificates-sync.XXXXXX")"
CHECKOUT_DIR="$TEMP_ROOT/repository"
STAGING_DIR="$TEMP_ROOT/site-certificates"

cleanup() {
  rm -rf "$TEMP_ROOT"
}

trap cleanup EXIT

echo "Downloading only docs from Certificates-and-Diplomas..."
git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$BRANCH" "$REPOSITORY_URL" "$CHECKOUT_DIR"
git -C "$CHECKOUT_DIR" sparse-checkout set docs

if [ ! -d "$CHECKOUT_DIR/docs" ]; then
  echo "Error: docs directory was not found in the repository." >&2
  exit 1
fi

mkdir -p "$STAGING_DIR"

node - "$CHECKOUT_DIR/docs" "$STAGING_DIR" "$MANIFEST_FILE" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const sourceRoot = process.argv[2];
const stagingRoot = process.argv[3];
const manifestPath = process.argv[4];
const supportedExtensions = new Set([".webp", ".png", ".jpg", ".jpeg", ".avif"]);

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  });
}

function slugify(value, fallback) {
  const slug = value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || fallback;
}

function uniqueSlug(value, fallback, used) {
  const base = slugify(value, fallback);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  used.add(candidate);
  return candidate;
}

const grouped = new Map();

for (const filePath of collectFiles(sourceRoot)) {
  const extension = path.extname(filePath).toLowerCase();
  if (!supportedExtensions.has(extension)) continue;

  const relativePath = path.relative(sourceRoot, filePath).split(path.sep).join("/");
  const parts = relativePath.split("/");
  const provider = parts.shift();
  const fileName = parts.at(-1).slice(0, -extension.length);
  const pageMatch = fileName.match(/^(.*)_(\d+)$/);
  const title = pageMatch ? pageMatch[1] : fileName;
  const page = pageMatch ? Number(pageMatch[2]) : 1;

  if (!grouped.has(provider)) grouped.set(provider, new Map());
  const providerDocuments = grouped.get(provider);
  if (!providerDocuments.has(title)) providerDocuments.set(title, []);
  providerDocuments.get(title).push({ filePath, extension, page });
}

if (grouped.size === 0) {
  throw new Error("No supported certificate images were found in docs.");
}

const usedProviderSlugs = new Set();
const providers = [...grouped.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, documents], providerIndex) => {
    const providerFolder = `${String(providerIndex + 1).padStart(2, "0")}-${uniqueSlug(name, `provider-${providerIndex + 1}`, usedProviderSlugs)}`;
    const providerDirectory = path.join(stagingRoot, providerFolder);
    const usedDocumentSlugs = new Set();

    const normalizedDocuments = [...documents.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([title, pages], documentIndex) => {
        const documentSlug = `${String(documentIndex + 1).padStart(3, "0")}-${uniqueSlug(title, `document-${documentIndex + 1}`, usedDocumentSlugs)}`;
        const sortedPages = pages.sort((left, right) => left.page - right.page);
        const urls = sortedPages.map((page, pageIndex) => {
          const pageName = sortedPages.length === 1
            ? `${documentSlug}${page.extension}`
            : `${documentSlug}-page-${pageIndex + 1}${page.extension}`;
          const targetPath = path.join(providerDirectory, pageName);
          fs.mkdirSync(providerDirectory, { recursive: true });
          fs.copyFileSync(page.filePath, targetPath);
          return `/certificates/${providerFolder}/${pageName}`;
        });
        return { title, pages: urls };
      });

    return { name, documents: normalizedDocuments };
  });

const manifest = {
  totalDocuments: providers.reduce((total, provider) => total + provider.documents.length, 0),
  totalPages: providers.reduce((total, provider) => total + provider.documents.reduce((count, document) => count + document.pages.length, 0), 0),
  providers,
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
NODE

certificate_count="$(find "$STAGING_DIR" -type f | wc -l | tr -d ' ')"

if [ -e "$TARGET_DIR" ]; then
  rm -rf "$TARGET_DIR"
fi
mv "$STAGING_DIR" "$TARGET_DIR"

echo "Synchronized $certificate_count certificate images into public/certificates."
echo "Generated URL-safe certificate paths and manifest: src/certificates.json"
