/**
 * Native PWA Install is handled directly by the browser's URL address bar
 * (Chrome/Edge "Install" / "Open in app" icon in the omnibox, just like YouTube)
 * via /manifest.webmanifest and /sw.js.
 *
 * We intentionally render no custom "Get app" button or instruction modal on the page.
 */
export function InstallAppPrompt(_props: { variant?: "nav" | "banner" | "hero" }) {
  return null
}

export default InstallAppPrompt
