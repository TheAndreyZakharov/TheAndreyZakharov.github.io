// Project descriptions are based on the local repositories, their source code,
// documentation and Git history. Planned work is labelled separately.
const projects = [
  {
    id: "prism-ai", name: "PRISM AI", years: "2026", status: { ru: "В активной разработке", en: "Currently in development" },
    summary: { ru: "PRISM AI задуман как локальная CRM/ATS-система для полного цикла рекрутинга: ведения процессов найма, работы с кандидатами и аналитики. Сейчас формируются архитектура продукта, требования к данным и моделям, сценарии работы и план реализации приложения для macOS.", en: "PRISM AI is being developed as a local CRM/ATS for the full recruitment cycle, combining hiring workflows, candidate management and analytics. The product architecture, data and model requirements, user workflows and implementation plan for a macOS app are currently being defined." },
    roles: { ru: ["Системный архитектор", "Исследователь продукта"], en: ["System Architect", "Product Researcher"] },
  },
  {
    id: "ai-companion", name: "AI Companion", years: "2026",
    summary: { ru: "Telegram-бот с настраиваемым характером для личных и групповых чатов. Он использует историю переписки как контекст, поддерживает плановые групповые обзоры, диагностику и несколько слотов Cloudflare Workers AI; бот развёрнут и обслуживается на собственном сервере.", en: "A Telegram bot with a configurable personality for private and group chats. It uses conversation history as context and supports scheduled group reviews, diagnostics and multiple Cloudflare Workers AI credential slots; the bot is deployed and maintained on a private server." },
    roles: { ru: ["Python-разработчик", "Backend-разработчик", "Разработчик Telegram-бота", "Инженер интеграции ИИ", "Администратор сервера"], en: ["Python Developer", "Backend Developer", "Telegram Bot Developer", "AI Integration Engineer", "Server Administrator"] },
  },
  {
    id: "portfolio", name: "TheAndreyZakharov.com / TheAndreyZakharov.github.io", years: "2025–2026",
    summary: { ru: "Двуязычный сайт-портфолио на собственном домене, который представляет профессиональный профиль, проекты и опыт, образование, резюме и публикации. На сайте также собраны контакты и архив дипломов и сертификатов с поиском и просмотром документов; публикация настроена через GitHub Pages.", en: "A bilingual portfolio on a custom domain presenting a professional profile, projects and experience, education, resumes and publications. It also brings together contact links and a searchable diploma and certificate archive with document viewing, and is published through GitHub Pages." },
    roles: { ru: ["Frontend-разработчик", "Разработчик интерфейса", "Инженер CI/CD"], en: ["Frontend Developer", "UI Developer", "CI/CD Engineer"] },
  },
  {
    id: "certificates", name: "Certificates and Diplomas", years: "2026",
    summary: { ru: "Личный архив дипломов, сертификатов и подтверждающих документов, организованный по организациям и программам. Генератор на Rust собирает сведения о файлах и страницах и пересоздаёт двуязычные Markdown-каталоги и изображения для публикации и просмотра на сайте.", en: "A personal archive of diplomas, certificates and supporting documents, organized by issuing organizations and programs. A Rust generator collects file and page metadata and rebuilds the bilingual Markdown catalogues and images used to publish and browse the archive on the website." },
    roles: { ru: ["Rust-разработчик", "Разработчик CLI-инструментов", "Инженер автоматизации"], en: ["Rust Developer", "CLI Tools Developer", "Automation Engineer"] },
  },
  {
    id: "promptrunner", name: "PromptRunner", years: "2026",
    summary: { ru: "Кроссплатформенное настольное приложение для подготовки ответов на вопросы IT-собеседований. Оно автоматизирует работу через видимое окно AI-чата: находит и обрабатывает вопросы на экране, передаёт их в выбранную модель и сохраняет подготовленные ответы в банк вопросов.", en: "A cross-platform desktop app for preparing answers to IT interview questions. It automates work through a visible AI chat window: detects and processes questions on screen, sends them to the selected model and saves the resulting answers to a question bank." },
    roles: { ru: ["Разработчик настольных приложений", "Rust-разработчик", "Frontend-разработчик", "Инженер автоматизации"], en: ["Desktop Application Developer", "Rust Developer", "Frontend Developer", "Automation Engineer"] },
  },
  {
    id: "it-interview", name: "IT Interview", years: "2026",
    summary: { ru: "Единый проект для подготовки к IT-собеседованиям: веб-приложение с режимами изучения и тренировки связано с отдельным русско-английским банком почти из 60 тысяч вопросов. Репозитории разделены по назначению, но работают вместе: банк предоставляет структурированные материалы для приложения, а его содержимое можно пополнять и проверять инструментами проекта.", en: "A unified IT interview preparation project: a web app for studying and practice is connected to a separate Russian-English bank of nearly 60,000 questions. The repositories have distinct responsibilities but work together: the bank supplies structured content to the app, and project tools support its maintenance and validation." },
    roles: { ru: ["Full-stack-разработчик", "Backend-разработчик", "Frontend-разработчик", "Архитектор банка вопросов"], en: ["Full-Stack Developer", "Backend Developer", "Frontend Developer", "Question Bank Architect"] },
  },
  {
    id: "mac-peripheral-hub", name: "MacPeripheralHub", years: "2026",
    summary: { ru: "Нативное приложение для macOS, которое собирает сведения о подключённой периферии и помогает управлять звуковыми устройствами и пользовательскими профилями. Фоновый механизм поддерживает выбранные системные аудиоустройства, а интерфейс объединяет инвентаризацию, проверку устройств, настройки и быстрые действия из строки меню.", en: "A native macOS app that inventories connected peripherals and helps manage audio devices and user profiles. A background mechanism maintains selected system audio devices, while the interface brings together device checks, settings and quick actions from the menu bar." },
    roles: { ru: ["Разработчик macOS-приложений", "Системный разработчик", "Разработчик C-core"], en: ["macOS Application Developer", "Systems Developer", "C Core Developer"] },
  },
  {
    id: "arcade-games", name: "Arcade Games", years: "2026",
    summary: { ru: "Настольный сборник из шести аркадных игр, созданный на C++ и SDL2: Flappy Bird, Doodle Jump, Snake, Tetris, Pong и Breakout. Общее меню, игровой цикл и система сохранения рекордов объединяют отдельные режимы в одно приложение.", en: "A C++ and SDL2 desktop collection of six arcade games: Flappy Bird, Doodle Jump, Snake, Tetris, Pong and Breakout. A shared menu, game loop and high-score system bring the individual modes together in one app." },
    roles: { ru: ["C++-разработчик", "Разработчик игр", "Инженер сборки"], en: ["C++ Developer", "Game Developer", "Build Engineer"] },
  },
  {
    id: "compass-ai", name: "COMPASS AI", years: "2026",
    summary: { ru: "Локальная исследовательская система поддержки распределения проектных задач между сотрудниками с учётом компетенций, загрузки, сроков, рисков и целей развития. Основной контур формирует и объясняет рекомендации, а отдельная Sandbox объединяет генерацию и импорт данных, обучение и сравнение моделей, эксперименты с назначениями и отчётность.", en: "A local research system for supporting project-task assignment across a team based on competencies, workload, deadlines, risks and development goals. The main pipeline generates and explains recommendations, while a separate Sandbox brings together data generation and import, model training and comparison, assignment experiments and reporting." },
    roles: { ru: ["Архитектор ПО", "ML-инженер", "Инженер данных", "Backend-разработчик", "Full-stack-разработчик"], en: ["Software Architect", "ML Engineer", "Data Engineer", "Backend Developer", "Full-Stack Developer"] },
  },
  {
    id: "urbanflow-ai", name: "UrbanFlow AI", years: "2026",
    summary: { ru: "Веб-среда для изучения городского трафика на реальных участках: она загружает геоданные OpenStreetMap, готовит 3D-сцену и позволяет запускать сценарии транспортной симуляции SUMO. В проект также входят визуализация показателей, инструменты управления светофорами и эвристический контроллер для экспериментов с фазами движения.", en: "A web environment for exploring urban traffic on real-world areas: it imports OpenStreetMap data, prepares a 3D scene and runs SUMO traffic scenarios. The project also includes metric visualizations, traffic-light controls and a heuristic controller for experimenting with signal phases." },
    roles: { ru: ["Full-stack-разработчик", "Разработчик симуляции", "Инженер систем управления", "Backend-разработчик"], en: ["Full-Stack Developer", "Simulation Developer", "Control Systems Engineer", "Backend Developer"] },
  },
  {
    id: "frappe-hr-forge", name: "Frappe HR Forge", years: "2025–2026",
    summary: { ru: "Локальная среда для разработки HR-решения на базе ERPNext и Frappe HRMS. Она объединяет Docker-развёртывание, собственное Frappe-приложение с кадровыми сущностями и ETL-конвейеры для подготовки данных о карьерных траекториях, вакансиях и курсах.", en: "A local environment for developing an HR solution on ERPNext and Frappe HRMS. It combines a Docker deployment, a custom Frappe app with HR entities and ETL pipelines for preparing career-history, job-market and course data." },
    roles: { ru: ["Разработчик Frappe/ERPNext", "Backend-разработчик", "Инженер данных", "Инженер DevOps"], en: ["Frappe/ERPNext Developer", "Backend Developer", "Data Engineer", "DevOps Engineer"] },
  },
  {
    id: "face-swap-studio", name: "Face Swap Studio", years: "2026",
    summary: { ru: "Локальное приложение для macOS, которое позволяет сопоставлять лица-источники с лицами на выбранных фотографиях и запускать пакетную замену. Приложение объединяет несколько подключаемых моделей, детекцию лиц, предпросмотр, постобработку и экспорт результатов; видеопроцессинг в него не входит.", en: "A local macOS app for mapping source faces to faces in selected photos and running batch face swaps. It brings together pluggable models, face detection, previews, post-processing and result export; it does not process video." },
    roles: { ru: ["Разработчик macOS-приложений", "Python-разработчик", "Инженер интеграции ML-моделей", "Разработчик интерфейса"], en: ["macOS Application Developer", "Python Developer", "ML Model Integration Engineer", "UI Developer"] },
  },
  {
    id: "webcamera", name: "Webcamera", years: "2026",
    summary: { ru: "Комплект приложений для macOS и Android, объединяющий камеры компьютера и подключённого по USB смартфона в одном рабочем пространстве. Можно одновременно просматривать несколько источников, настраивать видео и звук для каждого и записывать их в отдельные файлы без установки системной виртуальной камеры.", en: "A paired macOS and Android application setup that brings the computer's cameras and a USB-connected phone into one workspace. It can preview multiple sources at once, configure video and audio for each, and record them to separate files without installing a system-wide virtual camera." },
    roles: { ru: ["Разработчик macOS-приложений", "Android-разработчик", "Инженер мультимедиа", "Системный разработчик"], en: ["macOS Application Developer", "Android Developer", "Multimedia Engineer", "Systems Developer"] },
  },
  {
    id: "touchpad", name: "Touchpad", years: "2026",
    summary: { ru: "Пара приложений для Android-планшета и macOS, превращающая сенсорный экран планшета в поверхность управления компьютером. Приложение передаёт жесты по локальной Wi-Fi-сети, а клиент macOS преобразует их в системные события курсора, кнопок мыши и прокрутки.", en: "A pair of Android tablet and macOS apps that turns the tablet's touchscreen into a computer input surface. The tablet sends gestures over local Wi-Fi, and the macOS client translates them into system pointer, mouse-button and scrolling events." },
    roles: { ru: ["Android-разработчик", "Разработчик macOS-приложений", "Инженер сетевых протоколов"], en: ["Android Developer", "macOS Application Developer", "Network Protocol Engineer"] },
  },
  {
    id: "cartopia", name: "Cartopia", years: "2025",
    summary: { ru: "Мод для Minecraft Forge 1.20.1, который строит игровой мир по выбранной реальной территории примерно в масштабе 1:1. Он объединяет картографические объекты OpenStreetMap, данные рельефа и земного покрова, а затем последовательно генерирует поверхность, дороги, здания и городскую инфраструктуру в Minecraft.", en: "A Minecraft Forge 1.20.1 mod that builds an in-game world from a selected real-world area at roughly 1:1 scale. It combines OpenStreetMap features with elevation and land-cover data, then generates terrain, roads, buildings and urban infrastructure in Minecraft." },
    roles: { ru: ["Java-разработчик", "Разработчик Minecraft-модов", "Инженер геоданных", "Разработчик конвейера генерации"], en: ["Java Developer", "Minecraft Mod Developer", "Geospatial Data Engineer", "Generation Pipeline Developer"] },
  },
  {
    id: "github-profile", name: "TheAndreyZakharov (GitHub profile)", years: "2024–2025",
    summary: { ru: "Персональный профиль GitHub с контактной информацией, сведениями об активности и статистическими карточками. Для него также разработан генератор SVG на TypeScript, который получает данные через GitHub GraphQL API и формирует набор статичных и анимированных визуализаций вкладов.", en: "A personal GitHub profile with contact details, activity information and statistics cards. It also includes a TypeScript SVG generator that retrieves data through the GitHub GraphQL API and produces a set of static and animated contribution visualizations." },
    roles: { ru: ["TypeScript-разработчик", "Разработчик визуализаций", "Инженер CI/CD"], en: ["TypeScript Developer", "Data Visualization Developer", "CI/CD Engineer"] },
  },
  {
    id: "botyan", name: "Botyan", years: "2025",
    summary: { ru: "Набор развлекательных ботов для Telegram и Discord с общим виртуальным персонажем и отдельными платформенными реализациями. Помимо диалогов через внешнюю языковую модель, боты поддерживают игровые механики, работу с историей чатов, создание демотиваторов и обработку медиасообщений.", en: "A set of entertainment bots for Telegram and Discord built around a shared virtual character, with a separate implementation for each platform. Alongside conversations through an external language model, they support chat games, conversation history, demotivator creation and media-message processing." },
    roles: { ru: ["Python-разработчик", "Разработчик чат-ботов", "Backend-разработчик", "Инженер интеграции ИИ"], en: ["Python Developer", "Chatbot Developer", "Backend Developer", "AI Integration Engineer"] },
  },
  {
    id: "raas", name: "Russian Automotive Assistance System (RAAS)", years: "2024–2025",
    summary: { ru: "Прототип системы помощи водителю для симулятора CARLA, объединяющий панель управления, сенсорные данные и отдельные ADAS-функции. Проект включает сценарии обзора окружения, удержания полосы, контроля дистанции и парковки, а также инструменты для сбора данных и экспериментов с моделью управления.", en: "A driver-assistance prototype for the CARLA simulator that combines a control interface, sensor data and individual ADAS functions. It includes scenarios for surround view, lane keeping, distance monitoring and parking, along with tools for collecting data and experimenting with a control model." },
    roles: { ru: ["Инженер-разработчик ADAS", "Инженер компьютерного зрения", "ML-инженер", "Разработчик симуляции"], en: ["ADAS Software Engineer", "Computer Vision Engineer", "ML Engineer", "Simulation Developer"] },
  },
  {
    id: "suai-coursework", name: "SUAI Software Engineering and Management", years: "2021–2026",
    summary: { ru: "Структурированный архив учебных работ за время обучения в ГУАП по программной инженерии и менеджменту. Репозиторий собирает задания, исходный код, данные, отчёты и материалы проектов по разным дисциплинам, показывая широкий круг применённых технологий и инженерных методов.", en: "An organized archive of coursework completed during Software Engineering and Management studies at SUAI. The repository brings together assignments, source code, data, reports and project materials from a range of subjects, reflecting the technologies and engineering methods used." },
    roles: { ru: ["Разработчик учебных проектов", "Инженер по проектированию систем"], en: ["Coursework Project Developer", "Systems Design Engineer"] },
  },
];

