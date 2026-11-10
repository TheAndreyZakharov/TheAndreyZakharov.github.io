import { createElement, useCallback, useEffect, useRef, useState } from "react";
import certificateManifest from "./certificates.json";

const mobileRenderingQuery = "(max-width: 680px), (hover: none) and (pointer: coarse)";

function LanguageText({ children }) {
  return <span className="language-text">{children}</span>;
}

function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m6.5 11.5 5.5-6 5.5 6" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 5 5" /></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>;
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

function CertificatesView({ theme, text, language, AmbientLayer }) {
  const isMobileArchive = useMediaQuery(mobileRenderingQuery);
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
  const [viewport, setViewport] = useState(() => ({ width: typeof window === "undefined" ? 1280 : window.innerWidth, height: typeof window === "undefined" ? 800 : window.innerHeight }));
  const [showScrollActions, setShowScrollActions] = useState(false);
  const [viewerClosing, setViewerClosing] = useState(false);
  const viewerCloseTimer = useRef(null);
  const pageFlipRequest = useRef(0);
  const pagePreview = useRef(null);
  const providerScrollTimer = useRef(null);
  const providerScrollFrame = useRef(null);
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
    pageFlipRequest.current += 1;
    setViewerClosing(true);
    viewerCloseTimer.current = window.setTimeout(() => {
      setActiveCertificate(null);
      setViewerClosing(false);
      viewerCloseTimer.current = null;
    }, 300);
  }, [activeCertificate, viewerClosing]);

  const changeViewerPage = useCallback((direction) => {
    if (!activeCertificate || activeCertificate.pages.length < 2) return;
    if (pagePreview.current) {
      pagePreview.current.onload = null;
      pagePreview.current.onerror = null;
    }
    const nextPage = (activePage + direction + activeCertificate.pages.length) % activeCertificate.pages.length;
    const request = pageFlipRequest.current + 1;
    pageFlipRequest.current = request;
    const preview = new Image();
    pagePreview.current = preview;
    let finished = false;
    const showNextPage = () => {
      if (finished || request !== pageFlipRequest.current) return;
      finished = true;
      preview.onload = null;
      preview.onerror = null;
      if (pagePreview.current === preview) pagePreview.current = null;
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
    pageFlipRequest.current += 1;
    if (pagePreview.current) {
      pagePreview.current.onload = null;
      pagePreview.current.onerror = null;
      pagePreview.current = null;
    }
    if (providerScrollTimer.current) window.clearTimeout(providerScrollTimer.current);
    if (providerScrollFrame.current) window.cancelAnimationFrame(providerScrollFrame.current);
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
    pageFlipRequest.current += 1;
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

  const scrollToProvider = (index) => {
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
        const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
        const topOffset = Math.max(20, headerBottom + 16);
        const currentTop = Math.round(currentTarget.getBoundingClientRect().top + window.scrollY - topOffset);
        stableFrames = currentTop === previousTop ? stableFrames + 1 : 0;
        previousTop = currentTop;
        frameCount += 1;
        if (stableFrames >= 2 || frameCount >= 30) {
          const maxTop = Math.max(0, scrollRoot.scrollHeight - window.innerHeight);
          window.scrollTo({ top: Math.min(Math.max(0, currentTop), maxTop), behavior: "smooth" });
          return;
        }
        providerScrollFrame.current = window.requestAnimationFrame(measure);
      };
      measure();
    };
    if (providerScrollTimer.current) window.clearTimeout(providerScrollTimer.current);
    if (providerScrollFrame.current) window.cancelAnimationFrame(providerScrollFrame.current);
    providerScrollTimer.current = window.setTimeout(() => {
      providerScrollFrame.current = window.requestAnimationFrame(scroll);
    }, showContents ? 650 : 0);
  };

  const scrollToTop = () => {
    const scrollRoot = document.scrollingElement || document.documentElement;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    scrollRoot.scrollTo({ top: 0, behavior });
  };

  return (
    <>
      <main className={`page-shell page-shell--certificates ${activeCertificate && !viewerClosing ? "page-shell--viewer-open" : ""}`} data-theme={theme}>
      {!isMobileArchive && createElement(AmbientLayer, { variant: "certificates" })}
      <section className="profile-card certificate-page">
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
              <div>{certificateManifest.providers.map((provider, index) => <button type="button" onClick={() => scrollToProvider(index)} style={{ "--toc-delay": `${index * 22}ms`, "--toc-close-delay": `${(certificateManifest.providers.length - index) * 12}ms` }} key={provider.name}><span>{provider.name}</span><small>{provider.documents.length}</small></button>)}</div>
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
                      <img loading={isMobileArchive ? "eager" : "lazy"} decoding="async" width={dimensions.width} height={dimensions.height} src={certificate.thumbnails?.[0] ?? certificate.pages[0]} alt="" />
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

export default CertificatesView;
