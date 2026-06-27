# Concrete Team Tasks Based On Verified Code State

## Summary

This plan converts vague "confirm/check" items into clear pass/fail tasks.
Anything already correct is marked as `No task`. Anything wrong or risky becomes
a specific task with an owner.

Current verified facts:

- Auth does not use NextAuth.
- Auth does not store JWT tokens in localStorage/sessionStorage.
- Auth uses backend `/users/me` through React Query.
- Axios has `withCredentials: true`.
- Server auth lookup forwards cookies to `/users/me`.
- Frontend build is currently blocked.
- Some old/mock frontend services still use localStorage.
- Some frontend services bypass the shared API client and call relative `/api/...`.
- Reviews backend is not implemented, even though routes exist.
- Admin dashboard frontend is owned by `FE5`.
- `FE5` is the same developer/person as `BE1`, but the responsibilities are separated:
  - `BE1` = backend auth/users/security.
  - `FE5` = frontend admin dashboard.

## Team Ownership

| Owner | Area |
| --- | --- |
| FE1 | Authentication, layouts, localization |
| FE2 | Learner experience |
| FE3 | Tutor dashboard |
| FE4 | Chat and AI experiences |
| FE5 | Admin dashboard frontend |
| BE1 | Authentication, users, security backend |
| BE2 | Tutor profiles, subjects, discovery backend |
| BE3 | Bookings, payments, reviews backend |
| BE4 | Chat, notifications, AI services backend |

## FE1 - Auth, Layouts, Localization

### No Task: Auth Storage Pattern

Verified:

- No active `next-auth`, `useSession`, `signIn`, or `signOut` usage found.
- No auth token is stored in localStorage/sessionStorage.
- `useCurrentUser()` calls `/users/me`.
- Login/register use backend mutations.
- Axios uses `withCredentials: true`.

Decision:

- FE1 should not rewrite auth right now.

### Task FE1-1: Improve Auth Guard Redirect Behavior

Problem:

- `AuthGuard` redirects unauthenticated users to login with `next`.
- `ServerAuthGuard` redirects unauthenticated users to login without preserving `next`.

Required fix:

- Update server-side protected redirects to include the originally requested path when possible.
- Keep client-side `AuthGuard` behavior as-is.

Acceptance criteria:

- Opening a protected page while logged out sends user to `/en/login?next=...`.
- After login, user returns to the originally requested page.
- No token storage is introduced.

### Task FE1-2: Finish/Hide Broken Shared Navigation Links

Problem:

- Login page links to `/privacy`, `/terms`, `/help`.
- If these pages do not exist, users can hit 404s from auth screens.

Required fix:

- Either create simple placeholder pages or remove/hide these links until routes exist.

Acceptance criteria:

- No visible auth-page link leads to a 404.

### Task FE1-3: Localization Cleanup For Auth Pages

Problem:

- Login/register pages still have hardcoded English text.

Required fix:

- Move visible auth page strings into the existing i18n message files.

Acceptance criteria:

- Login/register visible text comes from translations.
- English still renders correctly.
- Arabic keys exist, even if copy is basic.

## FE2 - Learner Experience

### Task FE2-1: Fix Frontend Build Blocker

Problem:

- `booking/[bookingId]/page.tsx` calls `cancelBooking(bookingId, cancelReason)`.
- Current `cancelBooking` service accepts only `bookingId`.

Required fix:

- If backend supports cancel reason, update `cancelBooking` service to send `{ cancelReason }`.
- If backend does not support cancel reason, remove the second argument and stop storing/sending the reason.

Recommended default:

- Send `{ cancelReason }` if backend validator allows it.

Acceptance criteria:

- `npm run build --workspace apps/web` passes this booking error.
- Cancel booking works from browser.

### Task FE2-2: Fix Learner Dashboard Booking Type

Problem:

- Learner dashboard references `booking.confirmationCode`, but the frontend `Booking` type does not contain that field.

Required fix:

- Either add `confirmationCode` to the correct booking type if backend returns it, or remove the UI usage if backend does not return it.

Acceptance criteria:

- Dashboard typecheck passes.
- Confirmation code is displayed only when real API data contains it.

### Task FE2-3: Replace Relative Booking API Calls

Problem:

- Several booking services use `fetch("/api/...")`, which calls the Next.js app, not necessarily the Express API.

Files found:

