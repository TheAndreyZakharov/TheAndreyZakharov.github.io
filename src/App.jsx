import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import certificateManifest from "./certificates.json";

const emailAddress = "Andrey.Zakharov.Contact@gmail.com";

const certificateThumbnailSources = [...new Set(
  certificateManifest.providers.flatMap((provider) => provider.documents.map((certificate) => certificate.pages[0])),
)];

function preloadImageDimensions(source) {
  return new Promise((resolve) => {
    const image = new Image();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve({
        width: image.naturalWidth || 1400,
        height: image.naturalHeight || 1000,
      });
    };

    image.decoding = "async";
    image.onload = finish;
    image.onerror = finish;
    image.src = source;

    if (image.complete) finish();
  });
}

async function preloadCertificateThumbnails(sources) {
  const dimensions = {};
  let nextIndex = 0;
  const workerCount = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 2 : 5;
  const worker = async () => {
    while (nextIndex < sources.length) {
      const source = sources[nextIndex];
      nextIndex += 1;
      dimensions[source] = await preloadImageDimensions(source);
    }
  };

  await Promise.all(Array.from({ length: Math.min(workerCount, sources.length) }, worker));
  return dimensions;
}

const links = [
  { name: "GitHub", handle: "TheAndreyZakharov", url: "https://github.com/TheAndreyZakharov", icon: "/icons/icons8-github-96.png", primary: true },
  { name: "Telegram", handle: "TheAndreyZakharov", url: "https://t.me/TheAndreyZakharov", icon: "/icons/icons8-telegram-96.png", primary: true },
  { name: "LinkedIn", handle: "TheAndreyZakharov", url: "https://www.linkedin.com/in/TheAndreyZakharov", icon: "/icons/icons8-linkedin-96.png", primary: true },
  { name: "ORCID", handle: "0009-0005-4280-8352", url: "https://orcid.org/0009-0005-4280-8352", icon: "/icons/orcid.svg" },
  { name: "Hugging Face", handle: "TheAndreyZakharov", url: "https://huggingface.co/TheAndreyZakharov", icon: "/icons/icons8-hf-96.png" },
  { name: "Twitch", handle: "TheAndreyZakharov", url: "https://www.twitch.tv/TheAndreyZakharov", icon: "/icons/icons8-twitch-96.png" },
  { name: "YouTube", handle: "TheAndreyZakharov", url: "https://www.youtube.com/@TheAndreyZakharov", icon: "/icons/icons8-youtube-96.png" },
  { name: "Discord", handle: "TheAndreyZakharov", url: "https://discord.gg/CVtA4QDPXN", icon: "/icons/icons8-discord-96.png" },
  { name: "Facebook", handle: "TheAndreyZakharov", url: "https://www.facebook.com/TheAndreyZakharov", icon: "/icons/icons8-facebook-96.png" },
  { name: "X", handle: "iAndreyZakharov", url: "https://x.com/iAndreyZakharov", icon: "/icons/icons8-x-96.png" },
  { name: "Instagram", handle: "the_andrey_zakharov", url: "https://www.instagram.com/the_andrey_zakharov", icon: "/icons/icons8-instagram-96.png" },
  { name: "Reddit", handle: "TheAndreyZakharov", url: "https://www.reddit.com/user/TheAndreyZakharov", icon: "/icons/icons8-reddit-96.png" },
  { name: "Pinterest", handle: "The_Andrey_Zakharov", url: "https://ru.pinterest.com/The_Andrey_Zakharov", icon: "/icons/icons8-pinterest-96.png" },
  { name: "Spotify", handle: { en: "My profile", ru: "Мой профиль" }, url: "https://open.spotify.com/user/31xnbwxotc2ixa65z42u5obuwwxi", icon: "/icons/icons8-spotify-96.png" },
  { name: "VK", handle: "TheAndreyZakharov", url: "https://vk.com/TheAndreyZakharov", icon: "/icons/icons8-vk-96.png" },
  { name: "LeetCode", handle: "TheAndreyZakharov", url: "https://leetcode.com/u/TheAndreyZakharov", icon: "/icons/icons8-leetcode-96.png" },
  { name: "Chess", handle: "TheAndreyZakharov", url: "https://www.chess.com/member/TheAndreyZakharov", icon: "/icons/icons8-chess-96.png" },
];

const contactLinks = [
  { name: "Email", handle: emailAddress, url: `mailto:${emailAddress}`, icon: "/icons/icons8-mail-96.png" },
  ...links.filter((link) => link.primary),
];

