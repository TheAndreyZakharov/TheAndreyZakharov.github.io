import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import projects, { projectRepositories } from "./projects.js";
import researchPublications from "./publications.js";
import en from "./locales/en.js";
import ru from "./locales/ru.js";
import { headMarkup, pathFor, routeFromPath } from "./seo.js";

const emailAddress = "Andrey.Zakharov.Contact@gmail.com";
const mobileRenderingQuery = "(max-width: 680px), (hover: none) and (pointer: coarse)";

function resumePreviewSource(file) {
  return file.replace("/resumes/", "/resume-previews/").replace(/\.pdf$/i, ".webp");
}

function resumePreviewFallbackSource(file) {
  return file.replace("/resumes/", "/resume-previews/").replace(/\.pdf$/i, ".png");
}

const links = [
  { name: "GitHub", handle: "TheAndreyZakharov", url: "https://github.com/TheAndreyZakharov", icon: "/icons/icons8-github-96.png", primary: true },
  { name: "Telegram", handle: "TheAndreyZakharov", url: "https://t.me/TheAndreyZakharov", icon: "/icons/icons8-telegram-96.png", primary: true },
  { name: "LinkedIn", handle: "TheAndreyZakharov", url: "https://www.linkedin.com/in/TheAndreyZakharov", icon: "/icons/icons8-linkedin-96.png", primary: true },
  { name: "ORCID", handle: "0009-0005-4280-8352", url: "https://orcid.org/0009-0005-4280-8352", icon: "/icons/orcid.svg" },
  { name: "Hugging Face", handle: "TheAndreyZakharov", url: "https://huggingface.co/TheAndreyZakharov", icon: "/icons/icons8-hf-96.png" },
  { name: "GitLab", handle: "TheAndreyZakharov", url: "https://gitlab.com/TheAndreyZakharov", icon: "/icons/gitlab_logo.svg" },
  { name: "Telegram Channel", handle: "@The_Andrey_Zakharov", url: "https://t.me/The_Andrey_Zakharov", icon: "/icons/icons8-telegram-96.png" },
  { name: "Twitch", handle: "TheAndreyZakharov", url: "https://www.twitch.tv/TheAndreyZakharov", icon: "/icons/icons8-twitch-96.png" },
  { name: "YouTube", handle: "TheAndreyZakharov", url: "https://www.youtube.com/@TheAndreyZakharov", icon: "/icons/icons8-youtube-96.png" },
  { name: "Discord", handle: "TheAndreyZakharov", url: "https://discord.gg/CVtA4QDPXN", icon: "/icons/icons8-discord-96.png" },
  { name: "Kick", handle: "TheAndreyZakharov", url: "https://kick.com/theandreyzakharov", icon: "/icons/kick.png" },
  { name: "Facebook", handle: "TheAndreyZakharov", url: "https://www.facebook.com/TheAndreyZakharov", icon: "/icons/icons8-facebook-96.png" },
  { name: "Instagram", handle: "the_andrey_zakharov", url: "https://www.instagram.com/the_andrey_zakharov", icon: "/icons/icons8-instagram-96.png" },
  { name: "X", handle: "iAndreyZakharov", url: "https://x.com/iAndreyZakharov", icon: "/icons/icons8-x-96.png" },
  { name: "Bluesky", handle: "theandreyzakharov.bsky.social", url: "https://main.bsky.dev/profile/theandreyzakharov.bsky.social", icon: "/icons/icons8-bluesky-96.png" },
  { name: "Reddit", handle: "TheAndreyZakharov", url: "https://www.reddit.com/user/TheAndreyZakharov", icon: "/icons/icons8-reddit-96.png" },
  { name: "Pinterest", handle: "The_Andrey_Zakharov", url: "https://ru.pinterest.com/The_Andrey_Zakharov", icon: "/icons/icons8-pinterest-96.png" },
  { name: "Spotify", handle: { en: "My profile", ru: "Мой профиль" }, url: "https://open.spotify.com/user/31xnbwxotc2ixa65z42u5obuwwxi", icon: "/icons/icons8-spotify-96.png" },
  { name: { en: "VK Page", ru: "ВК страница" }, handle: "TheAndreyZakharov", url: "https://vk.com/TheAndreyZakharov", icon: "/icons/icons8-vk-96.png" },
  { name: { en: "VK Community", ru: "ВК сообщество" }, handle: "The_Andrey_Zakharov", url: "https://vk.ru/The_Andrey_Zakharov", icon: "/icons/icons8-vk-96.png" },
  { name: { en: "VK Video", ru: "VK Видео" }, handle: "The_Andrey_Zakharov", url: "https://vkvideo.ru/@the_andrey_zakharov", icon: "/icons/vk-video.png" },
  { name: { en: "VK Live", ru: "VK Live" }, handle: "TheAndreyZakharov", url: "https://live.vkvideo.ru/theandreyzakharov", icon: "/icons/vk-live.png" },
  { name: "RUTUBE", handle: "TheAndreyZakharov", url: "https://rutube.ru/channel/81932176/", icon: "/icons/rutube_logo.png" },
  { name: "LeetCode", handle: "TheAndreyZakharov", url: "https://leetcode.com/u/TheAndreyZakharov", icon: "/icons/icons8-leetcode-96.png" },
  { name: "Chess", handle: "TheAndreyZakharov", url: "https://www.chess.com/member/TheAndreyZakharov", icon: "/icons/icons8-chess-96.png" },
  { name: "Boosty", handle: "TheAndreyZakharov", url: "https://boosty.to/theandreyzakharov", icon: "/icons/boosty_logo.png" },
  { name: "DonationAlerts", handle: "TheAndreyZakharov", url: "https://www.donationalerts.com/r/theandreyzakharov", icon: "/icons/DonationAlerts.png" },
  { name: "DonateX", handle: "TheAndreyZakharov", url: "https://donatex.gg/donate/theandreyzakharov", icon: "/icons/DonateX.svg" },
  { name: "DonatePay", handle: "TheAndreyZakharov", url: "https://new.donatepay.ru/@TheAndreyZakharov", icon: "/icons/DontePay.png" },
];

