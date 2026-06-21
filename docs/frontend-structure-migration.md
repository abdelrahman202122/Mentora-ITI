# Frontend Structure Migration Guide

This guide explains the frontend reorganization on branch
`FE1/fix-frontend-folder-structure` and how to integrate it without losing work.

The migration does not intentionally redesign feature behavior. Its main goals
are to keep routes inside `app`, place reusable code in layer folders, use
consistent domain grouping, and standardize filenames.

## Target Structure

```text
apps/web/src/
|-- app/                    # Next.js routes and route layouts only
|   |-- layout.tsx
|   `-- [locale]/
|       |-- (auth)/
|       |-- (learner)/
|       `-- tutor/
|-- components/
|   |-- auth/
|   |-- i18n/
|   |-- learner/
|   |-- tutor/
|   `-- ui/
|-- hooks/
|   `-- auth/
|-- i18n/
|-- lib/                    # Configured infrastructure and shadcn helpers
|-- mocks/
|-- providers/
|-- schemas/
|   `-- auth/
|-- services/
|   |-- ai/
|   |-- auth/
|   |-- booking/
|   |-- message/
|   `-- tutor/
|-- types/
|   |-- ai/
|   |-- auth/
|   `-- tutor/
`-- utils/
    |-- auth/
    `-- i18n/
