# Mobile Web, Android APK & Anti-Piracy DRM Guide

## 1. Building the Signed Android APK & Play Store Bundle (`.aab`)

From the repository root on Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-playstore-apk.ps1
```

### Build Outputs (Saved to `~/Downloads` and Repo Root):
- `skylent-playstore-release.apk` — Signed release APK ready for phone installation and testing.
- `skylent-playstore-debug.apk` — Debug APK signed with the unified keystore.
- `skylent-playstore-release.aab` — Signed Android App Bundle for Google Play Console upload.
- `dist/skylent-latest.apk` — Hosted at `/skylent-latest.apk` for direct OTA APK downloads.

---

## 2. Native Android Architecture (`MainActivity.java`)

Generated automatically inside `scripts/build-playstore-apk.ps1`:
- **Seamless White Status & Navigation Bars (`#FFFFFF`):** Uses `WindowInsetsControllerCompat` with `setAppearanceLightStatusBars(true)` and `setAppearanceLightNavigationBars(true)` so the status bar blends cleanly into the app header without a dark stripe.
- **Native UPI Intent Launcher:** Intercepts `upi://`, `tez://` (GPay), `phonepe://`, `paytmmp://`, `bhim://`, and `intent://` URLs during PayU checkout and launches the installed UPI app directly.
- **`SkylentNativeBridge` JavaScript Interface:**
  - `window.SkylentNativeBridge.exitApp()` — Cleanly closes the activity on double-back from the home dashboard.
  - `window.SkylentNativeBridge.setScreenshotProtection(boolean enabled)` — Toggles `WindowManager.LayoutParams.FLAG_SECURE` on the Android UI thread (`true` for Students/Visitors; `false` for Admin/Superadmin).

---

## 3. Native APK UI Declutter Rules (`html[data-native-app="true"]`)

Defined in `src/skylent-public.css`:
- Hides the website top hamburger menu (`.skn__burger`), website footer (`footer`, `.sk-Foot`), and multi-screen marketing landing sections so the APK operates as a clean 5-tab mobile app (`Home`, `Courses`, `Workshops`, `Labs`, `My Learning`).
