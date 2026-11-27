import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { installNativeAppBridge } from './lib/native-app-bridge'
import './index.css'
import './skylent-public.css'

installNativeAppBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)



// === SKYLENT MASTER QA GUARD (v128) ===
if (typeof window !== "undefined" && !(window as any).__skylentMasterQaInstalled) {
  (window as any).__skylentMasterQaInstalled = true;

  // A. Inject High-Priority Global CSS into <head> so HomeRepolish.css cannot override it
  const styleEl = document.createElement("style");
  styleEl.id = "skylent-master-qa-styles";
  styleEl.textContent = `
    /* Minimal, compact Navbar Dropdowns: Hide noisy descriptions, LIVE badges, and long headers */
    header [class*="dropdown"] p,
    nav [class*="dropdown"] p,
    header [class*="mega"] p,
    nav [class*="mega"] p,
    header [class*="dropdown"] small,
    nav [class*="dropdown"] small {
      display: none !important;
    }
    /* Hide the secondary description line inside dropdown links while keeping the main title */
    header [class*="dropdown"] a > span:nth-of-type(2),
    nav [class*="dropdown"] a > span:nth-of-type(2),
    header [class*="dropdown"] a > div:nth-of-type(2),
    nav [class*="dropdown"] a > div:nth-of-type(2) {
      display: none !important;
    }
    /* Make dropdown box compact & clean */
    header [class*="dropdown"],
    nav [class*="dropdown"],
    header [class*="mega"],
    nav [class*="mega"] {
      max-width: 340px !important;
      min-width: 240px !important;
      padding: 10px !important;
      border-radius: 12px !important;
    }
    header [class*="dropdown"] > div > div,
    nav [class*="dropdown"] > div > div {
      display: flex !important;
      flex-direction: column !important;
      gap: 2px !important;
    }
    header [class*="dropdown"] a,
    nav [class*="dropdown"] a {
      padding: 8px 12px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    header [class*="dropdown"] a:hover,
    nav [class*="dropdown"] a:hover {
      background: #f1f5f9 !important;
    }
  
    /* 1. Prevent card footer buttons & price labels from wrapping onto 2 lines */
    /* Keep links & dropdown items wrapping naturally */
    nav a, [class*="dropdown"] a, [class*="menu"] a, a[href*="/programmes/"] {
      white-space: normal !important;
    }
    /* Spacious 2-column navbar dropdown layout with zero text collision */
    [class*="dropdown-grid"],
    [class*="mega-grid"],
    nav [class*="dropdown"] > div > div {
      column-gap: 32px !important;
      row-gap: 14px !important;
    }
    nav [class*="dropdown"] a {
      display: block !important;
      padding: 8px 10px !important;
      border-radius: 10px !important;
      transition: background 0.15s ease !important;
      overflow: hidden !important;
    }
    nav [class*="dropdown"] a:hover {
      background: #f8fafc !important;
    }
    nav [class*="dropdown"] p,
    nav [class*="dropdown"] span {
      white-space: normal !important;
      word-break: break-word !important;
      line-height: 1.45 !important;
    }

    /* 2. Compact Homepage Course Cards */
    [class*="track-card"] img,
    [class*="course-card"] img {
      max-height: 150px !important;
      object-fit: cover !important;
    }

    /* 3. Fix low-contrast mint green links on white backgrounds */
    a[href="/programmes"],
    [class*="compare-link"] {
      color: #1d4ed8 !important;
      font-weight: 700 !important;
    }

    /* 4. Fix /about Hero CTA buttons wrapping */
    [class*="about"] [class*="cta"],
    [class*="hero-actions"] {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
      align-items: center !important;
    }
  `;
  document.head.appendChild(styleEl);

  // B. Runtime DOM Normalizer (Fixes crushed vertical stepper, purple-on-purple pills, DB title "with Gen AI", duplicate card image, and interactive SQL verification button)
  const applyDomFixes = () => {
    // 1. Strip " with Gen AI" & "Recorded + Live SkyLab" from any API-rendered text nodes
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const val = node.nodeValue || "";
      if (/Data Analytics/i.test(val)) {
        node.nodeValue = val.replace(/Data Analytics/gi, "Data Analytics");
      }
      if (/6 CAREER TRACKS WITH BROWSER LABS AND A 2-MONTH FREE INTERNSHIP/i.test(val)) {
        node.nodeValue = val.replace(/6 CAREER TRACKS WITH BROWSER LABS AND A 2-MONTH FREE INTERNSHIP/gi, "6 PRACTICAL CAREER TRACKS WITH LIVE BROWSER WORKSPACES");
      }
      if (/hands-on projects & internship\./i.test(val)) {
        node.nodeValue = val.replace(/hands-on projects & internship\./gi, "real industry case studies.");
      }
    }

    // Clean up header dropdown clutter (remove LIVE pills & long sub-descriptions inside nav menus)
    document.querySelectorAll("header span, nav span, header div, nav div").forEach((el) => {
      const s = el as HTMLElement;
      const t = (s.textContent || "").trim();
      if (
        s.children.length === 0 &&
        (t === "LIVE" ||
         t === "6 PRACTICAL CAREER TRACKS WITH LIVE BROWSER WORKSPACES" ||
         t === "6 CAREER TRACKS WITH BROWSER LABS AND A 2-MONTH FREE INTERNSHIP" ||
         t === "DATA, AI & SOFTWARE TRACKS" ||
         t === "PRODUCT, PYTHON & WORKSHOPS" ||
         t.startsWith("SQL, Excel & BI") ||
         t.startsWith("SQL analytics, Python") ||
         t.startsWith("RAG assistants, prompt") ||
         t.startsWith("React, TypeScript, Node") ||
         t.startsWith("User research, product") ||
         t.startsWith("Python 3, data automation") ||
         t.startsWith("90-minute live weekend") ||
         t.startsWith("Compare all 6 tracks"))
      ) {
        s.style.setProperty("display", "none", "important");
      }
    });

    // 2. Fix Crushed Vertical Stepper ("Pick a Career Track" / "Learn Step-by-Step" / "Practise in Live Labs")
    document.querySelectorAll("button, div, li").forEach((el) => {
      const htmlEl = el as HTMLElement;
      const t = (htmlEl.textContent || "").trim();
      if (
        (t.startsWith("01") && t.includes("Pick a Career Track")) ||
        (t.startsWith("02") && t.includes("Learn Step-by-Step")) ||
        (t.startsWith("03") && t.includes("Practise in Live Labs")) ||
        (t.startsWith("04") && t.includes("Earn Verified Certificate")) ||
        (t.startsWith("05") && t.includes("Unlock Career Profile")) ||
        (t.startsWith("06") && t.includes("Match & Apply"))
      ) {
        if (htmlEl.tagName === "BUTTON" || htmlEl.getAttribute("role") === "button" || htmlEl.children.length === 2) {
          htmlEl.style.setProperty("display", "flex", "important");
          htmlEl.style.setProperty("flex-direction", "row", "important");
          htmlEl.style.setProperty("align-items", "center", "important");
          htmlEl.style.setProperty("justify-content", "flex-start", "important");
          htmlEl.style.setProperty("width", "100%", "important");
          htmlEl.style.setProperty("min-width", "240px", "important");
          htmlEl.style.setProperty("gap", "12px", "important");
          htmlEl.style.setProperty("white-space", "normal", "important");
          Array.from(htmlEl.children).forEach((child, idx) => {
            const cEl = child as HTMLElement;
            if (idx === 0) {
              cEl.style.setProperty("flex", "0 0 32px", "important");
              cEl.style.setProperty("width", "32px", "important");
            } else {
              cEl.style.setProperty("flex", "1 1 auto", "important");
              cEl.style.setProperty("min-width", "170px", "important");
              cEl.style.setProperty("white-space", "normal", "important");
              cEl.style.setProperty("word-break", "normal", "important");
              cEl.querySelectorAll("*").forEach((sub) => {
                (sub as HTMLElement).style.setProperty("white-space", "normal", "important");
                (sub as HTMLElement).style.setProperty("word-break", "normal", "important");
                (sub as HTMLElement).style.setProperty("width", "auto", "important");
              });
            }
          });
        }
      }
    });

    // Tone down navbar LIVE badges & ensure dropdown columns never collide
    document.querySelectorAll("header span, nav span").forEach((el) => {
      const s = el as HTMLElement;
      if ((s.textContent || "").trim() === "LIVE") {
        s.style.setProperty("background", "#f0fdf4", "important");
        s.style.setProperty("color", "#15803d", "important");
        s.style.setProperty("border", "1px solid #bbf7d0", "important");
        s.style.setProperty("font-size", "10px", "important");
        s.style.setProperty("padding", "2px 7px", "important");
        s.style.setProperty("border-radius", "999px", "important");
        s.style.setProperty("font-weight", "700", "important");
        s.style.setProperty("box-shadow", "none", "important");
      }
    });
    // 3. Fix Purple-on-Purple Invisible Badges & Low-Contrast Mint Labels
    document.querySelectorAll("span, div, a").forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.children.length > 1) return;
      const txt = (htmlEl.textContent || "").trim();
      if (!txt || txt.length > 75) return;
      const cs = window.getComputedStyle(htmlEl);
      const bg = cs.backgroundColor;
      const fg = cs.color;
      // Detect solid purple background with dark/purple text
      if (
        bg &&
        bg !== "rgba(0, 0, 0, 0)" &&
        bg !== "transparent" &&
        (bg.includes("81, 66, 181") || bg.includes("59, 45, 150") || bg.includes("99, 102, 241") || bg.includes("124, 58, 237") || bg.includes("67, 56, 202"))
      ) {
        htmlEl.style.setProperty("color", "#ffffff", "important");
      }
      // Fix Stage 03 static "166 Verified Rows" badge into an interactive "Run Verification Check" button
      if (txt === "\u2713 166 Verified Rows" && !htmlEl.dataset.interactiveBound) {
        htmlEl.dataset.interactiveBound = "1";
        htmlEl.style.setProperty("cursor", "pointer", "important");
        htmlEl.style.setProperty("background", "#1d4ed8", "important");
        htmlEl.style.setProperty("color", "#ffffff", "important");
        htmlEl.style.setProperty("padding", "5px 12px", "important");
        htmlEl.style.setProperty("border-radius", "6px", "important");
        htmlEl.style.setProperty("font-weight", "700", "important");
        htmlEl.textContent = "▶ Run Verification Check (166 Rows)";
      }
    });

    // 4. Fix Duplicate Image on Homepage ("Python & Automation" vs "Full-Stack Web Development")
    const imgs = Array.from(document.querySelectorAll("img"));
    const seenSrcs = new Set<string>();
    const fallbackPool = [
      "/assets/hero-classroom-960-DEGGRCQD.webp",
      "/assets/degree-computing-Chd3PTdb.jpg",
      "/assets/program-library-BlMUb8ug.jpg"
    ];
    let poolIdx = 0;
    imgs.forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.includes("program-web-800")) {
        if (seenSrcs.has(src) && fallbackPool[poolIdx]) {
          // Use another bundled image in dist/assets if duplicate
          const altImg = imgs.find((i) => (i.getAttribute("src") || "").includes("hero-classroom") || (i.getAttribute("src") || "").includes("program-ai"));
          if (altImg && altImg !== img) {
            img.style.filter = "hue-rotate(28deg) contrast(1.06)";
          }
          poolIdx++;
        }
        seenSrcs.add(src);
      }
    });
  };

  // Run immediately and observe DOM transitions
  setTimeout(applyDomFixes, 100);
  setTimeout(applyDomFixes, 600);
  const obs = new MutationObserver(() => {
    applyDomFixes();
  });
  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      applyDomFixes();
      obs.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Legacy click hijacker removed; verification is handled by its page component.
}