```

`public/data` remains in `public` because those JSON files are fetched through
public URLs. `providers` remains separate because providers are application
infrastructure rather than reusable UI.

## Route Changes

All application routes are localized.

| Previous source path | New source path | Browser URL |
| --- | --- | --- |
| `app/(auth)/login/page.tsx` | `app/[locale]/(auth)/login/page.tsx` | `/{locale}/login` |
| `app/(auth)/register/page.tsx` | `app/[locale]/(auth)/register/page.tsx` | `/{locale}/register` |
| `app/pages/learner/dashboard/page.tsx` | `app/[locale]/(learner)/dashboard/page.tsx` | `/{locale}/dashboard` |
| `app/pages/learner/messages/page.tsx` | `app/[locale]/(learner)/messages/page.tsx` | `/{locale}/messages` |
| `app/pages/learner/messages/[id]/page.tsx` | `app/[locale]/(learner)/messages/[id]/page.tsx` | `/{locale}/messages/{id}` |
| `app/pages/learner/tutor-match/page.tsx` | `app/[locale]/(learner)/tutor-match/page.tsx` | `/{locale}/tutor-match` |
| `app/pages/learner/tutor-match/[id]/page.tsx` | `app/[locale]/(learner)/tutor-match/[id]/page.tsx` | `/{locale}/tutor-match/{id}` |
| `app/pages/learner/ai-assistant/page.tsx` | `app/[locale]/(learner)/ai-assistant/page.tsx` | `/{locale}/ai-assistant` |
| `app/[locale]/(tutor)/tutorDashboard/page.tsx` | `app/[locale]/tutor/dashboard/page.tsx` | `/{locale}/tutor/dashboard` |
| `app/[locale]/(tutor)/editTouterProfile/page.tsx` | `app/[locale]/tutor/profile/edit/page.tsx` | `/{locale}/tutor/profile/edit` |

The learner route group intentionally remains `(learner)`, so `learner` does
not appear in learner URLs. Tutor pages intentionally use the visible `tutor`
segment to avoid collisions with learner pages.

The old `app/Home` route and unused `app/[locale]/tutors` mock route were
removed. The localized home route is `app/[locale]/page.tsx`.

## Module Path Changes

Use these new paths when resolving conflicts or adding imports.

| Old path | New path |
| --- | --- |
| `components/auth/auth-guard.tsx` | `components/auth/AuthGuard.tsx` |
| `components/auth/guest-guard.tsx` | `components/auth/GuestGuard.tsx` |
| `app/[locale]/html-lang.tsx` | `components/i18n/HtmlLang.tsx` |
| `app/[locale]/component/*` | `components/tutor/*` |
| `hooks/use-auth.ts` | `hooks/auth/use-auth.ts` |
| `lib/api/auth.ts` | `services/auth/auth-service.ts` |
| `lib/api/ai.ts` | `services/ai/ai-service.ts` |
| `lib/api/booking.ts` | `services/booking/booking-service.ts` |
| `lib/api/messages.ts` | `services/message/message-service.ts` |
| `lib/api/tutors.ts` | `services/tutor/tutor-service.ts` |
| `app/[locale]/services/getTutorProfile.ts` | `services/tutor/tutor-profile-service.ts` |
| `lib/mockData.ts` | `mocks/mock-data.ts` |
| `lib/schemas.ts` | `schemas/auth/auth-schema.ts` |
| `types/auth.ts` | `types/auth/auth-types.ts` |
| `types/ai.ts` | `types/ai/ai-types.ts` |
| `app/[locale]/tutorTypes/profile.ts` | `types/tutor/tutor-profile.ts` |
| `lib/safe-redirect.ts` | `utils/auth/safe-redirect.ts` |
| `lib/locale-path.ts` | `utils/i18n/locale-path.ts` |
| `providers/query-provider.tsx` | `providers/QueryProvider.tsx` |

## Naming Rules

- Custom React components and providers use PascalCase filenames, such as
  `AuthGuard.tsx` and `QueryProvider.tsx`.
- Services use `*-service.ts`.
- Types use `*-types.ts`.
- Schemas use `*-schema.ts`.
- Hooks, utilities, and mocks use kebab-case.
- Next.js special files remain `page.tsx` and `layout.tsx`.
- shadcn files under `components/ui` remain lowercase to match its conventions.
- Domain directories use singular names: `booking`, `message`, and `tutor`.

Imports are case-sensitive in Linux CI even when they work on Windows. Always
copy the exact casing from the target path.

## Safe Integration Workflow

Do not ask every frontend developer to merge the structure branch into their
branch at the same time. Integrate it centrally, then migrate developer branches
one at a time.

### Team Lead

1. Temporarily pause frontend merges to `main`.
2. Make sure every developer commits and pushes their current work.
3. Merge `FE1/fix-frontend-folder-structure` into `main` through one pull
   request.
4. Run lint and build on the updated `main`.
5. Ask one developer at a time to merge the updated `main` into their feature
   branch.
6. Review and merge that developer's branch before starting the next one.

This serial approach prevents three branches from introducing three different
versions of the old structure.

### Each Developer

Run these commands from the repository root. Replace the example branch names
with the real branch name.

```powershell
git status
git add <only-your-files>
git commit -m "Save frontend work before structure migration"
git push

git branch backup/<your-branch>-before-structure
git fetch origin
git merge origin/main
```

Use a backup branch even when the work is already pushed. Do not use
`git reset --hard`, and do not begin this migration with uncommitted work.

For this team, a normal merge is safer than rebasing because it does not rewrite
the developer's existing commits.

## Resolving Common Conflicts

### File Modified by Developer but Moved by Migration

This is the most likely conflict.

1. Find the destination in the path tables above.
2. Open both versions of the file.
3. Apply the developer's actual feature changes to the file at the **new** path.
4. Keep imports that point to the new structure.
5. Remove the old path if Git still shows it.
6. Stage both sides of the resolution.

```powershell
git add apps/web/src/<new-path>
git rm apps/web/src/<old-path>
```

Do not solve this conflict by restoring the old directory.

### Modify/Delete Conflict

If Git reports that one branch modified a file that the migration deleted,
first check whether the file was moved.

- If it was moved, transfer the feature changes to the new destination.
- If it was genuinely removed (`app/Home` or `[locale]/tutors`), do not restore
  the obsolete route. Move any still-needed UI into the correct current route
  or component.

### Import Conflict

Keep the developer's required imported symbols, but use the new module path.

Example:

```ts
// Old
import { getTutors } from "@/lib/api/tutors";

// New
import { getTutors } from "@/services/tutor/tutor-service";
```

### Case-Only Conflict on Windows

Do not keep both `auth-guard.tsx` and `AuthGuard.tsx`. The final file must be
`AuthGuard.tsx`, and imports must use the same casing. Duplicate case variants
often pass locally on Windows and fail in Linux CI.

### Route Conflict

Keep the page under its new localized route. Preserve the developer's page
content, but do not recreate `app/pages`, unlocalized auth routes, `Home`, or the
old tutor route group.

## Conflict Rules

- Never accept `ours` or `theirs` for the entire `apps/web/src` directory.
- Never restore a removed directory just to make an import compile.
- Never keep duplicate old and new files.
- Preserve feature behavior from the developer branch and path organization
  from the migration branch.
- Resolve and validate one feature area at a time.
- Ask the team lead before guessing when both branches changed behavior in the
  same function.

## Validation Checklist

After resolving conflicts, run:

```powershell
cd apps/web
npm run lint
npm run build
```

The current baseline is:

- Build passes.
- Lint has zero errors.
- Three known warnings remain in tutor profile code: an unoptimized `<img>`, a
  missing `alt`, and an unused `tutorId` parameter.

Then manually verify these URLs:

```text
/en/login
/en/register
/en/dashboard
/en/messages
/en/tutor-match
/en/ai-assistant
/en/tutor/dashboard
/en/tutor/profile/edit
```

Repeat with `/ar` for localized routing where the page supports Arabic.

Before pushing, confirm the old structures were not recreated:

```powershell
rg --files apps/web/src/app/pages
rg --files apps/web/src/app/Home
rg -n "@/lib/api|@/lib/mockData|@/hooks/use-auth" apps/web/src
```

These commands should return no results. Finally:

```powershell
git status
git diff --check
git add <resolved-files>
git commit -m "Integrate frontend structure migration"
git push
```

## Adding New Frontend Code

- Add routes only under `app/[locale]` unless the route is intentionally global.
- Add reusable UI under `components/<domain>`.
- Add server-state/API functions under `services/<domain>`.
- Add React Query or reusable hooks under `hooks/<domain>`.
- Add validation schemas under `schemas/<domain>`.
- Add shared types under `types/<domain>`.
- Add pure helpers under `utils/<domain>`.
- Keep configured clients and framework helpers in `lib`.
- Do not create a new `features` tree or place components/services/types inside
  `app`.

The migration is complete only when the app builds, routes work, and no old path
has been recreated.