const contactLinks = [
  { name: "Email", handle: emailAddress, url: `mailto:${emailAddress}`, icon: "/icons/icons8-mail-96.png" },
  ...links.filter((link) => link.primary),
];

const resumes = [
  { key: "full", title: "Full-Stack Software Engineer", file: "/resumes/Andrey_Zakharov_Full-Stack_Software_Engineer.pdf", downloadName: "Andrey_Zakharov_Full-Stack_Software_Engineer.pdf" },
  { key: "backend", title: "Backend Developer", file: "/resumes/Andrey_Zakharov_Backend_Developer.pdf", downloadName: "Andrey_Zakharov_Backend_Developer.pdf" },
  { key: "python-backend", title: "Python Backend Developer", file: "/resumes/Andrey_Zakharov_Python_Backend_Developer.pdf", downloadName: "Andrey_Zakharov_Python_Backend_Developer.pdf" },
  { key: "ml", title: "ML Engineer", file: "/resumes/Andrey_Zakharov_ML_Engineer.pdf", downloadName: "Andrey_Zakharov_ML_Engineer.pdf" },
  { key: "ai", title: "AI Developer", file: "/resumes/Andrey_Zakharov_AI_Developer.pdf", downloadName: "Andrey_Zakharov_AI_Developer.pdf" },
  { key: "geo", title: "Geospatial Software Engineer", file: "/resumes/Andrey_Zakharov_Geospatial_Software_Engineer.pdf", downloadName: "Andrey_Zakharov_Geospatial_Software_Engineer.pdf" },
];

const educationHistory = [
  {
    year: "2031",
    emphasis: "primary",
    progress: "future",
    status: { en: "Planned defense", ru: "Планируемая защита" },
    title: { en: "PhD", ru: "Аспирантура" },
    detail: {
      en: "Technical Sciences · Systems Analysis, Control and Information Processing",
      ru: "Кандидат технических наук · Системный анализ, управление и обработка информации",
    },
    institution: { en: "Saint Petersburg State University of Industrial Technologies and Design (SPbSUITD)", ru: "Санкт-Петербургский государственный университет промышленных технологий и дизайна (СПбГУПТД)" },
  },
  {
    year: "2027",
    emphasis: "primary",
    progress: "future",
    status: { en: "In progress", ru: "В процессе" },
    title: { en: "Master’s Degree", ru: "Магистратура" },
    detail: {
      en: "Management · Strategic Human Resource Management",
      ru: "Менеджмент · Стратегическое управление человеческими ресурсами",
    },
    institution: { en: "Saint Petersburg State University of Aerospace Instrumentation (SUAI)", ru: "Санкт-Петербургский государственный университет аэрокосмического приборостроения (ГУАП)" },
  },
  {
    year: "2026",
    progress: "in-progress",
    progressEndpoint: true,
    status: { en: "In progress", ru: "В процессе" },
    title: { en: "Professional Development", ru: "Повышение квалификации" },
    detail: {
      en: "Digital Industry Technologies",
      ru: "Технологии цифровой промышленности",
    },
    institution: { en: "Peter the Great Saint Petersburg Polytechnic University (SPbPU)", ru: "Санкт-Петербургский политехнический университет Петра Великого (СПбПУ)" },
  },
  {
    year: "2025",
    emphasis: "primary",
    progress: "complete",
    title: { en: "Bachelor’s Degree", ru: "Бакалавриат" },
    detail: {
      en: "Software Engineering · Software Systems Design",
      ru: "Программная инженерия · Проектирование программных систем",
    },
    institution: { en: "Saint Petersburg State University of Aerospace Instrumentation (SUAI)", ru: "Санкт-Петербургский государственный университет аэрокосмического приборостроения (ГУАП)" },
  },
  {
    year: "2024",
    progress: "complete",
    title: { en: "Professional Retraining", ru: "Профессиональная переподготовка" },
    detail: {
      en: "Fundamentals of Frontend Development · Web and Multimedia Applications Developer",
      ru: "Основы фронтенд-разработки · Разработчик веб- и мультимедийных приложений",
    },
    institution: { en: "Saint Petersburg State University of Aerospace Instrumentation (SUAI)", ru: "Санкт-Петербургский государственный университет аэрокосмического приборостроения (ГУАП)" },
  },
];

const copy = { en, ru };
let certificatesViewPromise;
function loadCertificatesView() {
  certificatesViewPromise ??= import("./CertificatesView.jsx")
    .then((module) => module.default)
    .catch((error) => { certificatesViewPromise = null; throw error; });
  return certificatesViewPromise;
}

