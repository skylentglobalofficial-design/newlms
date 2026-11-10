# Skylent Engineering Documentation (`docs/`)

All technical architecture, RBAC permissions, mobile APK, and production deployment guides live in this directory.

| Document | Description |
| :--- | :--- |
| **[`ENGINEERING_HANDOFF.md`](./ENGINEERING_HANDOFF.md)** | Codebase walkthrough covering frontend/backend modules, 6 career tracks, lesson tutor, Elixir economy, and test suites. |
| **[`architecture-and-data-model.md`](./architecture-and-data-model.md)** | System architecture, folder responsibilities, and Prisma PostgreSQL data model. |
| **[`roles-and-permissions.md`](./roles-and-permissions.md)** | 6-role RBAC permission matrix (`student`, `faculty`, `admin`/`superadmin`, `college`, `recruiter`, `organisation`). |
| **[`MOBILE_APK_AND_DRM.md`](./MOBILE_APK_AND_DRM.md)** | Capacitor Android APK/AAB builder (`scripts/build-playstore-apk.ps1`), `SkylentNativeBridge`, role-based `FLAG_SECURE` screenshot rules, and OTA auto-update. |
| **[`PRODUCTION.md`](./PRODUCTION.md)** | Production environment variables, Prisma migration preflight checks, and health endpoints (`/api/v1/health/*`). |
