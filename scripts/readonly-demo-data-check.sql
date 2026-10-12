-- Read-only checks for demo users, the demo employer, and related job records.
-- SELECT only. Do not add UPDATE, DELETE, INSERT, TRUNCATE, or DDL.
-- Do not run this against production from an automated job. An operator reviews the
-- result, then decides any cleanup separately. Never select passwordHash.

-- Demo learner accounts created when SEED_DEMO_USERS was enabled.
SELECT id, email, "displayName", "createdAt"
FROM "User"
WHERE email ILIKE '%@demo.skylent.dev'
ORDER BY "createdAt";

-- Demo employer left by an older seed (slug skylent-demo-employer).
SELECT id, slug, name, "createdAt"
FROM "Employer"
WHERE slug = 'skylent-demo-employer'
   OR name = 'Skylent Demo Employer';

-- Jobs owned by that employer, including the development fixture role.
SELECT j.id, j.slug, j.title, j.status, j."employerId", j."createdAt"
FROM "Job" j
JOIN "Employer" e ON e.id = j."employerId"
WHERE e.slug = 'skylent-demo-employer'
   OR e.name = 'Skylent Demo Employer'
ORDER BY j."createdAt";

-- Saved jobs that reference those demo jobs. Counts only; do not delete the rows.
SELECT COUNT(*) AS saved_job_count
FROM "SavedJob" s
WHERE s."jobId" IN (
  SELECT j.id
  FROM "Job" j
  JOIN "Employer" e ON e.id = j."employerId"
  WHERE e.slug = 'skylent-demo-employer'
     OR e.name = 'Skylent Demo Employer'
);

-- Applications that reference those demo jobs or that employer.
-- Preserve these rows. A later cleanup must close or archive jobs, not delete applications.
SELECT COUNT(*) AS application_count
FROM "JobApplication" a
WHERE a."jobId" IN (
  SELECT j.id
  FROM "Job" j
  JOIN "Employer" e ON e.id = j."employerId"
  WHERE e.slug = 'skylent-demo-employer'
     OR e.name = 'Skylent Demo Employer'
)
OR a."employerId" IN (
  SELECT e.id
  FROM "Employer" e
  WHERE e.slug = 'skylent-demo-employer'
     OR e.name = 'Skylent Demo Employer'
);