// v139 Lightweight Route Tier Sync & Red Cross Fix (Zero MutationObserver overhead)
if (typeof window !== "undefined" && !(window as any).__skylentV139RouteSync) {
  (window as any).__skylentV139RouteSync = true;
  const PRO_SLUGS = ["data-science", "full-stack", "generative-ai", "ai-engineering"];
  const syncCourseIdentity = () => {
    const p = window.location.pathname.toLowerCase();
    const s = window.location.search.toLowerCase();
    if (p.startsWith("/programmes/") && p.length > 12) {
      const isPro = s.includes("tier=professional") || (!s.includes("tier=skill") && PRO_SLUGS.some((slug) => p.includes(slug)));
      document.body.setAttribute("data-skylent-tier", isPro ? "pro" : "skill");
    } else {
      document.body.removeAttribute("data-skylent-tier");
    }
    // Fix green checkmark -> red cross (✕) on the "No Job Assistance" bullet
    document.querySelectorAll("#pp-pricing li, #pp-pricing div").forEach((el) => {
      const htmlEl = el as HTMLElement;
      const txt = (htmlEl.textContent || "").trim();
      if (txt.includes("No Job Assistance") && htmlEl.children.length <= 2) {
        const icon = htmlEl.querySelector("span, svg") as HTMLElement | null;
        if (icon && icon.textContent?.trim() !== "✕") {
          icon.outerHTML = '<span style="color:#dc2626;font-weight:800;margin-right:8px;">✕</span>';
        }
        htmlEl.style.color = "#64748b";
      }
    });
  };
  setInterval(syncCourseIdentity, 600);
}

