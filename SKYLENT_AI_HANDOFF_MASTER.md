# SKYLENT — AI ENGINEERING & RELEASE HANDOFF MASTER (V47)

## V47 — 100% Touch/Mouse Scroll Restoration + Flagship Google Play Store Native App UI
1. **Why Scrolling Was Blocked in V43–V46 (Fixed in V47):**
   - `capacitor.config.json` had `"captureInput": true` under `"android"`. In `@capacitor/android`, `captureInput: true` attaches a raw `OnTouchListener` on the Android `WebView` that intercepts `MotionEvent.ACTION_MOVE` and disables native vertical finger scrolling on Android phones. Changed to `"captureInput": false`.
   - `src/index.css` had `main, nav, dialog { transform: translateZ(0); perspective: 1000px; }` and `body { overscroll-behavior-y: none; }` + `html { touch-action: manipulation; }`, which created a giant 3D-transformed layer on `<main>` and locked scroll containers. Replaced with explicit native scroll restoration (`overflow-y: auto !important; height: auto !important; touch-action: pan-y pinch-zoom !important; -webkit-overflow-scrolling: touch;`).

2. **Flagship Google Play Store Mobile App Experience (`NativeAppShellController.tsx` + `src/skylent-public.css`):**
   - **Native Play Store App Header (`58px` sticky bar)**: Royal Purple-Indigo gradient (`#1e1b4b -> #3B2D96 -> #5142B5`), native `←` back button on sub-screens, live `🪙 Elixir Coins` wallet counter, `📱 App Hub / 🌐 Web View` toggle, and user role avatar.
   - **Dedicated Play Store App Home Hub (`/` in Native App Mode)**:
     - **Active Course Resume Card**: Shows current progress (`42% Complete`) with 1-tap `▶ Resume Course` and `⚡ Open SQL Lab`.
     - **⚡ 1-Tap Instant Mobile Role Switcher**: Allows testing all 6 live dashboards (`Student App`, `Admin C-Suite`, `Faculty SLA`, `College TPO`, `Recruiter`, `Enterprise Org`) with 1 tap on the phone without typing emails/passwords.
     - **🎯 2x2 Quick-Action App Tiles**: `90s Skill Diagnostic`, `Practice Sandbox`, `₹99 Live Workshops`, and `Verify Certificate`.
     - **🧠 Daily 30-Sec App Challenge**: Interactive in-app SQL join fanout cold call with instant `+25 Elixir Coins` reward.
     - **🎓 6 Flagship Career Track Cards**: Swipable/scrollable mobile app cards for all 6 tracks.
   - **5-Tab Google Play Store Bottom Navigation Bar (`64px` fixed bottom)**: `🏠 Home`, `🎓 Courses`, `⚡ Practice` (fixed from broken `/practice` 404 route to `/labs`), `💼 Career OS`, and `👤 My OS`.
