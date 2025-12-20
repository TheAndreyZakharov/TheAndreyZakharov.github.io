import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import "./App.css";


const THEME_KEYS = {
  actor: "portfolioThemeActor",
  user: "portfolioUserTheme",     
  system: "portfolioSystemTheme", 
};

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readInitialTheme() {
  if (typeof window === "undefined") return "light";

  const systemNow = getSystemTheme();

  let actor = window.localStorage.getItem(THEME_KEYS.actor) || "system";
  let userTheme = window.localStorage.getItem(THEME_KEYS.user) || "dark";
  const lastSeen = window.localStorage.getItem(THEME_KEYS.system);

  if (actor === "user" && lastSeen && lastSeen !== systemNow) {
    actor = "system";
  }

  const effectiveTheme = actor === "user" ? userTheme : systemNow;

  window.localStorage.setItem(THEME_KEYS.actor, actor);
  window.localStorage.setItem(THEME_KEYS.user, userTheme);
  window.localStorage.setItem(THEME_KEYS.system, systemNow);

  return effectiveTheme;
}

function applyThemeToDom(mode) {
  if (typeof document === "undefined") return;
  document.body.dataset.theme = mode;
}


const SECTIONS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "certificates-preview", label: "Certificates" },
];


const CERT_IMAGES = import.meta.glob(
  "./certificates/**/*.{webp,png,jpg,jpeg}",
  { eager: true, as: "url" }
);

const CARTOPIA_GENERATED_IMAGES = import.meta.glob(
  "./project/Cartopia/generated/*.{png,jpg,jpeg,webp}",
  { eager: true, as: "url" }
);

const CARTOPIA_PHOTOS_IMAGES = import.meta.glob(
  "./project/Cartopia/photos/*.{png,jpg,jpeg,webp}",
  { eager: true, as: "url" }
);

const CARTOPIA_INTERFACE_IMAGES = import.meta.glob(
  "./project/Cartopia/interface/*.{png,jpg,jpeg,webp}",
  { eager: true, as: "url" }
);

const RAAS_IMAGES = import.meta.glob(
  "./project/Russian Automotive Assistance System/**/*.{png,jpg,jpeg,webp}",
  { eager: true, as: "url" }
);

const RAAS_CAPTIONS = {
  "1": "Multimedia main screen",
  "2": "Functions menu",
  "3": "360° surround-view module",
  "4": "Blind-spot monitoring module",
  "5": "Lane-keeping assist module",
  "6": "Vehicle control & telemetry",
};

function buildRaasSlides() {
  const items = Object.entries(RAAS_IMAGES).map(([path, url]) => {
    const fileName = getFileNameFromPath(path);
    const n = getNumberFromFileName(fileName);
    const stem = fileName.replace(/\.[^.]+$/, "");
    return { path, url, fileName, stem, n };
  });

  items.sort((a, b) => {
    const an = a.n;
    const bn = b.n;

    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    if (Number.isFinite(an) && !Number.isFinite(bn)) return -1;
    if (!Number.isFinite(an) && Number.isFinite(bn)) return 1;

    return a.fileName.localeCompare(b.fileName, "en", {
      numeric: true,
      sensitivity: "base",
    });
  });

  return items.map((it, idx) => ({
    id: `raas-${it.stem || idx}`,
    kind: "single",
    urls: [it.url],
    label: it.stem,
    caption:
      (Number.isFinite(it.n) && RAAS_CAPTIONS[String(it.n)]) ||
      RAAS_CAPTIONS[it.stem] ||
      "",
  }));
}

const RAAS_SLIDES = buildRaasSlides();

function getFileNameFromPath(p) {
  const parts = String(p).split("/");
  return parts[parts.length - 1] || "";
}

