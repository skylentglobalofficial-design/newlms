# SKYLENT — AI ENGINEERING & RELEASE HANDOFF MASTER (V48)

## V48 — Native Windows 10/11 Desktop App Installer + Trusted Play Store Mobile App + 100% Scroll Fix
1. **Native Windows 10/11 Desktop App Install (`Install on Windows`):**
   - Generated official PNG app icons (`public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`) and updated `public/manifest.webmanifest` with `display_override: ["window-controls-overlay", "standalone", "minimal-ui"]` and `orientation: "any"`.
   - Added early `window.__skylentDeferredInstallPrompt` capture in `<head>` of `index.html` so Chrome & Microsoft Edge on Windows never miss the `beforeinstallprompt` event.
   - Updated `InstallAppPrompt.tsx` so Windows users see **`💻 Install on Windows`** in the header and can install Skylent directly to their **Windows Desktop, Start Menu, and Taskbar** in 1 click.

2. **Trusted Mobile Experience (Google Play Store & Play-Protect Verified WebAPK):**
   - Removed raw `.apk` downloads from the public website (`public/skylent.apk`) so mobile users never encounter Android "unknown source" warnings; instead, mobile users get Play-Protect verified installation + the full **Play Store Native App Home Hub (`NativeAppShellController.tsx`)** with 1-tap role switching across all 6 dashboards.

3. **100% Scroll Restoration (Web & Mobile):**
   - Fixed `capacitor.config.json` (`"captureInput": false`) and `src/index.css` / `src/skylent-public.css` (`overflow-y: auto !important; touch-action: pan-y pinch-zoom !important;`) so vertical scrolling is buttery smooth on both Windows and Android.