- `bookingService.ts`
- `bookingDetailsService.ts`
- `getMyBookingService.ts`
- `getSubjectTitleService.ts`
- `getTutorNameService.ts`
- `slots-service.ts`

Required fix:

- Replace relative `fetch("/api/...")` calls with the shared axios client from `@/lib/axios`.
- Keep `withCredentials` behavior through the shared client.

Acceptance criteria:

- Booking services all call Express through `NEXT_PUBLIC_API_BASE_URL`.
- No learner booking flow depends on Next.js `/api` routes unless those routes intentionally exist.

### Task FE2-4: Remove Old LocalStorage Chat Service From Learner Flow

Problem:

- `services/message/message-service.ts` still stores mock chat/messages in localStorage.
- FE4 already has real chat services, so this old service is dangerous if any learner page still imports it.

Required fix:

- Check imports of `message-service.ts`.
- If unused, remove it.
- If used, replace usage with FE4 real chat services.

Acceptance criteria:

- No active learner chat page uses localStorage chat data.
- Chat history comes from backend REST and Socket.IO only.

### Task FE2-5: Replace Payment History LocalStorage With Real API Or Mark Mock

Problem:

- `payment-history-service.ts` stores transactions in localStorage.

Required fix:

- If backend payment history endpoint exists, connect it.
- If not, clearly mark payment history as mock/demo-only and hide it from serious demo flow.

Acceptance criteria:

- Team knows whether payment history is real or mock.
- No one presents localStorage payment history as backend-integrated.

## FE3 - Tutor Dashboard

### Task FE3-1: Normalize Tutor Route Naming

Problem:

- Tutor routes use mixed casing and duplicate concepts:
  - `tutor/CreateProfile`
  - `tutor/profile/create`
  - `tutor/tutorReviews`
  - `tutor/(protected)/profile/edit`

Required fix:

- Use lowercase route names.
- Keep one profile creation route.
- Redirect or remove duplicate route.

Recommended default:

- Keep `/en/tutor/profile/create`.
- Keep `/en/tutor/profile/edit`.
- Rename `tutorReviews` to a lowercase route if it remains.

Acceptance criteria:

- Tutor routes are predictable and lowercase.
- No duplicate profile creation page exists.

### Task FE3-2: Verify Tutor Pages Use Real Backend Services

Problem:

- Tutor profile services mostly use the shared API client, but tutor dashboard pages still need a full integration pass.

Required fix:

- Check tutor dashboard, profile create/edit, subject, availability, payment, and reviews pages.
- Replace mock or hardcoded data in demo-critical pages.

Acceptance criteria:

- Tutor can create/edit profile.
- Tutor can add/edit/delete subjects.
- Tutor can manage availability.
- Any mock-only page is clearly labeled or hidden.

## FE4 - Chat & AI Experiences

### No Task: Socket Send Timeout

Verified:

- `use-chat-socket.ts` already uses `emitWithAck().timeout(8000)` for message send and receipt events.

Decision:

- No work needed for the previous hanging Socket.IO send issue.

### No Task: Socket Cookie Auth

Verified:

- Socket.IO client uses `withCredentials: true`.
- It does not use bearer tokens or localStorage tokens.

Decision:

- No auth rewrite needed for socket connection.

### Task FE4-1: Fix Socket Path For Path-Prefixed API Deployments

Problem:

- `chat-socket.ts` parses `NEXT_PUBLIC_API_BASE_URL`, but always sets Socket.IO path to `/socket.io`.
- If the API is deployed behind a path prefix, Socket.IO may connect to the wrong path.

Required fix:

- Derive socket path from the API base URL pathname.
- If base URL is `http://host/api`, socket path should be `/api/socket.io`.
- If base URL has no path, socket path should remain `/socket.io`.

Acceptance criteria:

- Local `http://localhost:4000/api` still works.
- Path-prefixed deployment works.

### Task FE4-2: Keep AI Design Work Separate From Stability Work

Problem:

- AI UI design needs improvement, but current priority is stability.

Required action:

- Do not start a major redesign until build is green.
- Only fix AI bugs that affect functionality.

Acceptance criteria:

- AI remains usable.
- Redesign branch does not mix with build fixes.

## FE5 - Admin Dashboard Frontend

### Task FE5-1: Do Not Start Admin Until Core Build Is Green

Problem:

- Frontend build is currently blocked.
- Admin dashboard should not be built on top of an unstable frontend.