export const projectRepositories = {
  "prism-ai": "https://github.com/TheAndreyZakharov/PRISM-AI",
  portfolio: "https://github.com/TheAndreyZakharov/TheAndreyZakharov.github.io",
  "ai-companion": "https://github.com/TheAndreyZakharov/AI-Companion",
  certificates: "https://github.com/TheAndreyZakharov/Certificates-and-Diplomas",
  promptrunner: "https://github.com/TheAndreyZakharov/PromptRunner",
  "it-interview": [
    { label: { ru: "Сайт", en: "Website" }, url: "https://theandreyzakharov.github.io/IT-Interview/" },
    { label: { ru: "Репозиторий приложения", en: "App repository" }, url: "https://github.com/TheAndreyZakharov/IT-Interview" },
    { label: { ru: "Банк вопросов", en: "Question bank" }, url: "https://github.com/TheAndreyZakharov/IT-Interview-Question-Bank" },
  ],
  "mac-peripheral-hub": "https://github.com/TheAndreyZakharov/MacPeripheralHub",
  "arcade-games": "https://github.com/TheAndreyZakharov/Arcade-Games",
  "compass-ai": "https://github.com/TheAndreyZakharov/COMPASS-AI",
  "urbanflow-ai": "https://github.com/TheAndreyZakharov/UrbanFlow-AI",
  "frappe-hr-forge": "https://github.com/TheAndreyZakharov/Frappe-HR-Forge",
  "face-swap-studio": "https://github.com/TheAndreyZakharov/Face-Swap-Studio",
  webcamera: "https://github.com/TheAndreyZakharov/Webcamera",
  touchpad: "https://github.com/TheAndreyZakharov/Touchpad",
  cartopia: "https://github.com/TheAndreyZakharov/Cartopia",
  "github-profile": "https://github.com/TheAndreyZakharov/TheAndreyZakharov",
  botyan: "https://github.com/TheAndreyZakharov/Botyan",
  raas: "https://github.com/TheAndreyZakharov/Russian-Automotive-Assistance-System",
  "suai-coursework": "https://github.com/TheAndreyZakharov/SUAI-Software-Engineering-and-Management",
};

export default projects;
