import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import certificateManifest from "./certificates.json";

const emailAddress = "Andrey.Zakharov.Contact@gmail.com";

function resumePreviewSource(file) {
  return file.replace("/resumes/", "/resume-previews/").replace(/\.pdf$/i, ".png");
}

const links = [
  { name: "GitHub", handle: "TheAndreyZakharov", url: "https://github.com/TheAndreyZakharov", icon: "/icons/icons8-github-96.png", primary: true },
  { name: "Telegram", handle: "TheAndreyZakharov", url: "https://t.me/TheAndreyZakharov", icon: "/icons/icons8-telegram-96.png", primary: true },
  { name: "LinkedIn", handle: "TheAndreyZakharov", url: "https://www.linkedin.com/in/TheAndreyZakharov", icon: "/icons/icons8-linkedin-96.png", primary: true },
  { name: "ORCID", handle: "0009-0005-4280-8352", url: "https://orcid.org/0009-0005-4280-8352", icon: "/icons/orcid.svg" },
  { name: "Hugging Face", handle: "TheAndreyZakharov", url: "https://huggingface.co/TheAndreyZakharov", icon: "/icons/icons8-hf-96.png" },
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

const researchPublications = [
  {
    title: {
      en: "Implementing AI Tools in Management Processes: Opportunities and Limitations",
      ru: "Внедрение ИИ-инструментов в управленческие процессы: возможности и ограничения",
    },
    type: { en: "Conference paper", ru: "Статья в сборнике конференции" },
    author: {
      en: "A. S. Zakharov · Student, Department of Business Informatics and Management",
      ru: "А. С. Захаров · студент кафедры бизнес-информатики и менеджмента",
    },
    supervisor: {
      en: "M. L. Krichevsky · Doctor of Technical Sciences, Professor",
      ru: "М. Л. Кричевский · доктор технических наук, профессор",
    },
    publishedIn: {
      en: "79th International Student Scientific Conference of SUAI (14–17 April 2026); Proceedings, Part 4: Humanities; Saint Petersburg: SUAI, 2026; pp. 45–46",
      ru: "Семьдесят девятая Международная студенческая научная конференция ГУАП (14–17 апреля 2026 г.); сборник докладов, ч. 4: Гуманитарные науки; СПб.: ГУАП, 2026; с. 45–46",
    },
    proceedingsDate: { en: "30 September 2026", ru: "30 сентября 2026 г." },
    isbn: {
      en: "ISBN 978-5-8088-2175-0 (Part 4); ISBN 978-5-8088-2171-2 (complete proceedings)",
      ru: "ISBN 978-5-8088-2175-0 (ч. 4); ISBN 978-5-8088-2171-2 (весь сборник)",
    },
    udc: "004.8",
  },
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

const copy = {
  en: {
    education: "Education",
    projectsTitle: "Projects & Experience",
    projectsPlaceholder: "Projects and experience will appear here.",
    publicationsTitle: "Publications",
    patentsTitle: "Patents",
    patentsPlaceholder: "Patents will appear here.",
    certificatesNav: "Diplomas & Certificates",
    homeHeroTitle: "Software Engineer",
    educationIntro: "My education path, diplomas & certificates",
    educationArchiveButton: "View diplomas & certificates",
    researchSupervisor: "Academic supervisor",
    researchAuthor: "Author",
    researchPublishedIn: "Published in",
    researchIsbn: "ISBN",
    researchUdc: "UDC",
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
    socialsTitle: "Socials & Contact",
    socialsIntro: "Ways to reach me and follow my work",
    openSocials: "Open contacts",
    socialsPageTitle: "Socials & Contact",
    mainContacts: "Main contacts",
    copied: "Email copied",
    mainLinks: "Main social links",
    otherAccounts: "Other social links",
    otherAccountsIntro: "Here are links to my social media accounts. This list is intended to identify my official profiles and provide information about them. I am not asking anyone to visit or follow them.",
    otherAccountsNote: "Some accounts have no public activity.",
    resumeTitle: "Resumes",
    resumeIntro: "Focused resumes for different roles",
    resumePageTitle: "Resumes",
    resumeViewerAuthor: "Andrey Zakharov",
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
    loadingCertificate: "Loading certificate…",
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
    projectsTitle: "Проекты и опыт",
    projectsPlaceholder: "Здесь появятся проекты и профессиональный опыт.",
    publicationsTitle: "Публикации",
    patentsTitle: "Патенты",
    patentsPlaceholder: "Патенты появятся здесь.",
    certificatesNav: "Дипломы и сертификаты",
    homeHeroTitle: "Инженер-программист",
    educationIntro: "Мой образовательный путь, дипломы и сертификаты",
    educationArchiveButton: "Дипломы и сертификаты",
    researchSupervisor: "Научный руководитель",
    researchAuthor: "Автор",
    researchPublishedIn: "Опубликовано в",
    researchIsbn: "ISBN",
    researchUdc: "УДК",
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
    socialsTitle: "Соцсети и Контакты",
    socialsIntro: "Все способы связаться со мной",
    openSocials: "Открыть контакты",
    socialsPageTitle: "Соцсети и Контакты",
    mainContacts: "Основные контакты",
    copied: "Почта скопирована",
    mainLinks: "Основные соцсети",
    otherAccounts: "Остальные соцсети",
    otherAccountsIntro: "Здесь собраны ссылки на мои аккаунты в социальных сетях. Этот список создан для идентификации моих официальных профилей и ознакомления с ними. Я не призываю переходить на эти страницы или подписываться на них.",
    otherAccountsNote: "На некоторых аккаунтах нет публичной активности.",
    resumeTitle: "Резюме",
    resumeIntro: "Резюме под разные роли и задачи",
    resumePageTitle: "Профильные резюме",
    resumeViewerAuthor: "Андрей Захаров",
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
    loadingCertificate: "Загрузка сертификата…",
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

function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m6.5 11.5 5.5-6 5.5 6" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 5 5" /></svg>;
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

function AmbientLayer({ variant }) {
  const [geometry, setGeometry] = useState(null);

  useLayoutEffect(() => {
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

function viewFromLocation() {
  if (window.location.hash === "#resumes") return "resumes";
  if (window.location.hash === "#socials") return "socials";
  if (window.location.hash === "#projects") return "projects";
  if (window.location.hash === "#publications" || window.location.hash === "#research") return "publications";
  if (window.location.hash === "#patents") return "patents";
  if (window.location.hash === "#education") return "education";
  if (window.location.hash === "#certificates" || window.location.hash.startsWith("#certificate-provider-")) return "certificates";
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

function CertificatesView({ theme, text, language }) {
  const [query, setQuery] = useState("");
  const [showContents, setShowContents] = useState(false);
  const [contentsMotion, setContentsMotion] = useState("");
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [certificateImageLoading, setCertificateImageLoading] = useState(false);
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
  const certificatesReady = true;
  const showCertificateLoader = false;
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
    if (viewerCloseTimer.current) window.clearTimeout(viewerCloseTimer.current);
    const dimensions = certificate.pageDimensions?.[0] ?? { width: 1400, height: 1000 };
    setViewerClosing(false);
    setCertificateImageLoading(true);
    setActiveOrientation(dimensions.height > dimensions.width ? "portrait" : "landscape");
    setActiveImageRatio(dimensions.width / dimensions.height);
    setActiveCertificate({ ...certificate, providerName });
    setActivePage(0);
    setPreviousPage(null);
    setPageDirection("");
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
    window.history.replaceState({ view: "certificates" }, "", "#certificates");
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
    window.history.replaceState({ view: "certificates" }, "", "#certificates");
    const scrollRoot = document.scrollingElement || document.documentElement;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    scrollRoot.scrollTo({ top: 0, behavior });
  };

  return (
    <>
      <main className={`page-shell ${activeCertificate && !viewerClosing ? "page-shell--viewer-open" : ""}`} data-theme={theme}>
      <AmbientLayer variant="certificates" />
      <section className={`profile-card certificate-page ${certificatesReady ? "" : "certificate-page--loading"}`} aria-busy={!certificatesReady}>
        {certificatesReady ? (
        <div className="certificate-page__content">
        <header className="certificate-page-header"><h1><LanguageText>{text.certificatePageTitle}</LanguageText></h1></header>
        <div className="certificate-summary">
          <div><strong>{certificateManifest.totalDocuments}</strong><span><LanguageText>{text.totalDocuments}</LanguageText></span><small><LanguageText>{text.collectionLabel}</LanguageText></small></div>
          <div><strong>{certificateManifest.providers.length}</strong><span><LanguageText>{text.totalPlatforms}</LanguageText></span><small><LanguageText>{text.platformLabel}</LanguageText></small></div>
          <div><strong>{certificateManifest.totalPages}</strong><span><LanguageText>{text.totalPages}</LanguageText></span><small><LanguageText>{text.pageLabel}</LanguageText></small></div>
        </div>
        <div className="certificate-toolbar"><label className="certificate-search"><SearchIcon /><input className="language-text-control" value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={text.certificateSearch} aria-label={text.certificateSearch} /></label></div>
        <nav className={`certificate-toc ${showContents ? "certificate-toc--open" : ""}`} aria-label={text.certificateContents}>
          <div className="certificate-toc__control">
            <div className="certificate-toc__center" onClick={toggleContents}>
              <h2><button className="certificate-toc-title" type="button" aria-expanded={showContents} aria-controls="certificate-toc-panel"><LanguageText>{text.certificateContents}</LanguageText></button></h2>
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
                    const dimensions = certificate.pageDimensions?.[0] ?? { width: 1400, height: 1000 };
                    return (
                    <button className="certificate-card" type="button" onClick={() => openCertificate(provider.name, certificate)} key={`${provider.name}-${certificate.title}`}>
                      <img loading={viewport.width <= 680 ? "eager" : "lazy"} decoding="async" fetchPriority="low" width={dimensions.width} height={dimensions.height} src={certificate.thumbnails?.[0] ?? certificate.pages[0]} alt={certificate.title} />
                      <span>{certificate.title}</span>
                      <small><LanguageText>{pageCountLabel(certificate.pages.length, language)}</LanguageText></small>
                    </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : <p className="certificate-empty"><LanguageText>{text.certificatePageEmpty}</LanguageText></p>}
        </div>
        ) : null}
        <div className={`certificate-loading ${showCertificateLoader ? "" : "certificate-loading--hidden"}`} role="status" aria-live="polite" aria-hidden={!showCertificateLoader}>
          <span className="certificate-loading__spinner" aria-hidden="true" />
          <span><LanguageText>{text.loadingCertificates}</LanguageText></span>
        </div>
      </section>
      
      </main>
      <div className={`certificate-sticky-actions ${showScrollActions ? "certificate-sticky-actions--visible" : ""} ${activeCertificate && !viewerClosing ? "certificate-sticky-actions--viewer-open" : ""}`} data-theme={theme}>
        <button type="button" onClick={scrollToTop} aria-label={text.toTop} title={text.toTop}><ArrowUpIcon /></button>
      </div>
      {activeCertificate && (
        <div className={`certificate-viewer ${viewerClosing ? "certificate-viewer--closing" : ""}`} data-theme={theme} role="dialog" aria-modal="true" aria-label={activeCertificate.title}>
          <button className="certificate-viewer__backdrop" type="button" onClick={closeViewer} aria-label={text.close} />
          <div className={`certificate-viewer__panel certificate-viewer__panel--${activeOrientation}`} style={viewerPanelSize(activeImageRatio, activeCertificate.pages.length, viewport)}>
            <div className="certificate-viewer__header"><div><strong>{activeCertificate.title}</strong><small>{activeCertificate.providerName}</small></div><button type="button" onClick={closeViewer}><LanguageText>{text.close}</LanguageText></button></div>
            <div className={`certificate-viewer__media ${activeCertificate.pages.length === 1 ? "certificate-viewer__media--single" : ""}`}>
              {activeCertificate.pages.length > 1 && <button type="button" onClick={() => changeViewerPage(-1)} aria-label={text.previous}>‹</button>}
              <div className="certificate-viewer__page-stack">
                <img className="certificate-viewer__page certificate-viewer__page--back" src={activeCertificate.pages[previousPage ?? activePage]} alt="" aria-hidden="true" />
                <img key={`${activeCertificate.title}-${activePage}`} className={`certificate-viewer__page certificate-viewer__page--current ${pageDirection ? `certificate-viewer__page--${pageDirection}` : ""}`} onLoad={(event) => { setCertificateImageLoading(false); setActiveOrientation(event.currentTarget.naturalHeight > event.currentTarget.naturalWidth ? "portrait" : "landscape"); setActiveImageRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight); }} onAnimationEnd={(event) => { if (event.animationName === "certificate-page-fade-in") { setPreviousPage(null); setPageDirection(""); } }} onError={() => { setCertificateImageLoading(false); setPreviousPage(null); setPageDirection(""); }} src={activeCertificate.pages[activePage]} alt={`${activeCertificate.title}, ${pageCountLabel(activePage + 1, language)}`} />
                {certificateImageLoading && <span className="certificate-viewer__loading" role="status" aria-label={text.loadingCertificate}><span className="certificate-viewer__spinner" aria-hidden="true" /></span>}
              </div>
              {activeCertificate.pages.length > 1 && <button type="button" onClick={() => changeViewerPage(1)} aria-label={text.next}>›</button>}
            </div>
            <div className="certificate-viewer__footer"><span>{activePage + 1} / {activeCertificate.pages.length}</span><span><LanguageText>{pageCountLabel(activeCertificate.pages.length, language)}</LanguageText></span></div>
          </div>
        </div>
      )}
    </>
  );
}

function SocialsView({ theme, text, language }) {
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
          <img className={`resume-viewer__preview ${previewLoaded ? "resume-viewer__preview--loaded" : ""}`} onLoad={() => setPreviewLoaded(true)} src={resumePreviewSource(resume.file)} alt={`${resume.title}, ${text.resumeViewerAuthor}`} />
        </div>
        <div className="certificate-viewer__footer"><span>{resume.title}</span><span>PDF</span></div>
      </div>
    </div>
  );
}

function SiteHeader({ language, theme, themeMode, setThemeMode, changeLanguage, view, text, onNavigate }) {
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

  return (
    <header className="site-header" data-theme={theme}>
      <div className="site-header__inner">
        <button className={`site-brand ${activeView === "home" ? "site-brand--active" : ""}`} type="button" onClick={() => onNavigate("home")} aria-label={language === "ru" ? "На главную — Андрей Захаров" : "Home — Andrey Zakharov"} aria-current={activeView === "home" ? "page" : undefined}>
          <span className="site-brand__logo" aria-hidden="true">
            <img className="site-brand__logo-light" src="/logo.png" alt="" />
            <img className="site-brand__logo-dark" src="/logo_d.png" alt="" />
          </span>
          <span className="site-brand__name"><LanguageText>{givenName}</LanguageText><LanguageText>{surname}</LanguageText></span>
        </button>

        <nav className="site-nav" aria-label={language === "ru" ? "Основная навигация" : "Main navigation"}>
          {navigation.map(([key, label, compactLabel]) => (
            <button className={`site-nav__link ${activeView === key ? "site-nav__link--active" : ""}`} type="button" key={key} onClick={() => onNavigate(key)} aria-current={activeView === key ? "page" : undefined}>
              {compactLabel ? <><span className="site-nav__label-full"><LanguageText>{label}</LanguageText></span><span className="site-nav__label-compact"><LanguageText>{compactLabel}</LanguageText></span></> : <LanguageText>{label}</LanguageText>}
            </button>
          ))}
        </nav>

        <div className="site-header__controls">
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
      </div>
    </header>
  );
}

function App() {
  const [language, setLanguage] = useState("en");
  const [languageTransitioning, setLanguageTransitioning] = useState(false);
  const languageTransitionTimer = useRef(null);
  const educationTimelineRef = useRef(null);
  const [view, setView] = useState(viewFromLocation);
  const [activeResume, setActiveResume] = useState(null);
  const [resumeViewerClosing, setResumeViewerClosing] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = window.localStorage.getItem("theme-mode");
    return ["light", "dark", "system"].includes(savedTheme) ? savedTheme : "system";
  });
  const [systemTheme, setSystemTheme] = useState(() => (
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  ));
  const text = copy[language];
  const theme = themeMode === "system" ? systemTheme : themeMode;

  useLayoutEffect(() => {
    const timeline = educationTimelineRef.current;
    if (view !== "education" || !timeline) return undefined;

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
    document.fonts?.ready?.then(updateLine);
    return () => {
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
    const isSmallScreen = window.matchMedia("(max-width: 680px)").matches;
    // The certificate archive contains many cards and thumbnails. Capturing it
    // for a View Transition makes leaving the archive noticeably slower.
    if (view === "certificates") {
      update();
      return;
    }
    if (nextView === view || reducedMotion || isSmallScreen || typeof document.startViewTransition !== "function") {
      update();
      return;
    }
    document.startViewTransition(update);
  }, [view]);

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
    document.title = language === "ru" ? "Андрей Захаров" : "Andrey Zakharov";
  }, [language]);

  useEffect(() => {
    if (!document.fonts?.load) return;
    document.fonts.load('650 48px "Manrope"', "Andrey Zakharov Андрей Захаров").catch(() => {});
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.removeAttribute("data-initial-theme");
    document.documentElement.style.backgroundColor = theme === "dark" ? "#161716" : "#ecece9";
  }, [theme]);

  const navigateView = (nextView) => {
    const hash = nextView === "home" ? "" : `#${nextView}`;
    transitionView(nextView, () => window.history.pushState({ view: nextView }, "", `${window.location.pathname}${hash}`));
  };

  const openCertificates = () => navigateView("certificates");

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;
    if (languageTransitionTimer.current) window.clearTimeout(languageTransitionTimer.current);
    setLanguageTransitioning(true);
    document.documentElement.classList.add("language-transitioning");
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
        {activeResume && <ResumeViewer resume={activeResume} theme={theme} text={text} onStartClose={() => setResumeViewerClosing(true)} onClose={() => { setActiveResume(null); setResumeViewerClosing(false); }} />}
        </main>
      </>
    );
  }

  if (view === "certificates") {
    return <><SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} /><CertificatesView theme={theme} text={text} language={language} /></>;
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
          <button className="education-archive-button" type="button" onClick={openCertificates}><LanguageText>{text.educationArchiveButton}</LanguageText></button>
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
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} />
        <main className="page-shell" data-theme={theme}>
          <AmbientLayer variant="home" />
          <section className="profile-card section-page projects-page">
            <header className="resume-page-header"><h1><LanguageText>{text.projectsTitle}</LanguageText></h1></header>
            <div className="projects-placeholder"><span className="projects-placeholder__mark" aria-hidden="true">+</span><p><LanguageText>{text.projectsPlaceholder}</LanguageText></p></div>
          </section>
        </main>
      </>
    );
  }

  if (view === "publications") {
    return (
      <>
        <SiteHeader language={language} theme={theme} themeMode={themeMode} setThemeMode={setThemeMode} changeLanguage={changeLanguage} view={view} text={text} onNavigate={navigateView} />
        <main className="page-shell" data-theme={theme}>
          <AmbientLayer variant="home" />
          <section className="profile-card section-page">
          <header className="resume-page-header"><h1><LanguageText>{text.publicationsTitle}</LanguageText></h1></header>
          <div className="research-publications">
            {researchPublications.map((publication) => (
              <article className="research-publication" key={publication.title.en}>
                <header className="research-publication__header">
                  <span className="research-publication__type"><LanguageText>{publication.type[language]}</LanguageText></span>
                  <time className="research-publication__date"><LanguageText>{publication.proceedingsDate[language]}</LanguageText></time>
                  <h2><LanguageText>{publication.title[language]}</LanguageText></h2>
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
                  <p><LanguageText>{text.professionalSummary}</LanguageText></p>
                  {text.professionalSummaryMore.map((paragraph) => <p key={paragraph}><LanguageText>{paragraph}</LanguageText></p>)}
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