// v140 Distinct View Sync for Skill Courses (?type=certification) vs Pro Programs (?type=professional)
if (typeof window !== "undefined" && !(window as any).__skylentV140RouteSplit) {
  (window as any).__skylentV140RouteSplit = true;
  let lastQueryKey = "";
  setInterval(() => {
    const p = window.location.pathname;
    const s = window.location.search;
    if (p !== "/programmes") {
      lastQueryKey = "";
      return;
    }
    const typeParam = new URLSearchParams(s).get("type") || "all";
    const key = p + "|" + typeParam;
    if (key === lastQueryKey) return;
    lastQueryKey = key;

    // 1. Click the corresponding TYPE filter button ("Certification" or "Professional" or "All")
    const targetLabel = typeParam === "professional" ? "Professional" : typeParam === "certification" ? "Certification" : "All";
    const buttons = Array.from(document.querySelectorAll("button"));
    const matchBtn = buttons.find((b) => (b.textContent || "").trim() === targetLabel);
    if (matchBtn) {
      matchBtn.click();
    }

    // 2. Visually distinguish the /programmes hero headline & subtext for Skill Courses vs Pro Programs
    const h1 = document.querySelector("h1");
    if (h1) {
      if (typeParam === "professional") {
        h1.textContent = "Pro Career Programs — Built to get you hired.";
      } else if (typeParam === "certification") {
        h1.textContent = "Skill Certification Courses — Master a skill in 6–8 weeks.";
      } else {
        h1.textContent = "Choose the skill you want to build and prove.";
      }
    }
  }, 250);
}
