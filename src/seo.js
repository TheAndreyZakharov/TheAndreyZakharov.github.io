import projects, { projectRepositories } from "./projects.js";
import researchPublications from "./publications.js";
import { seo as enSeo } from "./locales/en.js";
import { seo as ruSeo } from "./locales/ru.js";

export const siteOrigin = "https://theandreyzakharov.com";
export const views = ["home", "socials", "projects", "resumes", "education", "certificates", "publications", "patents"];

const pageCopy = { en: enSeo, ru: ruSeo };

export function pathFor(view = "home", language = "en", detailId = null) {
  const prefix = language === "ru" ? "/ru" : "";
  return view === "home" ? `${prefix}/` : `${prefix}/${view}/${["projects", "publications"].includes(view) && detailId ? `${detailId}/` : ""}`;
}

export function routeFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const language = segments[0] === "ru" ? "ru" : "en";
  const section = segments[language === "ru" ? 1 : 0];
  const view = views.includes(section) ? section : "home";
  const candidate = segments[language === "ru" ? 2 : 1];
  const projectId = view === "projects" && projects.some((project) => project.id === candidate) ? candidate : null;
  const publicationId = view === "publications" && researchPublications.some((publication) => publication.id === candidate) ? candidate : null;
  return { language, view, projectId, publicationId };
}

export function pageMeta(view, language, detailId = null) {
  const project = view === "projects" && detailId ? projects.find((item) => item.id === detailId) : null;
  if (project) return {
    title: language === "ru" ? `${project.name} — проекты Андрея Захарова` : `${project.name} — Andrey Zakharov's Projects`,
    description: project.summary[language],
    url: `${siteOrigin}${pathFor(view, language, detailId)}`,
    noindex: false,
  };
  const publication = view === "publications" && detailId ? researchPublications.find((item) => item.id === detailId) : null;
  if (publication) return {
    title: `${publication.title[language]} — ${language === "ru" ? "Андрей Захаров" : "Andrey Zakharov"}`,
    description: publication.metaDescription[language],
    url: `${siteOrigin}${pathFor(view, language, detailId)}`,
    noindex: false,
  };
  const [title, description] = pageCopy[language][view];
  return { title, description, url: `${siteOrigin}${pathFor(view, language)}`, noindex: false };
}

const personIdentity = {
  "@type": "Person",
  "@id": `${siteOrigin}/#person`,
  url: `${siteOrigin}/`,
  sameAs: [
    "https://github.com/TheAndreyZakharov",
    "https://gitlab.com/TheAndreyZakharov",
    "https://www.linkedin.com/in/TheAndreyZakharov",
    "https://orcid.org/0009-0005-4280-8352",
    "https://huggingface.co/TheAndreyZakharov",
  ],
};

