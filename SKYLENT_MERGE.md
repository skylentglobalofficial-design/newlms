# Skylent website merge — Hostinger deploy notes

Added to newLMS:
- `/api/v1/certificates` — `POST /issue` (learner, needs 100% progress), `GET /mine`, `GET /verify/:code` (public)
- `/api/v1/enquiries` — `POST /` public counselling/enquiry form, `GET /` admin list
- `/api/v1/reva/chat` — site-wide Reva (visitor = site only, signed-in = own enrolments, fixed identity answer)
- Prisma models `SkylentCertificate`, `SkylentEnquiry` + migration `20261004000000_skylent_additions`

## Deploy on Hostinger VPS
```
git pull && npm ci
npx prisma migrate deploy
npm run build
pm2 restart newlms-api || pm2 start npm --name newlms-api -- start
```
Env: DATABASE_URL, SKYLENT_AI_API_KEY, SKYLENT_AI_BASE_URL, SKYLENT_AI_MODEL, FRONTEND origin for CORS.
After it is live, send the API URL so the Skylent website is pointed at it.
