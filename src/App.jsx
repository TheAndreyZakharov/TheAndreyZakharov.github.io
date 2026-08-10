import { useEffect, useState } from "react";
import "./App.css";

const links = [
  { name: "GitHub", prefix: "github.com/", url: "https://github.com/TheAndreyZakharov", handle: "TheAndreyZakharov" },
  { name: "Telegram", prefix: "t.me/", url: "https://t.me/TheAndreyZakharov", handle: "TheAndreyZakharov" },
  { name: "LinkedIn", prefix: "linkedin.com/in/", url: "https://www.linkedin.com/in/TheAndreyZakharov", handle: "TheAndreyZakharov" },
  { name: "Facebook", url: "https://www.facebook.com/TheAndreyZakharov" },
  { name: "Reddit", url: "https://www.reddit.com/user/TheAndreyZakharov" },
  { name: "Spotify", url: "https://open.spotify.com/user/31xnbwxotc2ixa65z42u5obuwwxi" },
  { name: "Twitch", url: "https://www.twitch.tv/theandreyzakharov" },
  { name: "YouTube", url: "https://www.youtube.com/@TheAndreyZakharov" },
  { name: "Discord", url: "https://discord.gg/CVtA4QDPXN" },
  { name: "X", url: "https://x.com/iAndreyZakharov" },
  { name: "Instagram", url: "https://www.instagram.com/the_andrey_zakharov" },
  { name: "Pinterest", url: "https://ru.pinterest.com/The_Andrey_Zakharov" },
  { name: "VK", url: "https://vk.com/TheAndreyZakharov" },
  { name: "LeetCode", url: "https://leetcode.com/u/TheAndreyZakharov" },
  { name: "Chess", url: "https://www.chess.com/member/TheAndreyZakharov" },
];

const achievementsUrl = "https://github.com/TheAndreyZakharov/Certificates-and-Diplomas";

const copy = {
  en: {
    education: "Education",
    archive: "View all Certificates & Diplomas",
    email: "Email",
    copied: "Email copied",
    mainLinks: "Main social links",
    otherAccounts: "Other accounts",
    theme: "Theme",
    language: "Language",
    system: "Auto",
    light: "Light",
    dark: "Dark",
  },
  ru: {
    education: "Образование",
    archive: "Все сертификаты и дипломы",
    email: "Почта",
    copied: "Почта скопирована",
    mainLinks: "Основные соцсети",
    otherAccounts: "Остальные аккаунты",
    theme: "Тема",
    language: "Язык",
    system: "Авто",
    light: "Светлая",
    dark: "Тёмная",
  },
};

function LinkCard({ link }) {
  return (
    <a className="social-link" href={link.url} target="_blank" rel="noreferrer">
      {link.name}
    </a>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m2.5 9.5 9.5-4 9.5 4-9.5 4-9.5-4Z" />
      <path d="M6 11.2v4.1c2.9 2.1 9.1 2.1 12 0v-4.1" />
      <path d="M21.5 10v5" />
    </svg>
  );
}

function App() {
  const [language, setLanguage] = useState("en");
  const [copied, setCopied] = useState(false);
  const [themeMode, setThemeMode] = useState("system");
  const [systemTheme, setSystemTheme] = useState(() => (
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  ));
  const text = copy[language];
  const emailAddress = "Andrey.Zakharov.Contact@gmail.com";
  const theme = themeMode === "system" ? systemTheme : themeMode;
  const primaryLinks = links.filter((link) => link.prefix);
  const socialLinks = links.filter((link) => !link.prefix);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event) => setSystemTheme(event.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "ru"
      ? "theandreyzakharov — личные ссылки"
      : "theandreyzakharov — personal links";
  }, [language]);

  return (
    <main className="page-shell" data-theme={theme}>
      <section className="profile-card">
        <div className="top-controls">
          <div className="control-group" aria-label={text.language}>
            <button className={language === "en" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setLanguage("en")}>EN</button>
            <button className={language === "ru" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setLanguage("ru")}>RU</button>
          </div>
          <div className="control-group" aria-label={text.theme}>
            <button className={themeMode === "light" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("light")} title={text.light} aria-label={text.light}>☼</button>
            <button className={themeMode === "dark" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("dark")} title={text.dark} aria-label={text.dark}>☾</button>
            <button className={themeMode === "system" ? "control-button control-button--active" : "control-button"} type="button" onClick={() => setThemeMode("system")} title={text.system} aria-label={text.system}>◐</button>
          </div>
        </div>

        <header className="profile-header">
          <div className="profile-logo-wrap" aria-hidden="true">
            <img className="profile-logo profile-logo--light" src="/logo.png" alt="" />
            <img className="profile-logo profile-logo--dark" src="/logo_d.png" alt="" />
          </div>
          <h1>{language === "ru" ? "Андрей Захаров" : "Andrey Zakharov"}</h1>
        </header>

        <div className="secondary-links">
          <div className="education-card">
            <div className="education-card__main">
              <span className="education-mark"><GraduationCapIcon /></span>
              <div>
                <strong>{text.education}</strong>
              </div>
            </div>
            <a className="secondary-button" href={achievementsUrl} target="_blank" rel="noreferrer">
              {text.archive}
            </a>
          </div>
          <div className="email-link">
            <div className="email-card__main">
              <span className="email-mark"><MailIcon /></span>
              <strong className="email-label">{text.email}</strong>
            </div>
            <button
              className="email-copy-button"
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(emailAddress);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2200);
              }}
            >
              {copied ? text.copied : emailAddress}
            </button>
          </div>
        </div>

        <div className="primary-links" data-top-label={text.mainLinks} data-bottom-label={text.otherAccounts}>
          <div className="social-links primary-social-links">
            {primaryLinks.map((link) => <LinkCard key={link.name} link={link} />)}
          </div>
        </div>

        <nav className="social-links" aria-label={language === "ru" ? "Остальные социальные сети" : "Other social links"}>
          {socialLinks.map((link) => <LinkCard key={link.name} link={link} />)}
        </nav>
      </section>
    </main>
  );
}

export default App;
