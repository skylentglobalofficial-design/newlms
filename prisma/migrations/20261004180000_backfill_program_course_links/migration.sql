-- Restore programme → course links that enrolment and the public catalogue require.
-- Existing rows are left in place. This does not delete curriculum or learner progress.
INSERT INTO "ProgramCourse" ("id", "programId", "courseId", "sortOrder", "createdAt", "updatedAt")
SELECT gen_random_uuid(), p."id", c."id", v.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
    ('data-analytics-pro', 'data-analytics', 0),
    ('data-science-ai', 'data-analytics', 0),
    ('data-science-ai', 'python-programming', 1),
    ('full-stack', 'full-stack-web', 0),
    ('generative-ai-program', 'generative-ai', 0),
    ('product-management', 'product-management', 0)
) AS v(program_slug, course_slug, sort_order)
JOIN "Program" p ON p."slug" = v.program_slug
JOIN "Course" c ON c."slug" = v.course_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM "ProgramCourse" existing
  WHERE existing."programId" = p."id"
    AND existing."courseId" = c."id"
);