let projectDetailsPromise;
function loadProjectDetails() {
  projectDetailsPromise ??= import("./projectDetails.js")
    .then((module) => module.default)
    .catch((error) => { projectDetailsPromise = null; throw error; });
  return projectDetailsPromise;
}



function GraduationCapIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2.5 9.5 9.5-4 9.5 4-9.5 4-9.5-4Z" /><path d="M6 11.2v4.1c2.9 2.1 9.1 2.1 12 0v-4.1" /><path d="M21.5 10v5" /></svg>;
}

function ResearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" /></svg>;
}

function ResumeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l3 3v14H7z" /><path d="M14 3.5v3h3M9.5 11h5M9.5 14h5M9.5 17h3" /></svg>;
}

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5h15v10h-9l-4.5 3v-3H4.5z" /><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" /></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>;
}

function LanguageText({ children }) {
  return <span className="language-text">{children}</span>;
}

function handleInternalLink(event, action) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  action();
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function AmbientLayer({ variant }) {
  const isMobile = useMediaQuery(mobileRenderingQuery);
  const [geometry, setGeometry] = useState(null);

  useLayoutEffect(() => {
    if (isMobile) return undefined;
    const card = document.querySelector(".profile-card");
    if (!card) return undefined;

    let frameId = null;
    const updateGeometry = () => {
      const bounds = card.getBoundingClientRect();
      const top = Math.max(0, bounds.top);
      const bottom = Math.min(window.innerHeight, bounds.bottom);
      const nextGeometry = {
        top,
        left: bounds.left,
        width: bounds.width,
        height: Math.max(1, bottom - top),
      };
      setGeometry((current) => (
        current
        && current.top === nextGeometry.top
        && current.left === nextGeometry.left
        && current.width === nextGeometry.width
        && current.height === nextGeometry.height
          ? current
          : nextGeometry
      ));
    };
    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateGeometry();
      });
    };

    updateGeometry();
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(scheduleUpdate) : null;
    observer?.observe(card);
    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [isMobile]);

  if (isMobile || !geometry) return null;
  return (
    <div className={`ambient-layer ambient-layer--${variant}`} style={geometry} aria-hidden="true">
      <div className="ambient-glow ambient-glow--one" />
      <div className="ambient-glow ambient-glow--two" />
    </div>
  );
}

function SocialCard({ link, language, style }) {
  const name = typeof link.name === "string" ? link.name : link.name?.[language];
  const handle = typeof link.handle === "string" ? link.handle : link.handle?.[language];
  return (
    <a className="social-link social-link--icon" href={link.url} target={link.url.startsWith("mailto:") ? undefined : "_blank"} rel={link.url.startsWith("mailto:") ? undefined : "noreferrer"} style={style}>
      <span className="social-link__content">
        <span className="social-link__icon"><img className={link.icon === "/icons/vk-video.png" || link.icon === "/icons/vk-live.png" || link.icon === "/icons/kick.png" ? "social-link__icon-image--compact" : undefined} src={link.icon} alt="" /></span>
        <span className="social-link__name"><LanguageText>{name}</LanguageText></span>
        <span className="social-link__handle"><LanguageText>{handle}</LanguageText></span>
      </span>
    </a>
  );
}