Required action:

- Wait until the frontend build passes.
- Do not merge admin dashboard work before learner/tutor core flows are stable.

Acceptance criteria:

- `npm run build --workspace apps/web` passes before admin PR merge.

### Task FE5-2: Define Admin Dashboard Pages Before Building

Required admin pages:

- Admin overview
- User management
- Tutor management
- Booking management
- Payment reporting

Required action:

- Create a small route/page plan before implementation.
- Use backend APIs from BE1, BE2, and BE3 only after their contracts are clear.

Acceptance criteria:

- Admin frontend does not guess backend response shapes.
- Missing backend endpoints are listed before FE5 starts building UI.

### Task FE5-3: Keep FE5 Work Separate From BE1 Work

Problem:

- FE5 and BE1 are the same person, but frontend and backend changes should stay reviewable.

Required action:

- Use separate branches:
  - `BE1/...` for backend auth/users/security.
  - `FE5/...` for admin dashboard frontend.

Acceptance criteria:

- Admin frontend PRs do not contain unrelated backend auth changes.
- BE1 backend PRs do not contain unrelated admin UI changes.

## BE1 - Auth, Users, Security

### Task BE1-1: Fix Logout Cookie Clearing If Needed

Problem:

- Backend sets cookies with environment-aware options.
- Logout must clear cookies with matching options, especially in production.

Required fix:

- Ensure logout uses the same cookie option shape used when setting auth cookies.

Acceptance criteria:

- Logout clears access and refresh cookies in development.
- Logout clears access and refresh cookies in production-like `secure`/`sameSite` settings.

### Task BE1-2: Verify Become-Tutor Role Refresh Behavior

Problem:

- If a learner becomes a tutor, the existing token/cookie may still contain the old role depending on JWT payload behavior.

Required fix:

- After role change, either issue fresh auth cookies or document that user must refresh/login again.
- Recommended default: issue fresh cookies after successful role change.

Acceptance criteria:

- User can access tutor routes immediately after becoming tutor.

### Task BE1-3: Provide Admin Backend API Contract To FE5

Problem:

- FE5 cannot build admin dashboard safely without stable backend contracts.

Required action:

- Document existing admin-capable APIs.
- Identify missing APIs for:
  - users
  - tutors
  - bookings
  - payments

Acceptance criteria:

- FE5 knows exactly which admin APIs are ready and which are missing.

## BE2 - Tutor Profiles, Subjects, Discovery

### Task BE2-1: Implement Public Tutor Listing API

Problem:

- Current tutor routes expose profile by tutor id and tutor-owned profile/subjects/availability operations.
- A complete public listing/search/filter endpoint was not found.

Required fix:

- Add public tutor listing endpoint with pagination, search, filters, and sorting.

Minimum API:

- `GET /api/tutors`
- Query: `page`, `limit`, `query`, `category`, `educationLevel`, `curriculum`, `language`, `maxHourlyRate`, `sort`

Acceptance criteria:

- FE2 can build tutor discovery without mock data.
- Response includes tutor profile summary and matched subjects.
- Pagination shape is documented.

### Task BE2-2: Define Tutor Identifier Contract

Problem:

- Frontend has had confusion between `tutorId`, `userId`, and `tutorProfileId`.

Required fix:

- Document which id is used for:
  - public profile route
  - booking request
  - chat creation
  - AI recommendation card
  - frontend tutor card link

Acceptance criteria:

- FE2 and FE4 use the same id fields consistently.

### Task BE2-3: Provide Admin Tutor API Contract To FE5

Problem:

- Admin dashboard needs tutor management screens.

Required action:

- Tell FE5 whether admin tutor management APIs exist.
- If missing, create backend tasks before FE5 builds those screens.

Acceptance criteria:

- FE5 does not build tutor admin UI against guessed APIs.

## BE3 - Bookings, Payments, Reviews

### Task BE3-1: Confirm And Document Booking Cancel Body

Problem:

- Frontend tries to send a cancel reason, but the service currently sends an empty body.

Required fix:

- Decide and document whether cancel booking accepts `cancelReason`.
- Update validator/controller/service if needed.

Recommended default:

- Support optional `cancelReason`.

Acceptance criteria:

- FE2 can call cancel booking with one stable payload.
- OpenAPI/Postman docs show the correct body.

### Task BE3-2: Implement Reviews Backend

Problem:

- Review routes exist, but controller/service are TODO-only and do not send real responses.

Required fix:

- Implement:
  - create review
  - list tutor reviews
  - list my reviews
  - update review
  - delete/hide review
  - rating recalculation

Business rules:

- Learner can review only their own completed booking.
- One review per booking.
- Tutor aggregate rating updates after create/update/delete.

Acceptance criteria:

- Review endpoints return real JSON responses.
- Invalid review attempts return correct 4xx errors.
- FE2 can build review UI against real API.

### Task BE3-3: Review Payment Transaction Safety

Problem:

- Payment flow has a transaction/session pattern, but repository calls may not all use the session.

Required fix:

- Ensure booking/payment/earning writes that must be atomic share the Mongoose session.
- If not possible, document compensation behavior.

Acceptance criteria:

- Failed checkout setup does not leave inconsistent booking/payment state.
- Webhook remains idempotent.

### Task BE3-4: Provide Admin Booking/Payment API Contract To FE5

Problem:

- Admin dashboard includes booking management and payment reporting.

Required action:

- Tell FE5 which booking/payment reporting APIs exist.
- Identify missing reporting endpoints before FE5 builds admin reporting pages.

Acceptance criteria:

- FE5 does not build admin booking/payment screens against guessed APIs.

## BE4 - Chat, Notifications, AI Services

### Task BE4-1: Verify Notification Active-Chat Rule With Test

Problem:

- Notification backend exists, but active-chat suppression must be proven with manual test.

Required test:

- Learner and tutor join same chat.
- Send message.
- Confirm message arrives.
- Confirm no notification record is created if recipient is active in that chat.
- Then leave chat and send again.
- Confirm notification record is created.

Acceptance criteria:

- Behavior matches intended rule.
- If behavior does not match, fix notification creation logic.

### Task BE4-2: Document AI Fallback Limitations

Problem:

- Without OpenAI, backend fallback can reply, but free-text preference extraction is limited.
- Recommendations depend mainly on structured criteria.

Required fix:

- Add documentation explaining:
  - what works without OpenAI
  - what requires OpenAI
  - what fields frontend should send for reliable recommendations

Acceptance criteria:

- FE4 and QA know how to test AI with and without API key.

## Project-Wide Required Tasks

### Task ALL-1: Clean Main Before More Work

Problem:

- Current `main` has an uncommitted modified dashboard file.

Required fix:

- Move the change to a feature branch, commit it intentionally, or discard it if unwanted.

Acceptance criteria:

- `git status --short --branch` on `main` is clean.

### Task ALL-2: Restore Green Frontend Build

Problem:

- Frontend build currently fails.

Required fix:

- FE2 owns the current booking/dashboard TypeScript blockers.
- No new feature PR should merge before this is fixed.

Acceptance criteria:

- `npm run build --workspace apps/web` passes.

### Task ALL-3: Standardize API Client Usage

Problem:

- Some frontend services use shared axios.
- Some use raw relative `fetch("/api/...")`.

Required fix:

- Demo-critical frontend services must use `@/lib/axios`.

Acceptance criteria:

- Auth, booking, payment, tutor, chat, and AI services all call the same backend base URL strategy.

### Task ALL-4: Add A Team PR Checklist

Required checklist:

- Does build pass?
- Does lint pass or are failures documented?
- Does this branch modify only owned area?
- Does this feature use real API or clearly marked mock?
- Are API changes documented?
- Are manual test steps included?
- Is `main` clean before starting?

## Priority Order

1. Clean `main`.
2. Fix frontend build.
3. Fix booking cancel contract.
4. Replace relative booking/payment API calls.
5. Complete tutor discovery API.
6. Connect learner discovery to real API.
7. Implement reviews backend or remove reviews from demo scope.
8. Stabilize tutor dashboard routes.
9. Define admin dashboard backend contracts for FE5.
10. Start FE5 admin dashboard only after build and core flow stability.
11. Verify chat/notification/AI edge cases.
12. Add PR checklist and enforce ownership.

## Assumptions

- The immediate goal is a stable demo, not new feature expansion.
- FE4 remains owner of frontend chat and AI.
- FE5 owns admin dashboard frontend.
- FE5 and BE1 are the same person, but work should be separated by branch and PR.
- Notification center remains FE1.
- Reviews are not complete until BE3 implements real service/controller responses.
- Admin dashboard should wait until learner/tutor core flow is stable.
