import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import projects from "../src/projects.js";
import projectDetails from "../src/projectDetails.js";
import publications from "../src/publications.js";
import { pageMeta, pathFor, siteOrigin, views } from "../src/seo.js";

const dist = new URL("../dist/", import.meta.url).pathname;
const routeDefinitions = views.map((view) => ({ view, id: null }))
  .concat(projects.map(({ id }) => ({ view: "projects", id })))
  .concat(publications.map(({ id }) => ({ view: "publications", id })));
const routes = ["en", "ru"].flatMap((language) =>
  routeDefinitions.map(({ view, id }) => ({ language, view, id, path: pathFor(view, language, id) }))
);
const expectedUrls = new Set(routes.map(({ path }) => `${siteOrigin}${path}`));
const errors = [];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

for (const route of routes) {
  const file = join(dist, route.path, "index.html");
  if (!(await exists(file))) { errors.push(`Missing page: ${route.path}`); continue; }
  const html = await readFile(file, "utf8");
  const meta = pageMeta(route.view, route.language, route.id);
  const other = route.language === "ru" ? "en" : "ru";
  const required = [
    `<html lang="${route.language}">`,
    `<title data-seo>`,
    `name="description"`,
    `rel="canonical" href="${meta.url}"`,
    `hreflang="${other}" href="${siteOrigin}${pathFor(route.view, other, route.id)}"`,
    `type="application/ld+json"`,
    `property="og:image" content="${siteOrigin}/social-preview.png"`,
    `<div id="root">`,
    `<h1`,
  ];
  for (const fragment of required) {
    if (!html.includes(fragment)) errors.push(`${route.path}: missing ${fragment}`);
  }
  if (html.includes('<div id="root"></div>')) errors.push(`${route.path}: empty prerendered page`);
  if (route.view === "projects" && route.id) {
    const firstWorkItem = projectDetails[route.id]?.work[route.language]?.[0];
    if (!firstWorkItem || !html.includes(firstWorkItem.slice(0, 24))) {
      errors.push(`${route.path}: missing prerendered project details`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const localPath = match[1].split(/[?#]/, 1)[0];
    const target = join(dist, localPath, localPath.endsWith("/") ? "index.html" : "");
    if (!(await exists(target))) errors.push(`${route.path}: broken local reference ${match[1]}`);
  }
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== expectedUrls.size || new Set(sitemapUrls).size !== expectedUrls.size) {
  errors.push(`Sitemap contains ${sitemapUrls.length} URLs; expected ${expectedUrls.size} unique URLs`);
}
for (const url of expectedUrls) if (!sitemapUrls.includes(url)) errors.push(`Missing sitemap URL: ${url}`);
for (const filename of ["robots.txt", "llms.txt", "site.webmanifest"]) {
  if (!(await exists(join(dist, filename)))) errors.push(`Missing public file: ${filename}`);
}
for (const filename of [
  "social-preview.png",
  "fonts/dm-sans-latin.woff2",
  "fonts/dm-sans-latin-ext.woff2",
  "fonts/manrope-latin.woff2",
  "fonts/manrope-latin-ext.woff2",
  "fonts/manrope-cyrillic.woff2",
  "fonts/manrope-cyrillic-ext.woff2",
]) {
  if (!(await exists(join(dist, filename)))) errors.push(`Missing asset: ${filename}`);
}

if (errors.length) {
  console.error(errors.slice(0, 30).join("\n"));
  if (errors.length > 30) console.error(`...and ${errors.length - 30} more errors`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${routes.length} prerendered pages, sitemap entries, metadata and local references.`);
}