function SocialsView({ theme, text, language }) {
  const [showOtherLinks, setShowOtherLinks] = useState(false);
  const [disclosureMotion, setDisclosureMotion] = useState("");
  const [socialColumns, setSocialColumns] = useState(4);
  const otherLinks = links.filter((link) => !link.primary);
  const otherRows = Math.ceil(otherLinks.length / socialColumns);

  useEffect(() => {
    const updateColumns = () => setSocialColumns(window.innerWidth <= 680 ? 3 : 4);
    window.addEventListener("resize", updateColumns, { passive: true });
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const otherCardStyle = (index) => {
    const row = Math.floor(index / socialColumns);
    return {
      "--social-reveal-delay-open": `${0.04 + row * 0.07}s`,
      "--social-reveal-delay-close": `${Math.max(0, otherRows - row - 1) * 0.04}s`,
    };
  };

  const toggleOtherLinks = () => {
    setShowOtherLinks((isOpen) => {
      const nextIsOpen = !isOpen;
      setDisclosureMotion(nextIsOpen ? "disclosure-icon--opening" : "disclosure-icon--closing");
      return nextIsOpen;
    });
  };

  return (
    <main className="page-shell" data-theme={theme}>
      <AmbientLayer variant="socials" />
      <section className="profile-card socials-page">
        <header className="socials-page-header"><h1><LanguageText>{text.socialsPageTitle}</LanguageText></h1></header>

        <section className="social-section" aria-labelledby="main-contacts-title">
          <div className="section-divider"><span id="main-contacts-title"><LanguageText>{text.mainContacts}</LanguageText></span></div>
          <nav className="social-links social-card-grid" aria-label={text.mainContacts}>
            {contactLinks.map((link) => <SocialCard key={link.name} language={language} link={link.name === "Email" ? { ...link, name: text.email } : link} />)}
          </nav>
        </section>

        <section className={`other-section ${showOtherLinks ? "other-section--open" : ""}`} aria-labelledby="other-links-title">
          <div className="other-toggle">
            <div className="other-toggle__control" onClick={toggleOtherLinks}>
              <button className="other-toggle__label" id="other-links-title" type="button" aria-expanded={showOtherLinks} aria-controls="other-links-panel"><LanguageText>{text.otherAccounts}</LanguageText></button>
              <button className="disclosure-button" type="button" aria-expanded={showOtherLinks} aria-controls="other-links-panel" aria-label={text.otherAccounts}>
                <span className={`disclosure-icon ${disclosureMotion}`} aria-hidden="true"><ChevronIcon /></span>
              </button>
            </div>
          </div>
          <div className="other-links-panel" id="other-links-panel"><div className="other-links-panel__inner"><p className="other-links-panel__intro"><LanguageText>{text.otherAccountsIntro}</LanguageText><br /><span className="other-links-panel__note"><LanguageText>{text.otherAccountsNote}</LanguageText></span></p><nav className="social-links social-card-grid" aria-label={text.otherAccounts}>{otherLinks.map((link, index) => <SocialCard key={link.url} language={language} link={link} style={otherCardStyle(index)} />)}</nav></div></div>
        </section>
      </section>
    </main>
  );
}

function ResumeViewer({ resume, theme, text, onClose, onStartClose }) {
  const [closing, setClosing] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const closeTimer = useRef(null);

  const close = useCallback(() => {
    if (closing) return;
    onStartClose();
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, 300);
  }, [closing, onClose, onStartClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    setPreviewLoaded(false);
  }, [resume.file]);

  return (
    <div className={`certificate-viewer ${closing ? "certificate-viewer--closing" : ""}`} data-theme={theme} role="dialog" aria-modal="true" aria-label={resume.title}>
      <button className="certificate-viewer__backdrop" type="button" onClick={close} aria-label={text.close} />
      <div className="certificate-viewer__panel resume-viewer__panel">
        <div className="certificate-viewer__header">
          <div><strong>{resume.title}</strong><small><LanguageText>{text.resumeViewerAuthor}</LanguageText></small></div>
          <div className="resume-viewer__actions">
            <a href={resume.file} download={resume.downloadName}><LanguageText>{text.download}</LanguageText></a>
            <button type="button" onClick={close}><LanguageText>{text.close}</LanguageText></button>
          </div>
        </div>
        <div className="resume-viewer__document">
          <img className={`resume-viewer__preview ${previewLoaded ? "resume-viewer__preview--loaded" : ""}`} onLoad={() => setPreviewLoaded(true)} onError={(event) => {
            if (event.currentTarget.src.endsWith(".webp")) event.currentTarget.src = resumePreviewFallbackSource(resume.file);
            else setPreviewLoaded(true);
          }} src={resumePreviewSource(resume.file)} alt={`${resume.title}, ${text.resumeViewerAuthor}`} />
        </div>
        <div className="certificate-viewer__footer"><span>{resume.title}</span><span>PDF</span></div>
      </div>
    </div>
  );
}

function SiteHeader({ language, theme, themeMode, setThemeMode, changeLanguage, view, projectId, publicationId, text, onNavigate }) {
  const activeView = view;
  const navigation = [
    ["socials", text.socialsPageTitle, language === "ru" ? "Соцсети" : "Socials"],
    ["projects", text.projectsTitle, language === "ru" ? "Проекты" : "Projects"],
    ["resumes", text.resumeTitle],
    ["education", text.education],
    ["certificates", text.certificatesNav, language === "ru" ? "Сертификаты" : "Certificates"],
    ["publications", text.publicationsTitle],
    ["patents", text.patentsTitle],
  ];
  const givenName = language === "ru" ? "Андрей" : "Andrey";
  const surname = language === "ru" ? "Захаров" : "Zakharov";
  const detailId = view === "projects" ? projectId : view === "publications" ? publicationId : null;

  return (
    <header className="site-header" data-theme={theme}>
      <div className="site-header__inner">
        <a className={`site-brand ${activeView === "home" ? "site-brand--active" : ""}`} href={pathFor("home", language)} onClick={(event) => handleInternalLink(event, () => onNavigate("home"))} aria-label={language === "ru" ? "На главную — Андрей Захаров" : "Home — Andrey Zakharov"} aria-current={activeView === "home" ? "page" : undefined}>
          <span className="site-brand__logo" aria-hidden="true">
            <img className="site-brand__logo-light" src="/logo.png" alt="" />
            <img className="site-brand__logo-dark" src="/logo_d.png" alt="" />
          </span>
          <span className="site-brand__name"><LanguageText>{givenName}</LanguageText><LanguageText>{surname}</LanguageText></span>
        </a>

        <nav className="site-nav" aria-label={language === "ru" ? "Основная навигация" : "Main navigation"}>
          {navigation.map(([key, label, compactLabel]) => (
            <a className={`site-nav__link ${activeView === key ? "site-nav__link--active" : ""}`} href={pathFor(key, language)} key={key} onPointerEnter={key === "certificates" ? () => { loadCertificatesView().catch(() => {}); } : undefined} onFocus={key === "certificates" ? () => { loadCertificatesView().catch(() => {}); } : undefined} onClick={(event) => handleInternalLink(event, () => onNavigate(key))} aria-current={activeView === key ? "page" : undefined}>
              {compactLabel ? <><span className="site-nav__label-full"><LanguageText>{label}</LanguageText></span><span className="site-nav__label-compact"><LanguageText>{compactLabel}</LanguageText></span></> : <LanguageText>{label}</LanguageText>}
            </a>
          ))}
        </nav>

        <div className="site-header__controls">
          <div className={`control-group control-group--language control-group--${language}`} aria-label={text.language}>
            <span className="control-group__indicator" aria-hidden="true" />
            <a className={language === "en" ? "control-button control-button--active" : "control-button"} href={pathFor(view, "en", detailId)} lang="en" onClick={(event) => handleInternalLink(event, () => changeLanguage("en"))}><LanguageText>EN</LanguageText></a>
            <a className={language === "ru" ? "control-button control-button--active" : "control-button"} href={pathFor(view, "ru", detailId)} lang="ru" onClick={(event) => handleInternalLink(event, () => changeLanguage("ru"))}><LanguageText>RU</LanguageText></a>
          </div>
          <div className={`control-group control-group--theme control-group--${themeMode}`} aria-label={text.theme}>
            <span className="control-group__indicator" aria-hidden="true" />
            <button className={themeMode === "light" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("light")} title={text.light} aria-label={text.light}>☼</button>
            <button className={themeMode === "dark" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("dark")} title={text.dark} aria-label={text.dark}>☾</button>
            <button className={themeMode === "system" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("system")} title={text.system} aria-label={text.system}>◐</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function App({ initialView, initialLanguage, initialProjectId, initialPublicationId, initialCertificatesView = null, initialProjectDetails = null } = {}) {
  const [language, setLanguage] = useState(() => initialLanguage ?? (typeof window === "undefined" ? "en" : routeFromPath(window.location.pathname).language));
  const [languageTransitioning, setLanguageTransitioning] = useState(false);
  const languageTransitionTimer = useRef(null);
  const navigationRequest = useRef(0);
  const educationTimelineRef = useRef(null);
  const [view, setView] = useState(() => initialView ?? (typeof window === "undefined" ? "home" : routeFromPath(window.location.pathname).view));
  const [projectId, setProjectId] = useState(() => initialProjectId ?? (typeof window === "undefined" ? null : routeFromPath(window.location.pathname).projectId));
  const [publicationId, setPublicationId] = useState(() => initialPublicationId ?? (typeof window === "undefined" ? null : routeFromPath(window.location.pathname).publicationId));
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(() => projectId ? { [projectId]: true } : {});
  const [projectDetailsMounted, setProjectDetailsMounted] = useState(() => projectId ? { [projectId]: true } : {});
  const [projectDetailsMotion, setProjectDetailsMotion] = useState({});
  const [projectDetails, setProjectDetails] = useState(initialProjectDetails);
  const [activeResume, setActiveResume] = useState(null);
  const [resumeViewerClosing, setResumeViewerClosing] = useState(false);
  const [CertificatesComponent, setCertificatesComponent] = useState(() => initialCertificatesView);
  const [themeMode, setThemeMode] = useState("system");
  const [systemTheme, setSystemTheme] = useState("light");
  const [themeInitialized, setThemeInitialized] = useState(false);
  const text = copy[language];
  const theme = themeMode === "system" ? systemTheme : themeMode;

  const ensureCertificatesView = useCallback(() => loadCertificatesView().then((component) => {
    setCertificatesComponent(() => component);
    return component;
  }), []);

  const ensureProjectDetails = useCallback(() => loadProjectDetails().then((details) => {
    setProjectDetails(details);
    return details;
  }), []);

  useEffect(() => {
    if (view !== "projects" || projectDetails) return;
    ensureProjectDetails().catch(() => {});
  }, [view, projectDetails, ensureProjectDetails]);

  useLayoutEffect(() => {
    let savedTheme = null;
    try { savedTheme = window.localStorage.getItem("theme-mode"); } catch { /* Storage can be unavailable. */ }
    setThemeMode(["light", "dark", "system"].includes(savedTheme) ? savedTheme : "system");
    setSystemTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeInitialized(true);
  }, []);

  const toggleProjectDetails = (projectId) => {
    const nextIsOpen = !projectDetailsOpen[projectId];
    const update = () => {
      if (nextIsOpen) setProjectDetailsMounted((current) => ({ ...current, [projectId]: true }));
      setProjectDetailsOpen((current) => ({ ...current, [projectId]: nextIsOpen }));
      setProjectDetailsMotion((current) => ({ ...current, [projectId]: nextIsOpen ? "disclosure-icon--opening" : "disclosure-icon--closing" }));
    };
    if (!nextIsOpen || projectDetails) {
      update();
      return;
    }
    const request = navigationRequest.current;
    ensureProjectDetails().then(() => {
      if (request === navigationRequest.current) update();
    }).catch(() => {
      if (request === navigationRequest.current) window.location.assign(pathFor("projects", language, projectId));
    });
  };

  useLayoutEffect(() => {
    const timeline = educationTimelineRef.current;
    if (view !== "education" || !timeline) return undefined;
    let active = true;

    const updateLine = () => {
      const timelineTop = timeline.getBoundingClientRect().top;
      const dots = timeline.querySelectorAll(".education-timeline__dot");
      const endDot = timeline.querySelector('[data-progress-end="true"] .education-timeline__dot');
      if (!dots.length || !endDot) return;
      const centerOffset = (dot) => {
        const rect = dot.getBoundingClientRect();
        return `${rect.top - timelineTop + rect.height / 2}px`;
      };
      timeline.style.setProperty("--education-timeline-start", centerOffset(dots[0]));
      timeline.style.setProperty("--education-timeline-end", centerOffset(dots[dots.length - 1]));
      timeline.style.setProperty("--education-progress-end", centerOffset(endDot));
    };

    updateLine();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateLine);
    observer?.observe(timeline);
    timeline.querySelectorAll(".education-timeline__item").forEach((item) => observer?.observe(item));
    window.addEventListener("resize", updateLine);
    document.fonts?.ready?.then(() => { if (active) updateLine(); });
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", updateLine);
    };
  }, [view, language]);

  const transitionView = useCallback((nextView, updateHistory) => {
    const update = () => {
      if (updateHistory) updateHistory();
      setView(nextView);
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileDevice = window.matchMedia(mobileRenderingQuery).matches;
    // Capturing a long page for a View Transition delays navigation while the
    // browser rasterizes it. Switch directly when either side is project-heavy.
    if (view === "certificates" || view === "projects" || nextView === "projects") {
      update();
      return;
    }
    if (nextView === view || reducedMotion || isMobileDevice || typeof document.startViewTransition !== "function") {
      update();
      return;
    }
    document.startViewTransition(update);
  }, [view]);

  useEffect(() => {
    const handleHistoryChange = () => {
      const request = ++navigationRequest.current;
      const route = routeFromPath(window.location.pathname);
      const updateRoute = () => {
        if (request !== navigationRequest.current) return;
        setLanguage(route.language);
        setProjectId(route.projectId);
        if (route.projectId) {
          setProjectDetailsMounted((current) => ({ ...current, [route.projectId]: true }));
          setProjectDetailsOpen((current) => ({ ...current, [route.projectId]: true }));
        }
        setPublicationId(route.publicationId);
        transitionView(route.view);
      };
      if (route.view === "certificates" && !CertificatesComponent) ensureCertificatesView().then(updateRoute).catch(() => window.location.reload());
      else if (route.projectId && !projectDetails) ensureProjectDetails().then(updateRoute).catch(() => window.location.reload());
      else updateRoute();
    };
    window.addEventListener("popstate", handleHistoryChange);
    return () => {
      window.removeEventListener("popstate", handleHistoryChange);
    };
  }, [transitionView, CertificatesComponent, ensureCertificatesView, projectDetails, ensureProjectDetails]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event) => setSystemTheme(event.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    if (!themeInitialized) return;
    try { window.localStorage.setItem("theme-mode", themeMode); } catch { /* Storage can be unavailable. */ }
  }, [themeMode, themeInitialized]);

  useEffect(() => {
    if (view !== "resumes") {
      setActiveResume(null);
      setResumeViewerClosing(false);
    }
  }, [view]);

  useEffect(() => {
    if (view !== "resumes") return undefined;
    const previews = resumes.map((resume) => {
      const image = new Image();
      image.decoding = "async";
      image.src = resumePreviewSource(resume.file);
      return image;
    });
    return () => previews.forEach((image) => {
      image.onload = null;
      image.onerror = null;
    });
  }, [view]);

  useEffect(() => {
    document.documentElement.lang = language;
    const template = document.createElement("template");
    template.innerHTML = headMarkup(view, language, view === "projects" ? projectId : publicationId);
    document.head.querySelectorAll("[data-seo]").forEach((node) => node.remove());
    document.head.append(template.content);
  }, [view, language, projectId, publicationId]);

  useEffect(() => {
    if (!document.fonts?.load) return;
    document.fonts.load('650 48px "Manrope"', "Andrey Zakharov Андрей Захаров").catch(() => {});
  }, []);

  useEffect(() => () => {
    if (languageTransitionTimer.current) window.clearTimeout(languageTransitionTimer.current);
    document.documentElement.classList.remove("language-transitioning");
    navigationRequest.current += 1;
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.removeAttribute("data-initial-theme");
    document.documentElement.style.backgroundColor = theme === "dark" ? "#161716" : "#ecece9";
  }, [theme]);

  const navigateView = (nextView) => {
    const request = ++navigationRequest.current;
    if (nextView === "certificates" && !CertificatesComponent) {
      ensureCertificatesView().then(() => {
        if (request !== navigationRequest.current) return;
        setProjectId(null);
        setPublicationId(null);
        transitionView("certificates", () => window.history.pushState({ view: "certificates" }, "", pathFor("certificates", language)));
      }).catch(() => { if (request === navigationRequest.current) window.location.assign(pathFor("certificates", language)); });
      return;
    }
    setProjectId(null);
    setPublicationId(null);
    transitionView(nextView, () => window.history.pushState({ view: nextView }, "", pathFor(nextView, language)));
  };

  const navigateProject = (nextProjectId) => {
    const request = ++navigationRequest.current;
    const update = () => {
      if (request !== navigationRequest.current) return;
      window.history.pushState({ view: "projects" }, "", pathFor("projects", language, nextProjectId));
      setProjectId(nextProjectId);
      setProjectDetailsMounted((current) => ({ ...current, [nextProjectId]: true }));
      setProjectDetailsOpen((current) => ({ ...current, [nextProjectId]: true }));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    if (projectDetails) update();
    else ensureProjectDetails().then(update).catch(() => {
      if (request === navigationRequest.current) window.location.assign(pathFor("projects", language, nextProjectId));
    });
  };

  const navigatePublication = (nextPublicationId) => {
    navigationRequest.current += 1;
    window.history.pushState({ view: "publications" }, "", pathFor("publications", language, nextPublicationId));
    setPublicationId(nextPublicationId);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;
    navigationRequest.current += 1;
    if (languageTransitionTimer.current) window.clearTimeout(languageTransitionTimer.current);
    setLanguageTransitioning(true);
    document.documentElement.classList.add("language-transitioning");
    window.history.pushState({ view }, "", pathFor(view, nextLanguage, view === "projects" ? projectId : publicationId));
    setLanguage(nextLanguage);
    languageTransitionTimer.current = window.setTimeout(() => {
      setLanguageTransitioning(false);
      document.documentElement.classList.remove("language-transitioning");
    }, 480);
  };

  const openResumeViewer = (resume) => {
    setResumeViewerClosing(false);
    setActiveResume(resume);
  };

  if (view === "resumes") {
    return (
      <>
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} />
        <main className={`page-shell ${activeResume && !resumeViewerClosing ? "page-shell--viewer-open" : ""}`} data-theme={theme}>
        <AmbientLayer variant="resumes" />
        <section className="profile-card resume-page">
          <header className="resume-page-header"><h1><LanguageText>{text.resumePageTitle}</LanguageText></h1></header>
          <div className="resume-list">
            {resumes.map((resume) => (
              <div className="resume-page-item" key={resume.key} role="button" tabIndex="0" onClick={() => openResumeViewer(resume)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openResumeViewer(resume); } }}>
                <span className="resume-page-item__title">{resume.title}</span>
                <a className="resume-page-item__action" href={resume.file} download={resume.downloadName} onClick={(event) => event.stopPropagation()}><LanguageText>{text.download}</LanguageText></a>
              </div>
            ))}
          </div>
        </section>
        </main>
        {activeResume && <ResumeViewer resume={activeResume} theme={theme} text={text} onStartClose={() => setResumeViewerClosing(true)} onClose={() => { setActiveResume(null); setResumeViewerClosing(false); }} />}
      </>
    );
  }

  if (view === "certificates") {
    return <><SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} /><CertificatesComponent theme={theme} text={text} language={language} AmbientLayer={AmbientLayer} /></>;
  }

  if (view === "education") {
    return (
      <>
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} />
        <main className="page-shell" data-theme={theme}>
        <AmbientLayer variant="certificates" />
        <section className="profile-card education-page">
          <header className="resume-page-header"><h1><LanguageText>{text.education}</LanguageText></h1></header>
          <div className="education-timeline" ref={educationTimelineRef}>
            {educationHistory.map((item) => (
              <article className={`education-timeline__item education-timeline__item--${item.progress} education-timeline__item--${item.emphasis ?? "additional"}`} data-progress-end={item.progressEndpoint ? "true" : undefined} key={item.year}>
                <span className="education-timeline__year">{item.year}{item.status && <small><LanguageText>{item.status[language]}</LanguageText></small>}</span>
                <span className="education-timeline__dot" aria-hidden="true" />
                <div className="education-timeline__details">
                  <h2><LanguageText>{item.title[language]}</LanguageText></h2>
                  <p><LanguageText>{item.detail[language]}</LanguageText></p>
                  {item.institution && <small><LanguageText>{item.institution[language]}</LanguageText></small>}
                </div>
              </article>
            ))}
          </div>
        </section>
        </main>
      </>
    );
  }

  if (view === "socials") {
    return <><SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} /><SocialsView theme={theme} text={text} language={language} /></>;
  }

  if (view === "projects") {
    return (
      <>
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} projectId={projectId} text={text} onNavigate={navigateView} />
        <main className="page-shell" data-theme={theme}>
          <AmbientLayer variant="home" />
          <section className="profile-card section-page projects-page">
            <header className="resume-page-header"><h1><LanguageText>{text.projectsTitle}</LanguageText></h1></header>
            <div className="project-list">
              {projects.filter((project) => !projectId || project.id === projectId).map((project) => (
                <article className="project-card" id={project.id} key={project.id}>
                  <div className="project-card__head">
                    <div className="project-card__identity">
                      <span className="project-card__year">{project.years}</span>
                      <h2>{projectId ? project.name : <a href={pathFor("projects", language, project.id)} onClick={(event) => handleInternalLink(event, () => navigateProject(project.id))}>{project.name}</a>}</h2>
                    </div>
                    <div className="project-card__actions">
                      {project.status && <span className={`project-card__status${project.id === "prism-ai" ? " project-card__status--in-progress" : ""}`}><LanguageText>{project.status[language]}</LanguageText></span>}
                      {(Array.isArray(projectRepositories[project.id]) ? projectRepositories[project.id] : [{ url: projectRepositories[project.id] }]).map((repo) => (
                        <a className="project-card__repo" href={repo.url} target="_blank" rel="noopener noreferrer" key={repo.url}>
                          <LanguageText>{repo.label ? repo.label[language] : text.projectRepository}</LanguageText><span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <p className="project-card__summary"><LanguageText>{project.summary[language]}</LanguageText></p>
                  <div className="project-card__roles">
                    <span className="project-card__roles-label"><LanguageText>{text.projectRoles}</LanguageText></span>
                    <div className="project-card__role-tags">{project.roles[language].map((role) => <span key={role}>{role}</span>)}</div>
                  </div>
                  <div className={`project-card__details ${projectDetailsOpen[project.id] ? "project-card__details--open" : ""}`}>
                    <div className="other-toggle project-card__details-toggle">
                      <button className="other-toggle__control project-card__details-button" type="button" aria-expanded={Boolean(projectDetailsOpen[project.id])} aria-controls={`project-details-${project.id}`} onClick={() => toggleProjectDetails(project.id)}>
                        <span className="other-toggle__label project-card__details-open"><LanguageText>{text.projectDetailsOpen}</LanguageText></span>
                        <span className="other-toggle__label project-card__details-close"><LanguageText>{text.projectDetailsClose}</LanguageText></span>
                        <span className="disclosure-button" aria-hidden="true"><span className={`disclosure-icon ${projectDetailsMotion[project.id] ?? ""}`}><ChevronIcon /></span></span>
                      </button>
                    </div>
                    <div className="project-card__details-panel" id={`project-details-${project.id}`} aria-hidden={!projectDetailsOpen[project.id]} inert={!projectDetailsOpen[project.id]}>
                      {projectDetailsMounted[project.id] && projectDetails?.[project.id] && <div className="project-card__details-content">
                      <div className="project-card__stack">
                        <h3><LanguageText>{text.projectsStack}</LanguageText></h3>
                        <div className="project-card__tags">{projectDetails[project.id].stack.map((item) => <span key={item}>{item}</span>)}</div>
                      </div>
                      <div className="project-card__body">
                        <ul>{projectDetails[project.id].work[language].map((item, index) => <li key={index}><LanguageText>{item}</LanguageText></li>)}</ul>
                      </div>
                      </div>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </>
    );
  }

  if (view === "publications") {
    return (
      <>
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} publicationId={publicationId} text={text} onNavigate={navigateView} />
        <main className="page-shell" data-theme={theme}>
          <AmbientLayer variant="home" />
          <section className="profile-card section-page">
          <header className="resume-page-header"><h1><LanguageText>{text.publicationsTitle}</LanguageText></h1></header>
          <div className="research-publications">
            {researchPublications.filter((publication) => !publicationId || publication.id === publicationId).map((publication) => (
              <article className="research-publication" id={publication.id} key={publication.id}>
                <header className="research-publication__header">
                  <span className="research-publication__type"><LanguageText>{publication.type[language]}</LanguageText></span>
                  <time className="research-publication__date"><LanguageText>{publication.proceedingsDate[language]}</LanguageText></time>
                  <h2><LanguageText>{publicationId ? publication.title[language] : <a href={pathFor("publications", language, publication.id)} onClick={(event) => handleInternalLink(event, () => navigatePublication(publication.id))}>{publication.title[language]}</a>}</LanguageText></h2>
                </header>
                <dl className="research-publication__details">
                  <div><dt><LanguageText>{text.researchAuthor}</LanguageText></dt><dd><LanguageText>{publication.author[language]}</LanguageText></dd></div>
                  <div><dt><LanguageText>{text.researchSupervisor}</LanguageText></dt><dd><LanguageText>{publication.supervisor[language]}</LanguageText></dd></div>
                  <div><dt><LanguageText>{text.researchPublishedIn}</LanguageText></dt><dd><LanguageText>{publication.publishedIn[language]}</LanguageText></dd></div>
                  <div><dt><LanguageText>{text.researchIsbn}</LanguageText></dt><dd><LanguageText>{publication.isbn[language]}</LanguageText></dd></div>
                  <div><dt><LanguageText>{text.researchUdc}</LanguageText></dt><dd><LanguageText>{publication.udc}</LanguageText></dd></div>
                </dl>
              </article>
            ))}
          </div>
          </section>
        </main>
      </>
    );
  }

  if (view === "patents") {
    return (
      <>
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} />
        <main className="page-shell" data-theme={theme}>
          <AmbientLayer variant="home" />
          <section className="profile-card section-page patents-page">
            <header className="resume-page-header"><h1><LanguageText>{text.patentsTitle}</LanguageText></h1></header>
            <div className="projects-placeholder"><span className="projects-placeholder__mark" aria-hidden="true">+</span><p><LanguageText>{text.patentsPlaceholder}</LanguageText></p></div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} />
      <main className={`page-shell ${languageTransitioning ? "language-transitioning" : ""}`} data-theme={theme}>
        <AmbientLayer variant="home" />
        <section className="profile-card home-page">
          <div className="home-hero">
            <div className="home-hero__copy">
              <section className="professional-summary" aria-label={language === "ru" ? "Обо мне" : "About me"}>
                <div className="professional-summary__content">
                  <div className="professional-summary__section">
                    <h1 className="professional-summary__lead"><LanguageText>{text.professionalSummaryTitle}</LanguageText></h1>
                    <p><LanguageText>{text.professionalSummary}</LanguageText></p>
                  </div>
                  {text.professionalSummaryMore.map(({ lead, body, technical }, index) => (
                    <div className="professional-summary__section" key={index}>
                      <h2 className="professional-summary__lead"><LanguageText>{lead}</LanguageText></h2>
                      <p><LanguageText>{body}{technical && <><br />{technical}</>}</LanguageText></p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="home-photo-placeholder" aria-label={language === "ru" ? "Место для фотографии" : "Photo placeholder"}>
              <span><LanguageText>{language === "ru" ? "Фото" : "Photo"}</LanguageText></span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
