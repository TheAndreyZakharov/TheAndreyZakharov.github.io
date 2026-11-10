import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import { pathFor, routeFromPath } from "./seo.js";

// Old bookmarked section URLs still open the matching clean URL.
const legacySection = {
  "#socials": "socials",
  "#projects": "projects",
  "#resumes": "resumes",
  "#education": "education",
  "#certificates": "certificates",
  "#publications": "publications",
  "#research": "publications",
  "#patents": "patents",
};
const hash = window.location.hash;
const section = legacySection[hash] ?? (hash.startsWith("#certificate-provider-") ? "certificates" : null);
if (section) {
  const { language } = routeFromPath(window.location.pathname);
  window.history.replaceState(window.history.state, "", pathFor(section, language));
}

const root = document.getElementById("root");
const route = routeFromPath(window.location.pathname);
const initialCertificatesView = route.view === "certificates"
  ? (await import("./CertificatesView.jsx")).default
  : null;
const initialProjectDetails = route.projectId
  ? (await import("./projectDetails.js")).default
  : null;
const app = <StrictMode><App initialCertificatesView={initialCertificatesView} initialProjectDetails={initialProjectDetails} /></StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