function getNumberFromFileName(fileName) {
  const stem = fileName.replace(/\.[^.]+$/, "");
  const m = stem.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

const CARTOPIA_CAPTIONS = {
  interface5: "Web interface for selecting the area to be generated",
  generated: {
    1: "View from the esplanade of the “Kuala Lumpur City Centre” complex toward the Petronas Towers - Kuala Lumpur, Malaysia.",
    6: "Moscow-City - view from below at the “Mercury” tower (Presnenskaya Embankment), Moscow, Russia.",
    7: "Top-down view of St. Isaac’s Cathedral and St. Isaac’s Square - Saint Petersburg, Russia.",
    8: "The Field of Mars and the Summer Garden, view toward Trinity Bridge and the Peter and Paul Fortress - Saint Petersburg, Russia.",
    9: "Alley of the Summer Garden, view toward the Coffee House - Saint Petersburg, Russia.",
    10: "Peter and Paul Fortress on Zayachy Island - Saint Petersburg, Russia.",
    12: "The Tower of London and Tower Bridge - London, United Kingdom.",
    14: "Cable cars on California Street, view toward Nob Hill - San Francisco, USA.",
    16: "Multi-level interchange of flyovers in the Puxi area - Shanghai, China.",
    18: "View of the Chertanovo Severnoye blocks from Kirovogradskaya Street, toward Bitsevsky Forest Park - Moscow, Russia.",
  },
};

function buildCartopiaSlides() {
  const generatedByNum = new Map();
  const photosByNum = new Map();

  for (const [path, url] of Object.entries(CARTOPIA_GENERATED_IMAGES)) {
    const n = getNumberFromFileName(getFileNameFromPath(path));
    if (Number.isFinite(n)) generatedByNum.set(n, url);
  }

  for (const [path, url] of Object.entries(CARTOPIA_PHOTOS_IMAGES)) {
    const n = getNumberFromFileName(getFileNameFromPath(path));
    if (Number.isFinite(n)) photosByNum.set(n, url);
  }

  let interface5Url = null;
  for (const [path, url] of Object.entries(CARTOPIA_INTERFACE_IMAGES)) {
    if (
      path.endsWith("/5.png") ||
      path.endsWith("/5.jpg") ||
      path.endsWith("/5.jpeg") ||
      path.endsWith("/5.webp")
    ) {
      interface5Url = url;
      break;
    }
  }
  if (!interface5Url) {
    const first = Object.values(CARTOPIA_INTERFACE_IMAGES)[0];
    if (first) interface5Url = first;
  }

  const nums = [...generatedByNum.keys()]
    .filter((n) => photosByNum.has(n))
    .sort((a, b) => a - b);

  const slides = [];

  if (interface5Url) {
    slides.push({
      id: "cartopia-interface-5",
      kind: "single",
      urls: [interface5Url],
      label: "Interface",
      caption: CARTOPIA_CAPTIONS.interface5 || "",
    });
  }

  for (const n of nums) {
    slides.push({
      id: `cartopia-pair-${n}`,
      kind: "pair",
      urls: [generatedByNum.get(n), photosByNum.get(n)],
      label: `#${n}`,
      caption: CARTOPIA_CAPTIONS.generated?.[n] || "",
    });
  }

  return slides;
}

const CARTOPIA_SLIDES = buildCartopiaSlides();


function slugifyForId(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prettifyCertName(str) {
  const withSpaces = str.replace(/_/g, " ").trim();
  return withSpaces.replace(/\s+/g, " ");
}

function formatCertificateCount(n) {
  const word = n === 1 ? "certificate" : "certificates";
  return `${n} ${word}`;
}


function buildCertData() {
  const orgMap = new Map();

  Object.entries(CERT_IMAGES).forEach(([path, url]) => {
    const parts = path.split("/");

    const certIndex = parts.indexOf("certificates");
    if (certIndex === -1 || certIndex + 2 > parts.length) return;

    const orgName = parts[certIndex + 1]; 
    const fileName = parts[parts.length - 1]; 

    const dotIndex = fileName.lastIndexOf(".");
    const nameWithoutExt =
      dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);

    let groupName = nameWithoutExt;
    let pageIndex = 1;
    const match = nameWithoutExt.match(/^(.*)_(\d+)$/);
    if (match) {
      groupName = match[1];
      pageIndex = parseInt(match[2], 10);
    }

    if (!orgMap.has(orgName)) {
      orgMap.set(orgName, {
        id: "cert-org-" + slugifyForId(orgName),
        name: orgName,
        certificatesMap: new Map(),
      });
    }

    const org = orgMap.get(orgName);
    if (!org.certificatesMap.has(groupName)) {
      org.certificatesMap.set(groupName, {
        id: slugifyForId(orgName + "-" + groupName),
        title: prettifyCertName(groupName),
        images: [],
      });
    }

    const certGroup = org.certificatesMap.get(groupName);
    certGroup.images.push({ url, pageIndex });
  });

  const organizations = Array.from(orgMap.values())
    .map((org) => {
      const certificates = Array.from(org.certificatesMap.values()).map(
        (cert) => ({
          ...cert,
          images: cert.images
            .sort((a, b) => a.pageIndex - b.pageIndex)
            .map((item) => item.url),
        })
      );

      certificates.sort((a, b) => a.title.localeCompare(b.title, "en"));

      return {
        id: org.id,
        name: org.name,
        certificates,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const sections = organizations.map((org) => ({
    id: org.id,
    label: org.name,
  }));

  return { organizations, sections };
}

const { organizations: CERT_ORGANIZATIONS, sections: CERT_SECTIONS } =
  buildCertData();

const CERT_NAV_SECTIONS = [
  { id: "certificates-intro-root", label: "Certificates" },
  ...CERT_SECTIONS,
];

const TOTAL_CERT_COUNT = CERT_ORGANIZATIONS.reduce(
  (sum, org) => sum + org.certificates.length,
  0
);


function App() {
  const [theme, setTheme] = useState(() => readInitialTheme());

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const sys = e.matches ? "dark" : "light";

      try {
        window.localStorage.setItem(THEME_KEYS.actor, "system");
        window.localStorage.setItem(THEME_KEYS.system, sys);
      } catch (err) {
        console.error("theme mq change error", err);
      }

      setTheme(sys);
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
    } else if (mq.addListener) {
      mq.addListener(handleChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleChange);
      } else if (mq.removeListener) {
        mq.removeListener(handleChange);
      }
    };
  }, []);

  const [route, setRoute] = useState(() => {
    if (typeof window === "undefined") return "home";
    return window.location.hash === "#certificates" ? "certificates" : "home";
  });

  const [activeSectionId, setActiveSectionId] = useState("about");

  const [mainSectionOffsets, setMainSectionOffsets] = useState([]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const [scrollTopTransitionMode, setScrollTopTransitionMode] = useState("fast");

  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const items = Array.from(
      headerEl.querySelectorAll(".brand, .header-actions")
    ).filter(Boolean);

    const measure = () =>
      new Map(items.map((el) => [el, el.getBoundingClientRect()]));

    function play(first, last) {
      items.forEach((el) => {
        const f = first.get(el);
        const l = last.get(el);
        if (!f || !l) return;

        const dx = f.left - l.left;
        const dy = f.top - l.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.willChange = "transform, opacity";
        el.style.opacity = "0.96";
      });

      requestAnimationFrame(() => {
        items.forEach((el) => {
          el.style.transition =
            "transform 420ms cubic-bezier(.22,.61,.36,1), opacity 320ms ease";
          el.style.transform = "translate(0,0)";
          el.style.opacity = "1";

          const clear = () => {
            el.style.transition = "";
            el.style.transform = "";
            el.style.willChange = "";
            el.style.opacity = "";
          };
          el.addEventListener("transitionend", clear, { once: true });
        });
      });
    }

    let isCompact = null; 

    function updateLayout({ noAnim } = {}) {
      const wantCompact = window.innerWidth <= 810;
      if (wantCompact === isCompact) return;

      if (noAnim) {
        headerEl.classList.toggle("app-header--compact", wantCompact);
        isCompact = wantCompact;
        return;
      }

      const first = measure();
      headerEl.classList.toggle("app-header--compact", wantCompact);
      const last = measure();
      play(first, last);
      isCompact = wantCompact;
    }

    updateLayout({ noAnim: true });

    let raf = null;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        updateLayout({ noAnim: false });
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollLockRef = useRef(false);
  const scrollLockTimeoutRef = useRef(null);


  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#certificates") {
        setRoute("certificates");
      } else {
        setRoute("home");
      }
      window.scrollTo({ top: 0 });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const handleScrollGold = () => {
      const doc = document.documentElement;

      const scrollTop =
        window.scrollY ||
        window.pageYOffset ||
        doc.scrollTop ||
        0;

      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

      const pos = 10 + progress * 80; 

      doc.style.setProperty("--scroll-gold-highlight-y", `${pos}%`);

      const angle = progress * 360;
      doc.style.setProperty("--scroll-gold-angle", `${angle}deg`);

    };

    handleScrollGold();

    window.addEventListener("scroll", handleScrollGold, { passive: true });
    window.addEventListener("resize", handleScrollGold);

    return () => {
      window.removeEventListener("scroll", handleScrollGold);
      window.removeEventListener("resize", handleScrollGold);
    };
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateButtonVisibility = (cause) => {
      const headerEl = headerRef.current;
      if (!headerEl) return;

      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        0;

      const mode = cause === "resize" ? "slow" : "fast";
      setScrollTopTransitionMode(mode);

      if (width <= 1150) {
        setShowScrollTop(false);
        return;
      }

      const rect = headerEl.getBoundingClientRect();
      const headerVisible = rect.bottom > 0;

      setShowScrollTop(!headerVisible);
    };

    const handleScroll = () => updateButtonVisibility("scroll");
    const handleResize = () => updateButtonVisibility("resize");

    updateButtonVisibility("resize");

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (route !== "home") return;

    function calcOffsets() {
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;

      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id: s.id,
          top: rect.top + scrollY,
        };
      }).filter(Boolean);

      setMainSectionOffsets(offsets);
    }

    calcOffsets();
    const id = setTimeout(calcOffsets, 0);

    window.addEventListener("resize", calcOffsets);
    window.addEventListener("load", calcOffsets);

    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", calcOffsets);
      window.removeEventListener("load", calcOffsets);
    };
  }, [route]);

  useEffect(() => {
    if (route !== "home") return;
    if (!mainSectionOffsets.length) return;

    function recomputeActive() {
      const rawScrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;

      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const docHeight = document.documentElement.scrollHeight;

      const maxScroll = Math.max(docHeight - viewportHeight, 0);
      const progress = maxScroll > 0 ? rawScrollY / maxScroll : 0;

      const MIN_RATIO = 0.25; 
      const MAX_RATIO = 0.75;
      const anchorRatio = MIN_RATIO + (MAX_RATIO - MIN_RATIO) * progress;

      const y = rawScrollY + viewportHeight * anchorRatio;

      let currentId = mainSectionOffsets[0].id;

      for (let i = 0; i < mainSectionOffsets.length; i++) {
        const cur = mainSectionOffsets[i];
        const next = mainSectionOffsets[i + 1];

        if (!next) {
          if (y >= cur.top) {
            currentId = cur.id;
          }
          break;
        }

        if (y >= cur.top && y < next.top) {
          currentId = cur.id;
          break;
        }
      }

      setActiveSectionId(currentId);
    }

    function handleScroll() {
      if (scrollLockRef.current) return;
      recomputeActive();
    }

    recomputeActive();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [route, mainSectionOffsets]);

  useEffect(() => {
    if (route !== "home") return;

    function unlockScrollSpy() {
      scrollLockRef.current = false;
    }

    window.addEventListener("wheel", unlockScrollSpy, { passive: true });
    window.addEventListener("touchmove", unlockScrollSpy, { passive: true });

    return () => {
      window.removeEventListener("wheel", unlockScrollSpy);
      window.removeEventListener("touchmove", unlockScrollSpy);
    };
  }, [route]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";

      if (typeof window !== "undefined") {
        const sys = getSystemTheme();
        try {
          window.localStorage.setItem(THEME_KEYS.actor, "user");
          window.localStorage.setItem(THEME_KEYS.user, next);
          window.localStorage.setItem(THEME_KEYS.system, sys);
        } catch (err) {
          console.error("toggleTheme localStorage error", err);
        }
      }

      return next;
    });
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    scrollLockRef.current = true;
    if (scrollLockTimeoutRef.current) {
      clearTimeout(scrollLockTimeoutRef.current);
    }
    scrollLockTimeoutRef.current = setTimeout(() => {
      scrollLockRef.current = false;
    }, 800); 

    setActiveSectionId(id);

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToCertificatesPage = () => {
    window.location.hash = "certificates";
  };

  const goHome = () => {
    window.location.hash = "";
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  return (
    <div className="app">
      <div className="app-inner">
        <header className="app-header" ref={headerRef}> 
          <div className="brand">
            <img
              src="/logo.png"
              alt="AZ monogram logo"
              className="brand-logo"
            />
            <div>
              <div className="brand-name">Andrey Zakharov</div>
              <div className="brand-subtitle">
                Full-stack Developer <br /> Software Engineer <br /> Project & Team Manager
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="header-nav">
              <button
                className={`header-link ${
                  route === "home" ? "header-link--active" : ""
                }`}
                type="button"
                onClick={goHome}
              >
                Home
              </button>
              <button
                className={`header-link ${
                  route === "certificates" ? "header-link--active" : ""
                }`}
                type="button"
                onClick={goToCertificatesPage}
              >
                Certificates
              </button>
            </div>

            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <button
              type="button"
              className={
                "scroll-top-button" +
                (showScrollTop ? " scroll-top-button--visible" : "") +
                (scrollTopTransitionMode === "slow"
                  ? " scroll-top-button--slow"
                  : " scroll-top-button--fast")
              }
              onClick={handleScrollToTop}
              aria-label="Прокрутить страницу наверх"
            >
              <span className="scroll-top-icon">↑</span>
            </button>
          </div>



        </header>

        {route === "home" ? (
          <main className="sections page-fade">
            <section id="about" className="section-card">
              <h2>About & contacts</h2>
              <div className="about-grid">
              <div className="about-text">
                <p>
                  I&apos;m a full-stack developer who enjoys turning ideas into working products. I love designing
                  application logic, writing clean, readable code and making sure everything fits together
                  smoothly from back end to front end.
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  I like when things are clear and structured: requirements, code and processes should be easy
                  to understand and well documented. I enjoy tracking metrics, iterating on them and improving
                  how a product behaves in practice. I&apos;m a constant learner, always exploring new tools,
                  technologies and approaches to grow both my development skills and the way I work with teams.
                </p>
              </div>
                <div className="contacts">
                  <div>
                    <div className="contact-label">Email</div>
                    <div className="contact-value">
                      <a href="mailto:Andrey.Zakharov.Contact@gmail.com">
                        Andrey.Zakharov.Contact@gmail.com
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="contact-label">GitHub</div>
                    <div className="contact-value">
                      <a
                        href="https://github.com/TheAndreyZakharov"
                        target="_blank"
                        rel="noreferrer"
                      >
                        github.com/TheAndreyZakharov
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="contact-label">Telegram</div>
                    <div className="contact-value">
                      <a
                        href="https://t.me/TheAndreyZakharov"
                        target="_blank"
                        rel="noreferrer"
                      >
                        @TheAndreyZakharov
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="projects" className="section-card">
              <h2>Projects</h2>
              <div className="projects-list">

                <article className="project-item">
                  <div className="project-header">
                    <div className="project-title-row">
                      <div className="project-title">Compass HR AI Module (Under development)</div>
                      <GithubIconLink
                        href="https://github.com/TheAndreyZakharov/Compass-HR-AI-Module"
                        label="Open Compass HR AI Module on GitHub"
                      />
                    </div>
                  </div>

                  <p className="project-description">
                    COMPASS-HR: AI-powered module for career paths, skill-gap analysis & org competency mapping.
                    Recommends learning plans, helps build teams, models future roles, estimates hiring costs and aligns
                    people development with strategy. Connects via open APIs to HR/ERP systems and uses Russian labor market data.
                  </p>

                  <div className="project-meta">
                    ERPNext · Frappe HRMS · Frappe Framework (Python) · Frappe Bench · MariaDB · Redis (RQ/Background Jobs) · JavaScript · 
                    Jinja2 · Bootstrap (Frappe Desk UI) · REST API (Frappe) · Node.js · Yarn/NPM · Nginx · Gunicorn · Supervisor/Systemd · 
                    Docker / Docker Compose · hh.ru API · Python ML stack (NumPy, pandas, scikit-learn, CatBoost/XGBoost, PyTorch/Transformers) · 
                    FastAPI (ML service/inference)
                  </div>
                </article>

                <article className="project-item">
                  <div className="project-header">
                    <div className="project-title-row">
                      <div className="project-title">Cartopia</div>
                      <GithubIconLink
                        href="https://github.com/TheAndreyZakharov/Cartopia"
                        label="Open Cartopia on GitHub"
                      />
                    </div>
                  </div>

                  <p className="project-description">
                    Cartopia for Minecraft 1.20.1 (Forge) turns real places into playable
                    worlds at true 1:1 scale. Pick a spot on the web map, confirm, and explore cities,
                    roads, terrain and landmarks built from open data. Real-time day/night and weather
                    sync, smooth terrain, and tons of details-perfect for virtual trips, filming, and research.
                  </p>

                  <div className="project-meta">
                    Java 17 · Minecraft Forge (1.20.1) · Gradle · Web UI (HTML/CSS/JavaScript, Leaflet) ·
                    Embedded local HTTP server (Java backend) · DEM/GeoTIFF raster processing (ImageIO, TwelveMonkeys, JAI) ·
                    Vector map processing (OpenStreetMap/Overpass, NDJSON sidecars) · Geospatial and weather APIs · Jackson JSON library
                  </div>
                  <CartopiaCarousel />
                </article>

                <article className="project-item">
                  <div className="project-header">
                    <div className="project-title-row">
                      <div className="project-title">Russian Automotive Assistance System</div>
                      <GithubIconLink
                        href="https://github.com/TheAndreyZakharov/Russian-Automotive-Assistance-System"
                        label="Open Russian Automotive Assistance System on GitHub"
                      />
                    </div>
                  </div>

                  <p className="project-description">
                    RAAS is a modular driver assistance system developed in the CARLA simulator for integration
                    into Russian vehicles such as Lada, Aurus, and others. It includes a wide range of ADAS features
                    and proposes a concept and prototype of how such a system could be built for domestic cars, focusing
                    on adaptability, open architecture, and real-world use.
                  </p>

                  <div className="project-meta">
                    Python 3 · CARLA simulator · PyTorch CUDA · OpenCV · PyQt5 GUI · Pygame GUI · NumPy · SQLite · torchvision ·
                    DataLoader training pipeline · Camera/LiDAR/Radar sensors · matplotlib
                  </div>
                  <RaasCarousel />
                </article>

                <article className="project-item">
                  <div className="project-header">
                    <div className="project-title-row">
                      <div className="project-title">Botyan</div>
                      <GithubIconLink
                        href="https://github.com/TheAndreyZakharov/Botyan"
                        label="Open Botyan on GitHub"
                      />
                    </div>
                  </div>

                  <p className="project-description">
                    Botyan is a cross-platform Telegram and Discord bot powered by a language model and featuring the
                    persona of Kate Artivian. Botyan can chat, generate memes-demotivators, run mini-games, apply video
                    effects, and send auto-messages. Easy to use and customizable.
                  </p>

                  <div className="project-meta">
                    Python 3 · discord.py · Telegram bot libraries · asyncio · HTTP LLM APIs · requests · Pillow · FFmpeg · JSON file storage · Background task schedulers
                  </div>
                </article>

                <article className="project-item">
                  <div className="project-header">
                    <div className="project-title-row">
                      <div className="project-title">Personal Website</div>
                      <GithubIconLink
                        href="https://github.com/TheAndreyZakharov/TheAndreyZakharov.github.io"
                        label="Open Portfolio on GitHub"
                      />
                    </div>
                  </div>

                  <p className="project-description">
                    Personal website showing who I am, what I build and how I grow. It gathers my key projects, work experience,
                    a structured timeline of education, a wide set of certificates from different platforms and ways to contact me
                    for cooperation or new opportunities. Updated as I learn and move forward. I keep refining it with ideas, growth and wins
                  </p>

                  <div className="project-meta">React · Vite · JavaScript (ES modules/JSX) · HTML5 · CSS3 · ESLint · GitHub Pages</div>
                </article>

                <article className="project-item">
                  <div className="project-header">
                    <div className="project-title-row">
                      <div className="project-title">SUAI Software Engineering and Management</div>
                      <GithubIconLink
                        href="https://github.com/TheAndreyZakharov/SUAI-Software-Engineering-and-Management"
                        label="Open SUAI repo on GitHub"
                      />
                    </div>
                  </div>

                  <p className="project-description">
                    This repository contains coursework, labs, and project reports for Software Engineering and Management at
                    Saint Petersburg State University of Aerospace Instrumentation (SUAI). It showcases assignments, code, and reports on
                    programming, software development, and IT aspects of management. Includes B.Sc. SE and M.Sc. Management tracks.
                  </p>

                  <div className="project-meta">
                    C++ · C · Java · Python · Swift · Assembly · JavaScript · SQL · PHP · Vue · QML · Lisp · Shell · HTML · CSS · JSP · Perl · 
                    MATLAB/Simulink · XML/XSD/XSLT · YAML · INI/Conf/Properties
                    </div>
                </article>

              </div>
            </section>

            <section id="education" className="section-card">
              <h2>Education</h2>
              <div className="education-list">
                <div className="education-item">
                  <strong>
                    Saint Petersburg State University of Aerospace Instrumentation (SUAI)
                  </strong>

                  <div className="education-program">
                    <div className="education-program-main">
                      <span className="education-program-type">
                        Bachelor&apos;s degree · Software Engineering
                      </span>
                      <span className="education-program-dates">2021–2025</span>
                    </div>
                    <div className="education-program-details">
                      Specialization: Software Systems Design. Institute of Information
                      Technologies and Programming, Department of Computer Technologies and
                      Software Engineering.
                    </div>
                  </div>

                  <div className="education-program">
                    <div className="education-program-main">
                      <span className="education-program-type">
                        Professional retraining diploma · Web and Multimedia Applications Developer
                      </span>
                      <span className="education-program-dates">2024</span>
                    </div>
                    <div className="education-program-details">
                      Program &quot;Fundamentals of Front-End Development&quot;.
                    </div>
                  </div>

                  <div className="education-program">
                    <div className="education-program-main">
                      <span className="education-program-type">
                        Master&apos;s degree · Management
                      </span>
                      <span className="education-program-dates">2025–2027</span>
                    </div>
                    <div className="education-program-details">
                      Specialization: Human Resource Management. Institute of Technologies
                      of Entrepreneurship and Law, Department of Business Informatics and Management.
                    </div>
                  </div>
                </div>
              </div>
            </section>


              <section id="certificates-preview" className="section-card">
                <h2>Certificates</h2>
                <p>
                  In addition to formal university education, I enjoy learning through online
                  courses, digital universities and tech academies. I like taking programs
                  where you can practice, pass tests and earn verifiable certificates.
                </p>

                <p style={{ marginTop: "0.6rem" }}>
                  I complete courses in software development, interface and product design,
                  modern technologies and technical solutions, project and team management,
                  and English language skills.
                </p>

                <p style={{ marginTop: "0.6rem" }}>
                  This portfolio currently includes {TOTAL_CERT_COUNT} certificates from{" "}
                  {CERT_ORGANIZATIONS.length} different learning platforms. You can explore
                  the full collection on the dedicated certificates page.
                </p>

                <div className="education-list" style={{ marginTop: "1.1rem" }}>
                </div>

                <div className="cert-preview-footer">
                  <button
                    className="link-button"
                    type="button"
                    onClick={goToCertificatesPage}
                  >
                    View all certificates
                  </button>
                </div>
              </section>

          </main>
        ) : (
          <CertificatesPage onBack={goHome} />
        )}
      </div>

      {route === "home" && (
        <SectionDots
          sections={SECTIONS}
          activeSectionId={activeSectionId}
          onDotClick={scrollToSection}
        />
      )}
    </div>
  );
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      <span className="theme-toggle-icon">
        {theme === "light" ? "☾" : "☼"}
      </span>
    </button>
  );
}