const resumes = [
  { key: "full", title: "Full-Stack Software Engineer", file: "/resumes/Andrey_Zakharov_Full-Stack_Software_Engineer.pdf", downloadName: "Andrey_Zakharov_Full-Stack_Software_Engineer.pdf" },
  { key: "backend", title: "Backend Developer", file: "/resumes/Andrey_Zakharov_Backend_Developer_copy.pdf", downloadName: "Andrey_Zakharov_Backend_Developer_copy.pdf" },
  { key: "python-backend", title: "Python Backend Developer", file: "/resumes/Andrey_Zakharov_Python_Backend_Developer.pdf", downloadName: "Andrey_Zakharov_Python_Backend_Developer.pdf" },
  { key: "ml", title: "ML Engineer", file: "/resumes/Andrey_Zakharov_ML_Engineer.pdf", downloadName: "Andrey_Zakharov_ML_Engineer.pdf" },
  { key: "ai", title: "AI Developer", file: "/resumes/Andrey_Zakharov_AI_Developer.pdf", downloadName: "Andrey_Zakharov_AI_Developer.pdf" },
  { key: "geo", title: "Geospatial Software Engineer", file: "/resumes/Andrey_Zakharov_Geospatial_Software_Engineer.pdf", downloadName: "Andrey_Zakharov_Geospatial_Software_Engineer.pdf" },
];

const copy = {
  en: {
    education: "Education",
    educationIntro: "Certificates and Diplomas archive",
    sections: "Main sections",
    professionalSummary: "Software engineer working on a wide range of software products, applied research and challenges across different subject areas. I combine a broad technical perspective with a practical understanding of product goals and the problems a solution needs to solve. I can independently build a fast MVP or contribute to a larger product developed by a team over time.",
    professionalSummaryMore: [
      "My experience covers product development as a whole, from backend and frontend work, including integrations with external services and systems, to data-driven systems and intelligent solutions, including machine learning and artificial intelligence. This lets me look beyond an isolated part of a project and understand how architecture, data, interface and product goals fit together. I quickly get up to speed with new requirements and project contexts, turn a broad idea into a clear structure and bring it to a working implementation. I also consider how a solution will be maintained and developed further, not only how it works at the moment.",
      "Professional development is an important part of my work. I regularly study new areas, complete certifications and take part in educational and scientific programs, professional events and conferences held at an international level. Most of my ongoing development is connected with IT, but I also study other fields and disciplines. This broadens my perspective, helps me see connections across different areas and adapt more quickly to new contexts.",
      "Open to professional collaboration, research and product work where ideas can be turned into useful, well-executed results.",
    ],
    professionalSummaryReadMore: "Read more",
    professionalSummaryReadLess: "Show less",
    archive: "Certificates & Diplomas",
    email: "Email",
    socialsTitle: "Socials & contact",
    socialsIntro: "Ways to reach me and follow my work",
    openSocials: "Open contacts",
    socialsPageTitle: "Socials & contact",
    mainContacts: "Main contacts",
    copied: "Email copied",
    mainLinks: "Main social links",
    otherAccounts: "Other social links",
    resumeTitle: "Resumes",
    resumeIntro: "Focused resumes for different roles",
    resumePageTitle: "Resumes",
    openResumes: "Open resumes",
    certificatePageTitle: "Certificates & Diplomas",
    certificateSearch: "Search",
    totalDocuments: "Total documents",
    totalPlatforms: "Total organizations & platforms",
    totalPages: "Total pages",
    collectionLabel: "Certificates & Diplomas",
    platformLabel: "Issuing organizations and platforms",
    pageLabel: "Pages in documents",
    certificateContents: "Table of contents",
    certificatePageEmpty: "No certificates found.",
    loadingCertificates: "Loading documents…",
    home: "Home",
    toTop: "Top",
    close: "Close",
    previous: "Previous page",
    next: "Next page",
    download: "Download",
    theme: "Theme",
    language: "Language",
    system: "Auto",
    light: "Light",
    dark: "Dark",
  },
  ru: {
    education: "Образование",
    educationIntro: "Архив сертификатов и дипломов",
    sections: "Основные разделы",
    professionalSummary: "Инженер-программист, работающий над разнообразными программными продуктами, прикладными исследованиями и задачами в разных предметных областях. Соединяю широкий технический кругозор с практическим пониманием целей продукта и задач, которые он должен решать. Могу самостоятельно быстро собрать MVP или последовательно развивать большой продукт в команде.",
    professionalSummaryMore: [
      "Мой опыт связан с разработкой продукта целиком: от серверной логики и клиентской части, включая интеграции с внешними сервисами и системами, до работы с данными и создания интеллектуальных решений, включая задачи машинного обучения и искусственного интеллекта. Поэтому я могу смотреть на задачу не только со стороны отдельного участка, но и понимать, как между собой связаны архитектура, данные, интерфейс и цели продукта. Быстро погружаюсь в новые требования и контекст конкретной задачи, умею переводить общую идею в понятную структуру и рабочую реализацию. При этом учитываю не только то, как решение работает сейчас, но и насколько удобно его развивать дальше.",
      "Постоянное развитие – важная часть моей работы. Регулярно изучаю новые направления, прохожу сертификации, участвую в образовательных и научных программах, профессиональных мероприятиях и конференциях, в том числе международного уровня. Основная часть моего развития связана с IT, однако я также изучаю другие области и дисциплины. Это расширяет кругозор, помогает видеть связи между разными направлениями и быстрее ориентироваться в новых сферах.",
      "Открыт к профессиональному сотрудничеству, исследовательским задачам и разработке продуктов, где идеи можно превращать в полезные и качественно выполненные решения.",
    ],
    professionalSummaryReadMore: "Подробнее",
    professionalSummaryReadLess: "Свернуть",
    archive: "Сертификаты и Дипломы",
    email: "Почта",
    socialsTitle: "Соцсети и контакты",
    socialsIntro: "Все способы связаться со мной",
    openSocials: "Открыть контакты",
    socialsPageTitle: "Соцсети и контакты",
    mainContacts: "Основные контакты",
    copied: "Почта скопирована",
    mainLinks: "Основные соцсети",
    otherAccounts: "Остальные соцсети",
    resumeTitle: "Резюме",
    resumeIntro: "Резюме под разные роли и задачи",
    resumePageTitle: "Профильные резюме",
    openResumes: "Открыть резюме",
    certificatePageTitle: "Сертификаты и Дипломы",
    certificateSearch: "Поиск",
    totalDocuments: "Всего документов",
    totalPlatforms: "Всего организаций и платформ",
    totalPages: "Всего страниц",
    collectionLabel: "Сертификаты и Дипломы",
    platformLabel: "Организации и платформы-источники",
    pageLabel: "Страницы документов",
    certificateContents: "Содержание",
    certificatePageEmpty: "Сертификаты не найдены.",
    loadingCertificates: "Загрузка документов…",
    home: "Главная",
    toTop: "Наверх",
    close: "Закрыть",
    previous: "Предыдущая страница",
    next: "Следующая страница",
    download: "Скачать",
    theme: "Тема",
    language: "Язык",
    system: "Авто",
    light: "Светлая",
    dark: "Тёмная",
  },
};

function HomeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7" /><path d="M5.5 9.5v10h13v-10M9.5 19.5v-5h5v5" /></svg>;
}

function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m6.5 11.5 5.5-6 5.5 6" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 5 5" /></svg>;
}

function GraduationCapIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2.5 9.5 9.5-4 9.5 4-9.5 4-9.5-4Z" /><path d="M6 11.2v4.1c2.9 2.1 9.1 2.1 12 0v-4.1" /><path d="M21.5 10v5" /></svg>;
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

function AmbientLayer({ variant }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    const card = document.querySelector(".profile-card");
    if (!card) return undefined;

    let frameId = null;
    const updateGeometry = () => {
      const bounds = card.getBoundingClientRect();
      const top = Math.max(0, bounds.top);
      const bottom = Math.min(window.innerHeight, bounds.bottom);
      setGeometry({
        top,
        left: bounds.left,
        width: bounds.width,
        height: Math.max(1, bottom - top),
      });
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
  }, []);

  if (!geometry) return null;
  return (
    <div className={`ambient-layer ambient-layer--${variant}`} style={geometry} aria-hidden="true">
      <div className="ambient-glow ambient-glow--one" />
      <div className="ambient-glow ambient-glow--two" />
    </div>
  );
}

function SocialCard({ link, language, style }) {
  const handle = typeof link.handle === "string" ? link.handle : link.handle?.[language];
  return (
    <a className="social-link social-link--icon" href={link.url} target={link.url.startsWith("mailto:") ? undefined : "_blank"} rel={link.url.startsWith("mailto:") ? undefined : "noreferrer"} style={style}>
      <span className="social-link__content">
        <span className="social-link__icon"><img src={link.icon} alt="" /></span>
        <span className="social-link__name">{link.name}</span>
        <span className="social-link__handle"><LanguageText>{handle}</LanguageText></span>
      </span>
    </a>
  );
}

function viewFromLocation() {
  if (window.location.hash === "#resumes") return "resumes";
  if (window.location.hash === "#socials") return "socials";
  if (window.location.hash === "#education" || window.location.hash === "#certificates" || window.location.hash.startsWith("#certificate-provider-")) return "certificates";
  return "home";
}

function pageCountLabel(count, language) {
  if (language === "ru") {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} страница`;
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} страницы`;
    return `${count} страниц`;
  }
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

