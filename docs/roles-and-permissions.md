# Skylent — Roles and Permissions

## Role Hierarchy

| Role | Database Value | Priority | Default |
|------|----------------|----------|---------|
| Super Admin | `ADMIN` | 1 (highest) | Created via `bootstrap:superadmin` |
| Organisation Admin | `ORGANISATION_ADMIN` | 2 | Manual assignment |
| Recruiter | `RECRUITER` | 3 | Manual assignment |
| Faculty | `FACULTY` | 4 | Manual assignment |
| Student | `STUDENT` | 5 (lowest) | All signups |

Users can have multiple roles. The `primaryRole()` function returns the highest-priority role for UI display.

## Permission Matrix

### Public (No Authentication)

| Resource | Read | Write |
|----------|------|-------|
| Catalogue (courses, programmes) | ✅ | ❌ |
| Course/programme detail | ✅ | ❌ |
| Public job listings | ✅ | ❌ |
| Certificate verification | ✅ | ❌ |
| Enquiry submission | ❌ | ✅ |

### Student Role

| Resource | Read | Write |
|----------|------|-------|
| Own enrolments | ✅ | ✅ (enrol only) |
| Enrolled course content | ✅ | ❌ |
| Own lesson progress | ✅ | ✅ |
| Own quiz attempts | ✅ | ✅ |
| Own assignments | ✅ | ✅ |
| Own certificates | ✅ | ✅ (claim) |
| Career profile | ✅ | ✅ |
| Job listings | ✅ | ❌ |
| Own job applications | ✅ | ✅ |
| Own saved jobs | ✅ | ✅ |
| Labs and projects | ✅ | ✅ |

### Faculty Role

| Resource | Read | Write |
|----------|------|-------|
| Assigned courses | ✅ | ✅ |
| Student submissions (assigned) | ✅ | ❌ |
| Practice workspaces (assigned) | ✅ | ✅ |

### Recruiter Role

| Resource | Read | Write |
|----------|------|-------|
| Own employer profile | ✅ | ✅ |
| Own employer's jobs | ✅ | ✅ |
| Applications to own jobs | ✅ | ✅ |
| Shared student profiles | ✅ | ❌ |

### Admin Role (Super Admin)

| Resource | Read | Write |
|----------|------|-------|
| All courses and programmes | ✅ | ✅ |
| All users | ✅ | ✅ |
| All enrolments | ✅ | ✅ |
| All employers | ✅ | ✅ |
| All jobs | ✅ | ✅ |
| Practice workspaces | ✅ | ✅ |
| Media administration | ✅ | ✅ |

## Backend Enforcement

### Middleware Guards

```typescript
// server/src/lib/auth.ts

// Requires valid session
export async function requireAuth(req, res, next)

// Requires CSRF token match
export function requireCsrf(req, res, next)

// server/src/lib/roles.ts

// Requires specific role(s)
export function requireRoles(...roles)
```

### Route Protection Patterns

```typescript
// Public route
router.get("/catalog/courses", handler)

// Authenticated route
router.get("/lms/dashboard", requireAuth, handler)

// Authenticated + CSRF (mutations)
router.post("/lms/enrollments", requireAuth, requireCsrf, handler)

// Role-restricted
router.get("/admin/users", requireAuth, requireRoles("superadmin"), handler)

// Multiple roles allowed
router.get("/dashboard/admin", requireAuth, requireRoles("superadmin"), handler)
```

### Object-Level Authorization

Beyond role checks, routes verify ownership:

```typescript
// LMS routes check enrollment ownership
const enrollment = await requireEnrollment(userId, courseId)
if (!enrollment) return res.status(403).json({ error: "Not enrolled" })

// Career routes check profile ownership
const profile = await prisma.careerProfile.findUnique({
  where: { userId: req.auth.user.id }
})

// Employer routes check membership
const membership = await prisma.employerMembership.findUnique({
  where: { userId_employerId: { userId, employerId } }
})
```

## Frontend Guards

### Route Guards

```tsx
// src/components/routing/RoleRouteGuard.tsx

<Route
  path="/dashboard/admin"
  element={
    <RoleRouteGuard allowedRoles={['superadmin']}>
      <DashboardAdminPage />
    </RoleRouteGuard>
  }
/>
```

### UI Conditional Rendering

```tsx
// Hide admin actions from non-admins
{user?.roles.includes('superadmin') && (
  <AdminPanel />
)}
```

**Important:** UI hiding is not security. Backend always validates.

## Security Considerations

1. **Session Security**
   - Cookies are `httpOnly` (no JS access)
   - `Secure` flag in production
   - 30-day expiry
   - CSRF double-submit protection

2. **Role Escalation Prevention**
   - Users cannot assign roles to themselves
   - Role creation requires Admin
   - `ensureRole()` only creates missing Role records, not UserRole

3. **Data Isolation**
   - Queries always include `userId` filter for user-owned data
   - Enrollment checks prevent cross-user course access
   - Employer membership gates employer data access

## Creating an Admin User

```bash
SUPERADMIN_EMAIL=admin@example.com \
SUPERADMIN_PASSWORD='secure-password-here' \
SUPERADMIN_NAME='Admin Name' \
npm run bootstrap:superadmin
```

This script (`scripts/bootstrap-superadmin.ts`):
- Creates user if email doesn't exist
- Promotes existing user to ADMIN role
- Idempotent (safe to run multiple times)
