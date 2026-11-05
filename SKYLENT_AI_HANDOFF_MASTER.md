# SKYLENT — AI ENGINEERING & RELEASE HANDOFF MASTER (V42)

## V42 — White-Screen Service Worker Fix (`skylent.live`) + Clean BOM-Free `AndroidManifest.xml` APK Builder
1. **Why `https://skylent.live` showed a Blank White Screen (`image_a7ae3e.png`):**
   - `public/sw.js` (`skylent-app-shell-v37`) cached `'/'` (`index.html`) on install and fell back to `caches.match('/')` (`text/html`) when any network request failed.
   - Across `V38 -> V39 -> V40` deployments, Vite generated new content-hashed bundle filenames (`/assets/index-<NEW_HASH>.js`, `/assets/HomePage-<NEW_HASH>.js`), while browsers with the V37 Service Worker served stale cached `'/'` HTML pointing to deleted JS chunk hashes (or received `text/html` for a `.js` chunk), causing React `lazy(() => import("./pages/HomePage"))` to fail with a chunk load error and render a white screen.
   - **Fix in V42:**
     - `public/sw.js` (`skylent-app-shell-v42`): Purges all previous `caches.keys()` on activate, never caches `'/'` or HTML documents, and never returns `caches.match('/')` (`text/html`) for `/assets/*.js` or `.css` requests.
     - `index.html`: Adds an inline `<head>` self-healing script that deletes all pre-`v42` Service Worker caches immediately before the module bundle loads, Force-Updates existing Service Workers, and listens for `vite:preloadError` to auto-reload cleanly once per session.
     - `src/App.tsx`: Imports `HomePage` eagerly (`import HomePage from "./pages/HomePage"`) so `/` renders immediately in the main bundle without a secondary lazy chunk round-trip, and wraps all other route imports in `lazyWithRetry`.

2. **Why Local Gradle Failed at `:app:processDebugMainManifest` in V40:**
   - Capacitor's generated `android/app/src/main/AndroidManifest.xml` already contained `android:allowBackup="true"`. Replacing `<application` with `<application android:usesCleartextTraffic="false" android:allowBackup="false"` created duplicate `android:allowBackup` attributes on `<application>`, and PowerShell 5.1 `Set-Content -Encoding UTF8` wrote a 3-byte UTF-8 BOM at byte 0, causing `ManifestMerger2$MergeFailureException`.
   - **Fix in V42 (`scripts/build-playstore-apk.ps1`):**
     - Writes a complete, clean, single-attribute `AndroidManifest.xml` using `System.Text.UTF8Encoding($false)` (strictly zero BOM) so `:app:processDebugMainManifest` and `assembleDebug` succeed immediately using the already-installed Portable OpenJDK 21 (`C:\Users\Chandan\.skylent-android-toolchain\jdk\jdk-21.0.13.0.2+1`) and Android SDK (`C:\Users\Chandan\.skylent-android-toolchain\android-sdk`).