function viewerPanelSize(imageRatio, pageCount, viewport) {
  const ratio = Number.isFinite(imageRatio) && imageRatio > 0 ? imageRatio : 1.4;
  const mobile = viewport.width <= 480;
  const edgePadding = mobile ? 20 : 44;
  const maxPanelWidth = Math.min(viewport.width - edgePadding, 1280);
  const maxPanelHeight = Math.min(viewport.height - edgePadding, 1100);
  const horizontalChrome = pageCount > 1 ? (mobile ? 136 : 166) : (mobile ? 22 : 34);
  const verticalChrome = mobile ? 88 : 104;
  const maxImageWidth = Math.max(160, maxPanelWidth - horizontalChrome);
  const maxImageHeight = Math.max(160, maxPanelHeight - verticalChrome);
  const imageWidth = Math.min(maxImageWidth, maxImageHeight * ratio);
  const imageHeight = imageWidth / ratio;
  return {
    width: `${Math.round(imageWidth + horizontalChrome)}px`,
    height: `${Math.round(imageHeight + verticalChrome)}px`,
  };
}

function CertificatesView({ theme, text, language, onBack, leaving = false }) {
  const [query, setQuery] = useState("");
  const [showContents, setShowContents] = useState(false);
  const [contentsMotion, setContentsMotion] = useState("");
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [activeOrientation, setActiveOrientation] = useState("landscape");
  const [activeImageRatio, setActiveImageRatio] = useState(1.4);
  const [activePage, setActivePage] = useState(0);
  const [previousPage, setPreviousPage] = useState(null);
  const [pageDirection, setPageDirection] = useState("");
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [showScrollActions, setShowScrollActions] = useState(false);
  const [viewerClosing, setViewerClosing] = useState(false);
  const viewerCloseTimer = useRef(null);
  const pageFlipRequest = useRef(0);
  const [thumbnailDimensions, setThumbnailDimensions] = useState({});
  const [certificatesReady, setCertificatesReady] = useState(false);
  const [showCertificateLoader, setShowCertificateLoader] = useState(true);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProviders = certificateManifest.providers.map((provider, originalIndex) => ({
    ...provider,
    originalIndex,
    documents: provider.documents.filter((document) => (
      `${provider.name} ${document.title}`.toLowerCase().includes(normalizedQuery)
    )),
  })).filter((provider) => provider.documents.length > 0);

  const closeViewer = useCallback(() => {
    if (!activeCertificate || viewerClosing) return;
    setViewerClosing(true);
    viewerCloseTimer.current = window.setTimeout(() => {
      setActiveCertificate(null);
      setViewerClosing(false);
      viewerCloseTimer.current = null;
    }, 300);
  }, [activeCertificate, viewerClosing]);

  const changeViewerPage = useCallback((direction) => {
    if (!activeCertificate || activeCertificate.pages.length < 2) return;
    const nextPage = (activePage + direction + activeCertificate.pages.length) % activeCertificate.pages.length;
    const request = pageFlipRequest.current + 1;
    pageFlipRequest.current = request;
    const preview = new Image();
    let finished = false;
    const showNextPage = () => {
      if (finished || request !== pageFlipRequest.current) return;
      finished = true;
      const ratio = preview.naturalWidth > 0 && preview.naturalHeight > 0
        ? preview.naturalWidth / preview.naturalHeight
        : activeImageRatio;
      setPageDirection(direction > 0 ? "next" : "previous");
      setPreviousPage(activePage);
      setActiveOrientation(ratio < 1 ? "portrait" : "landscape");
      setActiveImageRatio(ratio);
      setActivePage(nextPage);
    };
    preview.onerror = showNextPage;
    preview.onload = () => {
      if (typeof preview.decode !== "function") {
        showNextPage();
        return;
      }
      preview.decode().catch(() => {}).finally(showNextPage);
    };
    preview.src = activeCertificate.pages[nextPage];
    if (preview.complete && preview.naturalWidth > 0) {
      if (typeof preview.decode !== "function") showNextPage();
      else preview.decode().catch(() => {}).finally(showNextPage);
    }
  }, [activeCertificate, activeImageRatio, activePage]);

  useEffect(() => () => {
    if (viewerCloseTimer.current) window.clearTimeout(viewerCloseTimer.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loaderTimer = null;
    Promise.all([preloadCertificateThumbnails(certificateThumbnailSources), document.fonts?.ready ?? Promise.resolve()]).then(([dimensions]) => {
      if (cancelled) return;
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        if (cancelled) return;
        setThumbnailDimensions(dimensions);
        setCertificatesReady(true);
        loaderTimer = window.setTimeout(() => setShowCertificateLoader(false), 460);
      }));
    });
    return () => {
      cancelled = true;
      if (loaderTimer) window.clearTimeout(loaderTimer);
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop,
      );
      setShowScrollActions(scrollTop > 220);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  useEffect(() => {
    if (!activeCertificate) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") changeViewerPage(-1);
      if (event.key === "ArrowRight") changeViewerPage(1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCertificate, changeViewerPage, closeViewer]);

  useEffect(() => {
    if (!activeCertificate) return undefined;
    const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeCertificate]);

  const openCertificate = (providerName, certificate) => {
    const open = (orientation, ratio) => {
      if (viewerCloseTimer.current) window.clearTimeout(viewerCloseTimer.current);
      setViewerClosing(false);
      setActiveOrientation(orientation);
      setActiveImageRatio(ratio);
      setActiveCertificate({ ...certificate, providerName });
      setActivePage(0);
      setPreviousPage(null);
      setPageDirection("");
    };
    const preview = new Image();
    preview.onload = () => open(preview.naturalHeight > preview.naturalWidth ? "portrait" : "landscape", preview.naturalWidth / preview.naturalHeight);
    preview.onerror = () => open("landscape", 1.4);
    preview.src = certificate.pages[0];
  };

  const toggleContents = () => {
    setShowContents((isOpen) => {
      const nextIsOpen = !isOpen;
      setContentsMotion(nextIsOpen ? "disclosure-icon--opening" : "disclosure-icon--closing");
      return nextIsOpen;
    });
  };

  const scrollToProvider = (event, index) => {
    event.preventDefault();
    window.history.replaceState({ view: "certificates" }, "", "#education");
    const scroll = () => {
      const target = document.getElementById(`certificate-provider-${index}`);
      if (!target) return;
      const scrollRoot = document.scrollingElement || document.documentElement;
      let previousTop = null;
      let stableFrames = 0;
      let frameCount = 0;
      const measure = () => {
        const currentTarget = document.getElementById(`certificate-provider-${index}`);
        if (!currentTarget) return;
        const currentTop = Math.round(currentTarget.getBoundingClientRect().top + window.scrollY - 20);
        stableFrames = currentTop === previousTop ? stableFrames + 1 : 0;
        previousTop = currentTop;
        frameCount += 1;
        if (stableFrames >= 2 || frameCount >= 30) {
          const maxTop = Math.max(0, scrollRoot.scrollHeight - window.innerHeight);
          window.scrollTo({ top: Math.min(Math.max(0, currentTop), maxTop), behavior: "smooth" });
          return;
        }
        window.requestAnimationFrame(measure);
      };
      measure();
    };
    window.setTimeout(() => window.requestAnimationFrame(scroll), showContents ? 650 : 0);
  };

  const scrollToTop = () => {
    window.history.replaceState({ view: "certificates" }, "", "#education");
    const scrollRoot = document.scrollingElement || document.documentElement;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    scrollRoot.scrollTo({ top: 0, behavior });
  };

  return (
    <>
      <main className={`page-shell ${leaving ? "page-shell--leaving" : ""} ${activeCertificate && !viewerClosing ? "page-shell--viewer-open" : ""}`} data-theme={theme}>
      <AmbientLayer variant="certificates" />
      <section className={`profile-card certificate-page ${certificatesReady ? "" : "certificate-page--loading"}`} aria-busy={!certificatesReady}>
        {certificatesReady ? (
        <div className="certificate-page__content">
          <div className="resume-page-top"><button className="back-button" type="button" onClick={onBack}><HomeIcon /><LanguageText>{text.home}</LanguageText></button></div>
        <header className="certificate-page-header"><h1>{text.certificatePageTitle}</h1></header>
        <div className="certificate-summary">
          <div><strong>{certificateManifest.totalDocuments}</strong><span>{text.totalDocuments}</span><small>{text.collectionLabel}</small></div>
          <div><strong>{certificateManifest.providers.length}</strong><span>{text.totalPlatforms}</span><small>{text.platformLabel}</small></div>
          <div><strong>{certificateManifest.totalPages}</strong><span>{text.totalPages}</span><small>{text.pageLabel}</small></div>
        </div>
        <div className="certificate-toolbar"><label className="certificate-search"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={text.certificateSearch} aria-label={text.certificateSearch} /></label></div>
        <nav className={`certificate-toc ${showContents ? "certificate-toc--open" : ""}`} aria-label={text.certificateContents}>
          <div className="certificate-toc__control">
            <div className="certificate-toc__center" onClick={toggleContents}>
              <h2><button className="certificate-toc-title" type="button" aria-expanded={showContents} aria-controls="certificate-toc-panel">{text.certificateContents}</button></h2>
              <button className="certificate-toc-toggle" type="button" aria-expanded={showContents} aria-controls="certificate-toc-panel" aria-label={text.certificateContents}>
                <span className={`disclosure-icon ${contentsMotion}`} aria-hidden="true"><ChevronIcon /></span>
              </button>
            </div>
          </div>
          <div className="certificate-toc-panel" id="certificate-toc-panel">
            <div className="certificate-toc-panel__inner">
              <div>{certificateManifest.providers.map((provider, index) => <a href={`#certificate-provider-${index}`} onClick={(event) => scrollToProvider(event, index)} style={{ "--toc-delay": `${index * 22}ms`, "--toc-close-delay": `${(certificateManifest.providers.length - index) * 12}ms` }} key={provider.name}><span>{provider.name}</span><small>{provider.documents.length}</small></a>)}</div>
            </div>
          </div>
        </nav>
        {visibleProviders.length > 0 ? (
          <div className="certificate-groups">
            {visibleProviders.map((provider) => (
              <section className="certificate-group" id={`certificate-provider-${provider.originalIndex}`} key={provider.name}>
                <div className="certificate-group__heading"><h2>{provider.name}</h2><span>{provider.documents.length}</span></div>
                <div className="certificate-grid">
                  {provider.documents.map((certificate) => {
                    const dimensions = thumbnailDimensions[certificate.pages[0]] ?? { width: 1400, height: 1000 };
                    return (
                    <button className="certificate-card" type="button" onClick={() => openCertificate(provider.name, certificate)} key={`${provider.name}-${certificate.title}`}>
                      <img loading="lazy" decoding="async" width={dimensions.width} height={dimensions.height} src={certificate.pages[0]} alt={certificate.title} />
                      <span>{certificate.title}</span>
                      <small>{pageCountLabel(certificate.pages.length, language)}</small>
                    </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : <p className="certificate-empty">{text.certificatePageEmpty}</p>}
        </div>
        ) : null}
        <div className={`certificate-loading ${showCertificateLoader ? "" : "certificate-loading--hidden"}`} role="status" aria-live="polite" aria-hidden={!showCertificateLoader}>
          <span className="certificate-loading__spinner" aria-hidden="true" />
          <span>{text.loadingCertificates}</span>
        </div>
      </section>
      
      </main>
      <div className={`certificate-sticky-actions ${showScrollActions ? "certificate-sticky-actions--visible" : ""} ${activeCertificate && !viewerClosing ? "certificate-sticky-actions--viewer-open" : ""}`} data-theme={theme}>
        <button type="button" onClick={onBack} aria-label={text.home} title={text.home}><HomeIcon /></button>
        <button type="button" onClick={scrollToTop} aria-label={text.toTop} title={text.toTop}><ArrowUpIcon /></button>
      </div>
      {activeCertificate && (
        <div className={`certificate-viewer ${viewerClosing ? "certificate-viewer--closing" : ""}`} data-theme={theme} role="dialog" aria-modal="true" aria-label={activeCertificate.title}>
          <button className="certificate-viewer__backdrop" type="button" onClick={closeViewer} aria-label={text.close} />
          <div className={`certificate-viewer__panel certificate-viewer__panel--${activeOrientation}`} style={viewerPanelSize(activeImageRatio, activeCertificate.pages.length, viewport)}>
            <div className="certificate-viewer__header"><div><strong>{activeCertificate.title}</strong><small>{activeCertificate.providerName}</small></div><button type="button" onClick={closeViewer}>{text.close}</button></div>
            <div className={`certificate-viewer__media ${activeCertificate.pages.length === 1 ? "certificate-viewer__media--single" : ""}`}>
              {activeCertificate.pages.length > 1 && <button type="button" onClick={() => changeViewerPage(-1)} aria-label={text.previous}>‹</button>}
              <div className="certificate-viewer__page-stack">
                <img className="certificate-viewer__page certificate-viewer__page--back" src={activeCertificate.pages[previousPage ?? activePage]} alt="" aria-hidden="true" />
                <img key={`${activeCertificate.title}-${activePage}`} className={`certificate-viewer__page certificate-viewer__page--current ${pageDirection ? `certificate-viewer__page--${pageDirection}` : ""}`} onLoad={(event) => { setActiveOrientation(event.currentTarget.naturalHeight > event.currentTarget.naturalWidth ? "portrait" : "landscape"); setActiveImageRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight); }} onAnimationEnd={(event) => { if (event.animationName === "certificate-page-fade-in") { setPreviousPage(null); setPageDirection(""); } }} onError={() => { setPreviousPage(null); setPageDirection(""); }} src={activeCertificate.pages[activePage]} alt={`${activeCertificate.title}, ${pageCountLabel(activePage + 1, language)}`} />
              </div>
              {activeCertificate.pages.length > 1 && <button type="button" onClick={() => changeViewerPage(1)} aria-label={text.next}>›</button>}
            </div>
            <div className="certificate-viewer__footer"><span>{activePage + 1} / {activeCertificate.pages.length}</span><span>{pageCountLabel(activeCertificate.pages.length, language)}</span></div>
          </div>
        </div>
      )}
    </>
  );
}

function SocialsView({ theme, text, language, onBack, leaving = false }) {
  const [showOtherLinks, setShowOtherLinks] = useState(false);
  const [disclosureMotion, setDisclosureMotion] = useState("");
  const [socialColumns, setSocialColumns] = useState(() => (window.innerWidth <= 680 ? 3 : 4));
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
    <main className={`page-shell ${leaving ? "page-shell--leaving" : ""}`} data-theme={theme}>
      <AmbientLayer variant="socials" />
      <section className="profile-card socials-page">
        <div className="resume-page-top"><button className="back-button" type="button" onClick={onBack}><HomeIcon /><LanguageText>{text.home}</LanguageText></button></div>
        <header className="socials-page-header"><h1>{text.socialsPageTitle}</h1></header>

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
          <div className="other-links-panel" id="other-links-panel"><div className="other-links-panel__inner"><nav className="social-links social-card-grid" aria-label={text.otherAccounts}>{otherLinks.map((link, index) => <SocialCard key={link.name} language={language} link={link} style={otherCardStyle(index)} />)}</nav></div></div>
        </section>
      </section>
    </main>
  );
}

function App() {
  const [language, setLanguage] = useState("en");
  const [languageTransitioning, setLanguageTransitioning] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const languageTransitionTimer = useRef(null);
  const [pageLeaving, setPageLeaving] = useState(false);
  const pageTransitionTimer = useRef(null);
  const [view, setView] = useState(viewFromLocation);
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = window.localStorage.getItem("theme-mode");
    return ["light", "dark", "system"].includes(savedTheme) ? savedTheme : "system";
  });
  const [systemTheme, setSystemTheme] = useState(() => (
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  ));
  const text = copy[language];
  const theme = themeMode === "system" ? systemTheme : themeMode;

  const transitionView = useCallback((nextView, updateHistory) => {
    const update = () => {
      if (updateHistory) updateHistory();
      setView(nextView);
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (nextView === "home" && view === "certificates" && !reducedMotion) {
      if (pageTransitionTimer.current) window.clearTimeout(pageTransitionTimer.current);
      setPageLeaving(true);
      pageTransitionTimer.current = window.setTimeout(() => {
        update();
        setPageLeaving(false);
        pageTransitionTimer.current = null;
      }, 220);
      return;
    }
    if (nextView === view || reducedMotion || typeof document.startViewTransition !== "function") {
      update();
      return;
    }
    document.startViewTransition(update);
  }, [view]);

  useEffect(() => () => {
    if (pageTransitionTimer.current) window.clearTimeout(pageTransitionTimer.current);
  }, []);

  useEffect(() => {
    const handleHistoryChange = () => transitionView(viewFromLocation());
    window.addEventListener("popstate", handleHistoryChange);
    window.addEventListener("hashchange", handleHistoryChange);
    return () => {
      window.removeEventListener("popstate", handleHistoryChange);
      window.removeEventListener("hashchange", handleHistoryChange);
    };
  }, [transitionView]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event) => setSystemTheme(event.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "ru" ? "Андрей Захаров" : "Andrey Zakharov";
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.backgroundColor = theme === "dark" ? "#161716" : "#ecece9";
  }, [theme]);

  const openResumes = () => {
    transitionView("resumes", () => window.history.pushState({ view: "resumes" }, "", "#resumes"));
  };

  const openSocials = () => {
    transitionView("socials", () => window.history.pushState({ view: "socials" }, "", "#socials"));
  };

  const openCertificates = () => {
    transitionView("certificates", () => window.history.pushState({ view: "certificates" }, "", "#education"));
  };

  const closeResumes = () => {
    transitionView("home", () => window.history.pushState({ view: "home" }, "", window.location.pathname));
  };

  const closeSocials = () => {
    transitionView("home", () => window.history.pushState({ view: "home" }, "", window.location.pathname));
  };

  const closeCertificates = () => {
    transitionView("home", () => window.history.pushState({ view: "home" }, "", window.location.pathname));
  };

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;
    if (languageTransitionTimer.current) window.clearTimeout(languageTransitionTimer.current);
    setLanguageTransitioning(true);
    setLanguage(nextLanguage);
    languageTransitionTimer.current = window.setTimeout(() => setLanguageTransitioning(false), 480);
  };

  if (view === "resumes") {
    return (
      <main className={`page-shell ${pageLeaving ? "page-shell--leaving" : ""}`} data-theme={theme}>
        <AmbientLayer variant="resumes" />
        <section className="profile-card resume-page">
          <div className="resume-page-top"><button className="back-button" type="button" onClick={closeResumes}><HomeIcon /><LanguageText>{text.home}</LanguageText></button></div>
          <header className="resume-page-header"><h1>{text.resumePageTitle}</h1></header>
          <div className="resume-list">
            {resumes.map((resume) => (
              <div className="resume-page-item" key={resume.key}>
                <span className="resume-page-item__title">{resume.title}</span>
                <a className="resume-page-item__action" href={resume.file} download={resume.downloadName}>{text.download}</a>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (view === "certificates") {
    return <CertificatesView theme={theme} text={text} language={language} onBack={closeCertificates} leaving={pageLeaving} />;
  }

  if (view === "socials") {
    return <SocialsView theme={theme} text={text} language={language} onBack={closeSocials} leaving={pageLeaving} />;
  }

  return (
    <main className={`page-shell ${languageTransitioning ? "language-transitioning" : ""}`} data-theme={theme}>
      <AmbientLayer variant="home" />
      <section className="profile-card home-page">
        <div className="top-controls">
          <div className={`control-group control-group--language control-group--${language}`} aria-label={text.language}>
            <span className="control-group__indicator" aria-hidden="true" />
            <button className={language === "en" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => changeLanguage("en")}><LanguageText>EN</LanguageText></button>
            <button className={language === "ru" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => changeLanguage("ru")}><LanguageText>RU</LanguageText></button>
          </div>
          <div className={`control-group control-group--theme control-group--${themeMode}`} aria-label={text.theme}>
            <span className="control-group__indicator" aria-hidden="true" />
            <button className={themeMode === "light" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("light")} title={text.light} aria-label={text.light}>☼</button>
            <button className={themeMode === "dark" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("dark")} title={text.dark} aria-label={text.dark}>☾</button>
            <button className={themeMode === "system" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("system")} title={text.system} aria-label={text.system}>◐</button>
          </div>
        </div>

        <header className="profile-header">
          <div className="profile-logo-wrap" aria-hidden="true">
            <span className="profile-logo-ring" />
            <img className="profile-logo profile-logo--light" src="/logo.png" alt="" />
            <img className="profile-logo profile-logo--dark" src="/logo_d.png" alt="" />
          </div>
          <h1><LanguageText>{language === "ru" ? "Андрей Захаров" : "Andrey Zakharov"}</LanguageText></h1>
        </header>

        <section className={`professional-summary ${summaryExpanded ? "professional-summary--open" : ""}`} aria-labelledby="professional-summary-title">
          <div className="professional-summary__content">
            <p id="professional-summary-title"><LanguageText>{text.professionalSummary}</LanguageText></p>
            <div className="professional-summary__details" id="professional-summary-details" aria-hidden={!summaryExpanded}>
              <div className="professional-summary__details-inner">
                {text.professionalSummaryMore.map((paragraph) => <p key={paragraph}><LanguageText>{paragraph}</LanguageText></p>)}
              </div>
            </div>
            <button className="professional-summary__toggle" type="button" onClick={() => setSummaryExpanded((isOpen) => !isOpen)} aria-expanded={summaryExpanded} aria-controls="professional-summary-details">
              <LanguageText>{summaryExpanded ? text.professionalSummaryReadLess : text.professionalSummaryReadMore}</LanguageText>
              <span className={`professional-summary__toggle-icon ${summaryExpanded ? "professional-summary__toggle-icon--open" : ""}`} aria-hidden="true"><ChevronIcon /></span>
            </button>
          </div>
        </section>

        <div className="section-divider profile-section-divider"><span><LanguageText>{text.sections}</LanguageText></span></div>

        <div className="secondary-links">
          <div className="education-card">
            <div className="education-card__main">
              <span className="education-mark"><MessageIcon /></span>
              <div><strong><LanguageText>{text.socialsTitle}</LanguageText></strong><span><LanguageText>{text.socialsIntro}</LanguageText></span></div>
            </div>
            <button className="secondary-button" type="button" onClick={openSocials}><LanguageText>{text.openSocials}</LanguageText></button>
          </div>
          <div className="education-card resume-card">
            <div className="education-card__main">
              <span className="education-mark"><ResumeIcon /></span>
              <div><strong><LanguageText>{text.resumeTitle}</LanguageText></strong><span><LanguageText>{text.resumeIntro}</LanguageText></span></div>
            </div>
            <button className="secondary-button" type="button" onClick={openResumes}><LanguageText>{text.openResumes}</LanguageText></button>
          </div>
          <div className="education-card">
            <div className="education-card__main">
              <span className="education-mark"><GraduationCapIcon /></span>
              <div><strong><LanguageText>{text.education}</LanguageText></strong><span><LanguageText>{text.educationIntro}</LanguageText></span></div>
            </div>
            <button className="secondary-button" type="button" onClick={openCertificates}><LanguageText>{text.archive}</LanguageText></button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