export function structuredData(view, language, detailId = null) {
  const meta = pageMeta(view, language, detailId);
  const project = view === "projects" && detailId ? projects.find((item) => item.id === detailId) : null;
  const publication = view === "publications" && detailId ? researchPublications.find((item) => item.id === detailId) : null;
  const person = {
    ...personIdentity,
    name: language === "ru" ? "Андрей Захаров" : "Andrey Zakharov",
    alternateName: language === "ru" ? ["Andrey Zakharov", "TheAndreyZakharov"] : ["Андрей Захаров", "TheAndreyZakharov"],
    description: language === "ru" ? "Инженер-разработчик, занимается созданием программных продуктов и исследованиями" : "Software engineer working on software products and research",
  };
  const graph = [
    { "@type": "WebSite", "@id": `${siteOrigin}/#website`, name: "Andrey Zakharov", alternateName: "Андрей Захаров", url: `${siteOrigin}/`, inLanguage: ["en", "ru"] },
    person,
    { "@type": view === "home" ? "ProfilePage" : project || publication ? "WebPage" : "CollectionPage", "@id": `${meta.url}#webpage`, url: meta.url, name: meta.title, description: meta.description, inLanguage: language, isPartOf: { "@id": `${siteOrigin}/#website` }, ...(view === "home" ? { mainEntity: { "@id": person["@id"] } } : project ? { mainEntity: { "@id": `${meta.url}#project` } } : publication ? { mainEntity: { "@id": `${meta.url}#article` } } : { about: { "@id": person["@id"] } }) },
  ];
  if (project) {
    const repositories = projectRepositories[project.id];
    graph.push({ "@type": "CreativeWork", "@id": `${meta.url}#project`, name: project.name, description: project.summary[language], url: meta.url, creator: { "@id": person["@id"] }, sameAs: Array.isArray(repositories) ? repositories.map((repository) => repository.url) : repositories ? [repositories] : [] });
  } else if (view === "projects") {
    graph.push({ "@type": "ItemList", "@id": `${meta.url}#projects`, itemListElement: projects.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, description: item.summary[language], url: `${siteOrigin}${pathFor("projects", language, item.id)}` })) });
  }
  if (publication) {
    graph.push({
      "@type": "ScholarlyArticle", "@id": `${meta.url}#article`, url: meta.url,
      headline: publication.title.ru,
      alternateName: publication.title.en,
      inLanguage: "ru", author: { "@id": person["@id"] },
      datePublished: publication.datePublished, pagination: publication.pages,
      isPartOf: { "@type": "Book", name: publication.venueTitle[language], isbn: publication.volumeIsbn },
    });
  } else if (view === "publications") {
    graph.push({ "@type": "ItemList", "@id": `${meta.url}#publications`, itemListElement: researchPublications.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title[language], url: `${siteOrigin}${pathFor("publications", language, item.id)}` })) });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

export function headMarkup(view, language, detailId = null) {
  const meta = pageMeta(view, language, detailId);
  const other = language === "ru" ? "en" : "ru";
  const image = `${siteOrigin}/social-preview.png`;
  const json = JSON.stringify(structuredData(view, language, detailId)).replace(/</g, "\\u003c");
  return [
    `<title data-seo>${escapeHtml(meta.title)}</title>`,
    `<meta data-seo name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta data-seo name="author" content="Andrey Zakharov" />`,
    `<meta data-seo name="robots" content="${meta.noindex ? "noindex, follow" : "index, follow, max-snippet:-1, max-image-preview:large"}" />`,
    `<link data-seo rel="canonical" href="${meta.url}" />`,
    `<link data-seo rel="alternate" hreflang="${language}" href="${meta.url}" />`,
    `<link data-seo rel="alternate" hreflang="${other}" href="${siteOrigin}${pathFor(view, other, detailId)}" />`,
    `<link data-seo rel="alternate" hreflang="x-default" href="${siteOrigin}${pathFor(view, "en", detailId)}" />`,
    `<meta data-seo property="og:type" content="website" />`,
    `<meta data-seo property="og:site_name" content="Andrey Zakharov" />`,
    `<meta data-seo property="og:locale" content="${language === "ru" ? "ru_RU" : "en_US"}" />`,
    `<meta data-seo property="og:locale:alternate" content="${language === "ru" ? "en_US" : "ru_RU"}" />`,
    `<meta data-seo property="og:url" content="${meta.url}" />`,
    `<meta data-seo property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta data-seo property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta data-seo property="og:image" content="${image}" />`,
    `<meta data-seo property="og:image:width" content="1200" />`,
    `<meta data-seo property="og:image:height" content="630" />`,
    `<meta data-seo property="og:image:alt" content="Andrey Zakharov" />`,
    `<meta data-seo name="twitter:card" content="summary_large_image" />`,
    `<meta data-seo name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta data-seo name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta data-seo name="twitter:image" content="${image}" />`,
    `<script data-seo type="application/ld+json">${json}</script>`,
  ].join("\n    ");
}