function GithubIconLink({ href, label }) {
  return (
    <a
      className="theme-toggle github-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
    >
      <img
        src="/github_logo_black.png"
        alt=""
        className="github-icon"
        draggable="false"
      />
    </a>
  );
}

function SectionDots({ sections, activeSectionId, onDotClick }) {
  const [layout, setLayout] = useState({ gap: 8, opacity: 1 });

  useEffect(() => {
    function updateLayout() {
      if (typeof window === "undefined") return;

      const height = window.innerHeight;
      const width = window.innerWidth;
      const count = sections.length || 1;

      const rowHeight = 20; 
      const paddingY = 32;
      const maxGap = 8;
      const minGap = 1;

      const available = height - paddingY;

      const totalWithMaxGap = count * rowHeight + (count - 1) * maxGap;

      let gap = maxGap;

      if (available < totalWithMaxGap && count > 1) {
        const neededGap = (available - count * rowHeight) / (count - 1);
        gap = Math.max(minGap, Math.min(maxGap, neededGap));
      }

      const minTotalHeight = count * rowHeight + (count - 1) * minGap;

      const heightOk = available >= minTotalHeight;
      const widthOk = width > 1250;

      let allSectionsFullyVisible = false;

      const sectionEls = sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);

      if (sectionEls.length > 0) {
        const viewportTop = 0;
        const viewportBottom = height;

        allSectionsFullyVisible = sectionEls.every((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= viewportTop && rect.bottom <= viewportBottom;
        });
      }

      const shouldShow = heightOk && widthOk && !allSectionsFullyVisible;
      const opacity = shouldShow ? 1 : 0;

      setLayout({ gap, opacity });
    }

    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout);
    };
  }, [sections]);

  if (!sections.length) return null;

  return (
    <nav
      className="section-dots"
      aria-label="Section navigation"
      style={{
        gap: `${layout.gap}px`,
        opacity: layout.opacity,
        pointerEvents: layout.opacity === 0 ? "none" : "auto",
      }}
    >
      {sections.map((section) => {
        const isActive = activeSectionId === section.id;

        return (
          <div
            key={section.id}
            className={
              "section-dot-row" +
              (isActive ? " section-dot-row--active" : "")
            }
          >
            <button
              type="button"
              className={
                "section-dot-button" +
                (isActive ? " section-dot-button--active" : "")
              }
              onClick={() => onDotClick(section.id)}
            >
              <span className="section-dot" aria-hidden="true" />
            </button>
            <span className="section-dot-label">{section.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function SmoothImage({ src, alt, className = "", ...props }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    const img = imgRef.current;
    if (!img) return;

    const finalize = () => {
      if (!cancelled) setLoaded(true);
    };

    const runDecode = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {
        // ignore
      } finally {
        finalize();
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      runDecode();
      return () => {
        cancelled = true;
      };
    }

    const onLoad = () => runDecode();
    const onError = () => finalize();

    img.addEventListener("load", onLoad, { once: true });
    img.addEventListener("error", onError, { once: true });

    return () => {
      cancelled = true;
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      draggable={false}
      className={`smooth-img ${loaded ? "smooth-img--loaded" : ""} ${className}`}
      {...props}
    />
  );
}



function CartopiaCarousel() {
  const slides = CARTOPIA_SLIDES;

  const FADE_MS = 320;
  const AUTO_MS = 5000;
  const MODAL_ANIMATION_MS = 260;

  const [slotIndices, setSlotIndices] = useState([0, 0]);
  const [frontSlot, setFrontSlot] = useState(0); 
  const [isFading, setIsFading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const timerRef = useRef(null);
  const transitionIdRef = useRef(0);
  const preloadedRef = useRef(new Set());

  const total = slides.length || 0;
  const backSlot = 1 - frontSlot;

  const activeIndex = total ? slotIndices[frontSlot] : 0;
  const active = total ? slides[activeIndex] : null;

  const preloadUrls = useCallback(async (urls) => {
    const list = (urls || []).filter(Boolean);

    await Promise.all(
      list.map(
        (url) =>
          new Promise((resolve) => {
            if (preloadedRef.current.has(url)) return resolve(true);

            const img = new Image();
            let done = false;

            const finish = (ok) => {
              if (done) return;
              done = true;
              if (ok) preloadedRef.current.add(url);
              resolve(ok);
            };

            img.decoding = "async";
            img.onload = async () => {
              try {
                if (img.decode) await img.decode();
              } catch {
                // ignore
              } finally {
                finish(true);
              }
            };
            img.onerror = () => finish(false);

            img.src = url;

            if (img.complete && img.naturalWidth > 0) {
              (async () => {
                try {
                  if (img.decode) await img.decode();
                } catch {
                  // ignore
                } finally {
                  finish(true);
                }
              })();
            }
          })
      )
    );
  }, []);

  const requestSwitch = useCallback(
    async (nextIndex) => {
      if (!total) return;

      const normalized = (nextIndex + total) % total;

      if (normalized === activeIndex && !isFading) return;

      transitionIdRef.current += 1;
      const myId = transitionIdRef.current;

      if (timerRef.current) window.clearTimeout(timerRef.current);

      await preloadUrls(slides[normalized].urls);

      if (transitionIdRef.current !== myId) return;

      setSlotIndices((prev) => {
        const arr = [...prev];
        arr[backSlot] = normalized;
        return arr;
      });

      requestAnimationFrame(() => {
        if (transitionIdRef.current !== myId) return;

        setIsFading(true);

        window.setTimeout(() => {
          if (transitionIdRef.current !== myId) return;

          setFrontSlot(backSlot);
          setIsFading(false);
        }, FADE_MS);
      });
    },
    [total, slides, activeIndex, backSlot, isFading, preloadUrls]
  );

  useEffect(() => {
    if (!total) return;
    if (isModalOpen) return;
    if (isFading) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      requestSwitch(activeIndex + 1);
    }, AUTO_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [total, activeIndex, isModalOpen, isFading, requestSwitch]);

  const openModal = () => {
    setIsModalClosing(false);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    if (!isModalOpen || isModalClosing) return;
    setIsModalClosing(true);

    window.setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, MODAL_ANIMATION_MS);
  }, [isModalOpen, isModalClosing]);

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") requestSwitch(activeIndex - 1);
      if (e.key === "ArrowRight") requestSwitch(activeIndex + 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, activeIndex, requestSwitch, closeModal]);

  if (!total || !active) return null;

  const renderCarouselStage = (slide) => (
    <div
      className={
        "cartopia-carousel-stage " +
        (slide.kind === "single" ? "cartopia-carousel-stage--single" : "")
      }
    >
      {slide.kind === "single" ? (
        <button
          type="button"
          className="cartopia-carousel-card"
          onClick={openModal}
          aria-label="Open image"
        >
          <img
            src={slide.urls[0]}
            alt="Cartopia screenshot"
            className="cartopia-carousel-img"
            draggable="false"
            decoding="async"
          />
        </button>
      ) : (
        <>
          <button
            type="button"
            className="cartopia-carousel-card"
            onClick={openModal}
            aria-label="Open images"
          >
            <img
              src={slide.urls[0]}
              alt="Cartopia generated"
              className="cartopia-carousel-img"
              draggable="false"
              decoding="async"
            />
          </button>

          <button
            type="button"
            className="cartopia-carousel-card"
            onClick={openModal}
            aria-label="Open images"
          >
            <img
              src={slide.urls[1]}
              alt="Cartopia photo"
              className="cartopia-carousel-img"
              draggable="false"
              decoding="async"
            />
          </button>
        </>
      )}
    </div>
  );

  const renderModalStage = (slide) => (
    <div
      className={
        "media-modal-stage " +
        (slide.kind === "single" ? "media-modal-stage--single" : "")
      }
    >
      {slide.kind === "single" ? (
        <img
          src={slide.urls[0]}
          alt="Cartopia screenshot"
          className="media-modal-img"
          draggable="false"
          decoding="async"
        />
      ) : (
        <>
          <img
            src={slide.urls[0]}
            alt="Cartopia generated"
            className="media-modal-img"
            draggable="false"
            decoding="async"
          />
          <img
            src={slide.urls[1]}
            alt="Cartopia photo"
            className="media-modal-img"
            draggable="false"
            decoding="async"
          />
        </>
      )}
    </div>
  );

  const renderLayer = (slotId, slide) => {
    const isFront = slotId === frontSlot;
    const opacity = isFading ? (isFront ? 0 : 1) : (isFront ? 1 : 0);

    return (
      <div
        className={
          "xfade-layer " + (isFront ? "xfade-layer--front" : "xfade-layer--back")
        }
        style={{
          opacity,
          pointerEvents: isFront ? "auto" : "none",
        }}
        aria-hidden={!isFront}
      >
        {renderCarouselStage(slide)}
      </div>
    );
  };

  const slideA = slides[slotIndices[0]];
  const slideB = slides[slotIndices[1]];

  return (
    <>
      <div className="cartopia-carousel" aria-label="Cartopia gallery">
        <div className="cartopia-carousel-xfade">
          {renderLayer(0, slideA)}
          {renderLayer(1, slideB)}
        </div>

        <div className="cartopia-carousel-dots" aria-label="Carousel pagination">
          {slides.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                className={
                  "cartopia-carousel-dot-btn" +
                  (isActive ? " cartopia-carousel-dot-btn--active" : "")
                }
                onClick={() => requestSwitch(i)}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span
                  className={
                    "cartopia-carousel-dot" +
                    (isActive ? " cartopia-carousel-dot--active" : "")
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={
              "media-modal-backdrop" +
              (isModalClosing ? " media-modal-backdrop--closing" : "")
            }
            onClick={closeModal}
          >
            <div
              className={
                "media-modal" + (isModalClosing ? " media-modal--closing" : "")
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="media-modal-header">
                <div className="media-modal-title">Cartopia</div>

                <button
                  type="button"
                  className="certificate-modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="media-modal-content">
                {slides[activeIndex]?.caption ? (
                  <div className="media-modal-caption">
                    {slides[activeIndex].caption}
                  </div>
                ) : null}

                <div className="media-modal-stage-xfade">
                  <div
                    className={
                      "xfade-layer " +
                      (frontSlot === 0 ? "xfade-layer--front" : "xfade-layer--back")
                    }
                    style={{
                      opacity: isFading ? (frontSlot === 0 ? 0 : 1) : (frontSlot === 0 ? 1 : 0),
                      pointerEvents: "none",
                    }}
                    aria-hidden={frontSlot !== 0}
                  >
                    {renderModalStage(slideA)}
                  </div>

                  <div
                    className={
                      "xfade-layer " +
                      (frontSlot === 1 ? "xfade-layer--front" : "xfade-layer--back")
                    }
                    style={{
                      opacity: isFading ? (frontSlot === 1 ? 0 : 1) : (frontSlot === 1 ? 1 : 0),
                      pointerEvents: "none",
                    }}
                    aria-hidden={frontSlot !== 1}
                  >
                    {renderModalStage(slideB)}
                  </div>
                </div>

                <div className="media-modal-nav">
                  <div className="media-modal-nav-buttons">
                    <button
                      type="button"
                      className="media-modal-nav-btn"
                      onClick={() => requestSwitch(activeIndex - 1)}
                      aria-label="Previous"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="media-modal-nav-btn"
                      onClick={() => requestSwitch(activeIndex + 1)}
                      aria-label="Next"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}


function UniversalSingleCarousel({ slides, title }) {
  const FADE_MS = 320;
  const AUTO_MS = 5000;
  const MODAL_ANIMATION_MS = 260;

  const [slotIndices, setSlotIndices] = useState([0, 0]);
  const [frontSlot, setFrontSlot] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const timerRef = useRef(null);
  const transitionIdRef = useRef(0);
  const preloadedRef = useRef(new Set());

  const total = slides.length || 0;
  const backSlot = 1 - frontSlot;

  const activeIndex = total ? slotIndices[frontSlot] : 0;
  const active = total ? slides[activeIndex] : null;

  const preloadUrls = useCallback(async (urls) => {
    const list = (urls || []).filter(Boolean);

    await Promise.all(
      list.map(
        (url) =>
          new Promise((resolve) => {
            if (preloadedRef.current.has(url)) return resolve(true);

            const img = new Image();
            let done = false;

            const finish = (ok) => {
              if (done) return;
              done = true;
              if (ok) preloadedRef.current.add(url);
              resolve(ok);
            };

            img.decoding = "async";
            img.onload = async () => {
              try {
                if (img.decode) await img.decode();
              } catch {
                // ignore
              } finally {
                finish(true);
              }
            };
            img.onerror = () => finish(false);

            img.src = url;

            if (img.complete && img.naturalWidth > 0) {
              (async () => {
                try {
                  if (img.decode) await img.decode();
                } catch {
                  // ignore
                } finally {
                  finish(true);
                }
              })();
            }
          })
      )
    );
  }, []);

  const requestSwitch = useCallback(
    async (nextIndex) => {
      if (!total) return;

      const normalized = (nextIndex + total) % total;
      if (normalized === activeIndex && !isFading) return;

      transitionIdRef.current += 1;
      const myId = transitionIdRef.current;

      if (timerRef.current) window.clearTimeout(timerRef.current);

      await preloadUrls(slides[normalized].urls);
      if (transitionIdRef.current !== myId) return;

      setSlotIndices((prev) => {
        const arr = [...prev];
        arr[backSlot] = normalized;
        return arr;
      });

      requestAnimationFrame(() => {
        if (transitionIdRef.current !== myId) return;

        setIsFading(true);

        window.setTimeout(() => {
          if (transitionIdRef.current !== myId) return;

          setFrontSlot(backSlot);
          setIsFading(false);
        }, FADE_MS);
      });
    },
    [total, slides, activeIndex, backSlot, isFading, preloadUrls]
  );

  useEffect(() => {
    if (!total) return;
    if (isModalOpen) return;
    if (isFading) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      requestSwitch(activeIndex + 1);
    }, AUTO_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [total, activeIndex, isModalOpen, isFading, requestSwitch]);

  const openModal = () => {
    setIsModalClosing(false);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    if (!isModalOpen || isModalClosing) return;
    setIsModalClosing(true);

    window.setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, MODAL_ANIMATION_MS);
  }, [isModalOpen, isModalClosing]);

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") requestSwitch(activeIndex - 1);
      if (e.key === "ArrowRight") requestSwitch(activeIndex + 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, activeIndex, requestSwitch, closeModal]);

  if (!total || !active) return null;

  const renderCarouselStage = (slide) => (
    <div className="cartopia-carousel-stage cartopia-carousel-stage--single">
      <button
        type="button"
        className="cartopia-carousel-card"
        onClick={openModal}
        aria-label="Open image"
      >
        <img
          src={slide.urls[0]}
          alt={`${title} screenshot`}
          className="cartopia-carousel-img"
          draggable="false"
          decoding="async"
        />
      </button>
    </div>
  );

  const renderModalStage = (slide) => (
    <div className="media-modal-stage media-modal-stage--single">
      <img
        src={slide.urls[0]}
        alt={`${title} screenshot`}
        className="media-modal-img"
        draggable="false"
        decoding="async"
      />
    </div>
  );

  const renderLayer = (slotId, slide) => {
    const isFront = slotId === frontSlot;
    const opacity = isFading ? (isFront ? 0 : 1) : isFront ? 1 : 0;

    return (
      <div
        className={
          "xfade-layer " + (isFront ? "xfade-layer--front" : "xfade-layer--back")
        }
        style={{
          opacity,
          pointerEvents: isFront ? "auto" : "none",
        }}
        aria-hidden={!isFront}
      >
        {renderCarouselStage(slide)}
      </div>
    );
  };

  const slideA = slides[slotIndices[0]];
  const slideB = slides[slotIndices[1]];

  return (
    <>
      <div className="cartopia-carousel" aria-label={`${title} gallery`}>
        <div className="cartopia-carousel-xfade">
          {renderLayer(0, slideA)}
          {renderLayer(1, slideB)}
        </div>

        <div className="cartopia-carousel-dots" aria-label="Carousel pagination">
          {slides.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                className={
                  "cartopia-carousel-dot-btn" +
                  (isActive ? " cartopia-carousel-dot-btn--active" : "")
                }
                onClick={() => requestSwitch(i)}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span
                  className={
                    "cartopia-carousel-dot" +
                    (isActive ? " cartopia-carousel-dot--active" : "")
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={
              "media-modal-backdrop" +
              (isModalClosing ? " media-modal-backdrop--closing" : "")
            }
            onClick={closeModal}
          >
            <div
              className={
                "media-modal" + (isModalClosing ? " media-modal--closing" : "")
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="media-modal-header">
                <div className="media-modal-title">{title}</div>

                <button
                  type="button"
                  className="certificate-modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="media-modal-content">
                {slides[activeIndex]?.caption ? (
                  <div className="media-modal-caption">
                    {slides[activeIndex].caption}
                  </div>
                ) : null}

                <div className="media-modal-stage-xfade media-modal-stage-xfade--fixed">
                  <div
                    className={
                      "xfade-layer " +
                      (frontSlot === 0 ? "xfade-layer--front" : "xfade-layer--back")
                    }
                    style={{
                      opacity: isFading
                        ? frontSlot === 0
                          ? 0
                          : 1
                        : frontSlot === 0
                        ? 1
                        : 0,
                      pointerEvents: "none",
                    }}
                    aria-hidden={frontSlot !== 0}
                  >
                    {renderModalStage(slideA)}
                  </div>

                  <div
                    className={
                      "xfade-layer " +
                      (frontSlot === 1 ? "xfade-layer--front" : "xfade-layer--back")
                    }
                    style={{
                      opacity: isFading
                        ? frontSlot === 1
                          ? 0
                          : 1
                        : frontSlot === 1
                        ? 1
                        : 0,
                      pointerEvents: "none",
                    }}
                    aria-hidden={frontSlot !== 1}
                  >
                    {renderModalStage(slideB)}
                  </div>
                </div>

                <div className="media-modal-nav">
                  <div className="media-modal-nav-buttons">
                    <button
                      type="button"
                      className="media-modal-nav-btn"
                      onClick={() => requestSwitch(activeIndex - 1)}
                      aria-label="Previous"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="media-modal-nav-btn"
                      onClick={() => requestSwitch(activeIndex + 1)}
                      aria-label="Next"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function RaasCarousel() {
  return (
    <UniversalSingleCarousel
      slides={RAAS_SLIDES}
      title="Russian Automotive Assistance System"
    />
  );
}


function CertificatesPage({ onBack }) {
  const [activeOrgId, setActiveOrgId] = useState("certificates-intro-root");
  const [activeCert, setActiveCert] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const MODAL_ANIMATION_MS = 260; 

  const PAGE_FLIP_MS = 420;
  const [pageFlipDirection, setPageFlipDirection] = useState(null); 
  const [pageFlipTargetIndex, setPageFlipTargetIndex] = useState(null);
  const pageFlipRef = useRef(false);

  const [activeFilters, setActiveFilters] = useState([]);

  const INITIAL_ORG_BLOCKS = 2;
  const [visibleOrgLimit, setVisibleOrgLimit] = useState(INITIAL_ORG_BLOCKS);

  const scrollLockRef = useRef(false);
  const scrollLockTimeoutRef = useRef(null);

  const isOrgVisible = useCallback(
    (orgId) => activeFilters.length === 0 || activeFilters.includes(orgId),
    [activeFilters]
  );

  const toggleFilter = (orgId) => {
    setActiveFilters((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId]
    );
  };

  const resetFilters = () => {
    setActiveFilters([]);
  };

  const visibleCertCount = useMemo(() => {
    return CERT_ORGANIZATIONS.filter((org) => isOrgVisible(org.id)).reduce(
      (sum, org) => sum + org.certificates.length,
      0
    );
  }, [isOrgVisible]);

  const certificateDotsSections = useMemo(
    () => [
      { id: "certificates-intro-root", label: "Certificates" },
      ...CERT_ORGANIZATIONS.filter((org) => isOrgVisible(org.id)).map(
        (org) => ({
          id: org.id,
          label: org.name,
        })
      ),
    ],
    [isOrgVisible]
  );

  useEffect(() => {
    if (activeFilters.length > 0) {
      setVisibleOrgLimit(CERT_ORGANIZATIONS.length);
      return;
    }

    setVisibleOrgLimit(INITIAL_ORG_BLOCKS);

    const timeout = setTimeout(() => {
      setVisibleOrgLimit(CERT_ORGANIZATIONS.length);
    }, 120);

    return () => clearTimeout(timeout);
  }, [activeFilters, INITIAL_ORG_BLOCKS]);

  useEffect(() => {
    function recomputeActiveFromScroll() {
      const ids = [
        "certificates-intro-root",
        ...CERT_ORGANIZATIONS.filter((org) => isOrgVisible(org.id)).map(
          (org) => org.id
        ),
      ];

      if (!ids.length) return;

      const PADDING_FROM_TOP = 80;

      let bestId = ids[0];
      let bestDistance = Infinity;

      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - PADDING_FROM_TOP);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = id;
        }
      });

      setActiveOrgId(bestId);
    }

    function handleScroll() {
      if (scrollLockRef.current) return;
      recomputeActiveFromScroll();
    }

    recomputeActiveFromScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", recomputeActiveFromScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", recomputeActiveFromScroll);
    };
  }, [isOrgVisible]);

  useEffect(() => {
    function unlockScrollSpy() {
      scrollLockRef.current = false;
    }

    window.addEventListener("wheel", unlockScrollSpy, { passive: true });
    window.addEventListener("touchmove", unlockScrollSpy, { passive: true });

    return () => {
      window.removeEventListener("wheel", unlockScrollSpy);
      window.removeEventListener("touchmove", unlockScrollSpy);
    };
  }, []);

  const handleCardMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const EDGE_PX = 20;

    const rawX = (event.clientX - rect.left) / rect.width;
    const rawY = (event.clientY - rect.top) / rect.height;

    const edgeX = Math.min(EDGE_PX / rect.width, 0.5);
    const edgeY = Math.min(EDGE_PX / rect.height, 0.5);

    const remap = (value, edge) => {
      if (value <= edge) return 0;
      if (value >= 1 - edge) return 1;
      return (value - edge) / (1 - 2 * edge);
    };

    const x = remap(rawX, edgeX);
    const y = remap(rawY, edgeY);

    const tiltX = (0.5 - y) * 12;
    const tiltY = (x - 0.5) * 12;

    const baseAngle = 135;
    const angleDelta = (x - 0.5) * 60 + (y - 0.5) * 40;

    const angleOuter = baseAngle + angleDelta;
    const angleInner = baseAngle + angleDelta * 0.85;

    card.style.setProperty("--tilt-x", `${tiltX}deg`);
    card.style.setProperty("--tilt-y", `${tiltY}deg`);
    card.style.setProperty("--gold-angle", `${angleOuter}deg`);
    card.style.setProperty("--gold-angle-inner", `${angleInner}deg`);
  };

  const handleCardMouseLeave = (event) => {
    const card = event.currentTarget;
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
    card.style.removeProperty("--gold-angle");
    card.style.removeProperty("--press-offset");
  };

  const handleCardMouseDown = (event) => {
    const card = event.currentTarget;
    card.style.setProperty("--press-offset", "1px");
  };

  const handleCardMouseUp = (event) => {
    const card = event.currentTarget;
    card.style.setProperty("--press-offset", "0px");
  };

  const scrollToOrg = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const rect = el.getBoundingClientRect();
    const blockHeight = rect.height;

    const PADDING = 24;
    const fitsIntoViewport = blockHeight + PADDING <= viewportHeight;

    scrollLockRef.current = true;
    if (scrollLockTimeoutRef.current) {
      clearTimeout(scrollLockTimeoutRef.current);
    }
    scrollLockTimeoutRef.current = setTimeout(() => {
      scrollLockRef.current = false;
    }, 800);

    el.scrollIntoView({
      behavior: "smooth",
      block: fitsIntoViewport ? "center" : "start",
    });

    setActiveOrgId(id);
  };

  const closeModal = useCallback(() => {
    if (!activeCert || isModalClosing) return;
    setIsModalClosing(true);

    window.setTimeout(() => {
      setActiveCert(null);
      setIsModalClosing(false);
    }, MODAL_ANIMATION_MS);
  }, [activeCert, isModalClosing, MODAL_ANIMATION_MS]);

  const handlePageFlip = useCallback(
    (direction) => {
      if (!activeCert || pageFlipRef.current) return;

      const total = activeCert.images.length;
      if (total <= 1) return;

      const currentIndex = activeCert.index;
      const targetIndex =
        direction === "next"
          ? (currentIndex + 1) % total
          : (currentIndex - 1 + total) % total;

      pageFlipRef.current = true;
      setPageFlipDirection(direction);
      setPageFlipTargetIndex(targetIndex);

      window.setTimeout(() => {
        setActiveCert((prev) => (prev ? { ...prev, index: targetIndex } : prev));
        pageFlipRef.current = false;
        setPageFlipDirection(null);
        setPageFlipTargetIndex(null);
      }, PAGE_FLIP_MS);
    },
    [activeCert, PAGE_FLIP_MS]
  );

  useEffect(() => {
    if (!activeCert) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activeCert]);

  useEffect(() => {
    if (!activeCert) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") handlePageFlip("prev");
      if (e.key === "ArrowRight") handlePageFlip("next");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCert, closeModal, handlePageFlip]);


  let modalCurrentIndex = 0;
  let modalBaseIndex = 0;

  if (activeCert) {
    modalCurrentIndex = activeCert.index;

    modalBaseIndex =
      pageFlipDirection && pageFlipTargetIndex != null
        ? pageFlipTargetIndex
        : modalCurrentIndex;
  }


  return (
    <>
      <main className="certificates-page page-fade">
        <section
          id="certificates-intro-root"
          className="section-card certificates-intro"
        >
          <div className="certificates-intro-header">
            <h2>Certificates</h2>
            <div className="certificates-intro-header-right">
              <span className="certificates-total">
                {formatCertificateCount(visibleCertCount)}
              </span>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  className="cert-reset-button"
                  onClick={resetFilters}
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
          <p className="muted">
            Certificates are grouped automatically by organization and course name. 
            Use the filters below to focus on a specific provider.
          </p>

          <div className="certificates-filter-bar">
            {CERT_ORGANIZATIONS.map((org) => {
              const isActive = activeFilters.includes(org.id);

              return (
                <button
                  key={org.id}
                  type="button"
                  className={
                    "header-link cert-filter-button " +
                    (isActive
                      ? "header-link--active"
                      : "cert-filter-button--inactive")
                  }
                  onClick={() => toggleFilter(org.id)}
                >
                  {org.name}
                </button>
              );
            })}
          </div>
        </section>

        <div className="certificates-org-list">
          {CERT_ORGANIZATIONS.map((org, index) => {
            const visible = isOrgVisible(org.id);
            const isLoaded = index < visibleOrgLimit;

            return (
              <section
                key={org.id}
                id={org.id}
                className={
                  "certificate-org-block" +
                  (visible ? "" : " certificate-org-block--hidden")
                }
              >
                <header className="certificate-org-header">
                  <h3>{org.name}</h3>
                  <span className="certificate-org-count">
                    {formatCertificateCount(org.certificates.length)}
                  </span>
                </header>

                {isLoaded && visible && (
                  <div className="certificate-grid">
                    {org.certificates.map((cert) => (
                      <button
                        key={cert.id}
                        type="button"
                        className="certificate-card"
                        onClick={() => {
                          setIsModalClosing(false);
                          setActiveCert({
                            orgName: org.name,
                            title: cert.title,
                            images: cert.images,
                            index: 0,
                          });
                        }}
                        onMouseMove={handleCardMouseMove}
                        onMouseLeave={handleCardMouseLeave}
                        onMouseDown={handleCardMouseDown}
                        onMouseUp={handleCardMouseUp}
                      >
                        <div className="certificate-frame">
                          <div className="certificate-frame-inner">
                            <img
                              src={cert.images[0]}
                              alt={cert.title}
                              className="certificate-image"
                            />
                          </div>
                        </div>
                        <div className="certificate-caption">
                          <div className="certificate-caption-title">
                            {cert.title}
                          </div>
                          <div className="certificate-caption-meta">
                            {org.name}
                          </div>
                          {cert.images.length > 1 && (
                            <div className="certificate-caption-meta">
                              {cert.images.length} pages
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <button className="primary-button" type="button" onClick={onBack}>
          <span>Back to main page</span>
        </button>
      </main>

      {certificateDotsSections.length > 0 && (
        <SectionDots
          sections={certificateDotsSections}
          activeSectionId={activeOrgId}
          onDotClick={scrollToOrg}
        />
      )}

      {activeCert && (
        <div
          className={
            "certificate-modal-backdrop" +
            (isModalClosing ? " certificate-modal-backdrop--closing" : "")
          }
          onClick={closeModal}
        >
          <div
            className={
              "certificate-modal" +
              (isModalClosing ? " certificate-modal--closing" : "")
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="certificate-modal-header">
              <div>
                <div className="certificate-modal-title">
                  {activeCert.title}
                </div>
                <div className="certificate-modal-meta">
                  {activeCert.orgName}
                </div>
              </div>
              <button
                type="button"
                className="certificate-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="certificate-modal-content">
              <div className="certificate-modal-flip">
                <div className="certificate-frame certificate-frame--modal certificate-frame--base">
                  <div className="certificate-frame-inner">
                    <img
                      src={activeCert.images[modalBaseIndex]}
                      alt={activeCert.title}
                      className="certificate-image certificate-image--modal"
                    />
                  </div>
                </div>

                <div
                  className={
                    "certificate-frame certificate-frame--modal certificate-frame--top" +
                    (pageFlipDirection === "next"
                      ? " certificate-frame--flip-next"
                      : "") +
                    (pageFlipDirection === "prev"
                      ? " certificate-frame--flip-prev"
                      : "")
                  }
                >
                  <div className="certificate-frame-inner">
                    <img
                      src={activeCert.images[modalCurrentIndex]}
                      alt={activeCert.title}
                      className="certificate-image certificate-image--modal"
                    />
                  </div>
                </div>
              </div>

              {activeCert.images.length > 1 && (
                <div className="certificate-modal-nav">
                  <div className="certificate-modal-counter">
                    Page {modalCurrentIndex + 1} из{" "}
                    {activeCert.images.length}
                  </div>
                  <div className="certificate-modal-nav-buttons">
                    <button
                      type="button"
                      className="header-link certificate-modal-nav-btn"
                      onClick={() => handlePageFlip("prev")}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="header-link certificate-modal-nav-btn"
                      onClick={() => handlePageFlip("next")}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;