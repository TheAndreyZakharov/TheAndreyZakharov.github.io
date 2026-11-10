import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import projects from "../src/projects.js";
import researchPublications from "../src/publications.js";
import { headMarkup, pathFor, siteOrigin, views } from "../src/seo.js";

const dist = new URL("../dist/", import.meta.url).pathname;
const template = await readFile(join(dist, "index.html"), "utf8");
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });

try {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const { default: CertificatesView } = await vite.ssrLoadModule("/src/CertificatesView.jsx");
  const { default: projectDetails } = await vite.ssrLoadModule("/src/projectDetails.js");
  for (const language of ["en", "ru"]) {
    const routes = views.map((view) => ({ view, detailId: null }))
      .concat(projects.map((project) => ({ view: "projects", detailId: project.id })))
      .concat(researchPublications.map((publication) => ({ view: "publications", detailId: publication.id })));
    for (const { view, detailId } of routes) {
      const route = pathFor(view, language, detailId);
      const html = renderToString(React.createElement(App, { initialView: view, initialLanguage: language, initialProjectId: view === "projects" ? detailId : null, initialPublicationId: view === "publications" ? detailId : null, initialCertificatesView: view === "certificates" ? CertificatesView : null, initialProjectDetails: view === "projects" && detailId ? projectDetails : null }));
      const page = template
        .replace('<html lang="en">', `<html lang="${language}">`)
        .replace(/<!-- SEO_HEAD_START -->[\s\S]*?<!-- SEO_HEAD_END -->/, headMarkup(view, language, detailId))
        .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
      const destination = join(dist, route, "index.html");
      await mkdir(join(dist, route), { recursive: true });
      await writeFile(destination, page);
    }
  }
} finally {
  await vite.close();
}

const xmlEscape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const entries = ["en", "ru"].flatMap((language) => views.map((view) => ({ view, detailId: null }))
  .concat(projects.map((project) => ({ view: "projects", detailId: project.id })))
  .concat(researchPublications.map((publication) => ({ view: "publications", detailId: publication.id })))
  .map(({ view, detailId }) => {
  const url = `${siteOrigin}${pathFor(view, language, detailId)}`;
  return `  <url><loc>${xmlEscape(url)}</loc></url>`;
}));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
await writeFile(join(dist, "sitemap.xml"), sitemap);
await writeFile(new URL("../public/sitemap.xml", import.meta.url), sitemap);
