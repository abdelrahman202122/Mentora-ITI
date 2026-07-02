# Frontend Page Polish Plan

Goal: clean Mentora page by page for localization, responsive behavior, RTL/LTR layout, reusable shadcn-style components, and visual consistency.

## Rules

- Use one implementation branch per page or tightly related page group.
- Do not mix feature work with UI/localization cleanup.
- Mark a page `Done` only after English, Arabic, mobile, and desktop manual checks pass.
- Prefer shared components from `apps/web/src/components/ui`.

## Phase 1 - Shared Foundations

| Status | Area | Routes / Files | Goal |
|---|---|---|---|
| Done | App layouts | `/[locale]`, root layout, locale layout | Ensure `lang`, `dir`, fonts, spacing, and Arabic font apply from first render. |
| Done | Header | Home/header shared component | Fix responsive nav, language switcher behavior, Become Mentor flow labels, RTL spacing. |
| Done | Sidebar | Learner/tutor sidebar, nav links, notification bell area | Fix mobile/collapsed behavior, active states, RTL alignment, reusable button/link patterns. |
| Pending | Shared empty/loading/error states | Shared components where useful | Create or standardize small reusable states before repeating page work. |

## Phase 2 - Public And Auth Pages

| Status | Page | Route |
|---|---|---|
| Done | Home | `/en`, `/ar` |
| Done | Login | `/en/login`, `/ar/login` |
| Done | Register | `/en/register`, `/ar/register` |
| Done | Forgot password | `/en/forgot-password`, `/ar/forgot-password` |
| Done | Reset password | `/en/reset-password`, `/ar/reset-password` |
| Done | Help | `/en/help`, `/ar/help` |
| Done | Privacy | `/en/privacy`, `/ar/privacy` |
| Done | Terms | `/en/terms`, `/ar/terms` |

## Phase 3 - Learner Core Flow

| Status | Page | Route |
|---|---|---|
| Done | Learner dashboard | `/en/dashboard`, `/ar/dashboard` |
| Done | Find tutor flow | `/en/find-tutor`, `/ar/find-tutor` |
| Done | Legacy FindTutor redirect/cleanup | `/en/FindTutor`, `/ar/FindTutor` |
| Done | Tutor match list | `/en/tutor-match`, `/ar/tutor-match` |
| Done | Tutor profile/details | `/en/tutor-match/[id]`, `/ar/tutor-match/[id]` |
| Done | Booking create | `/en/booking`, `/ar/booking` |
| Done | Booking details | `/en/booking/[bookingId]`, `/ar/booking/[bookingId]` |
| Done | Payment checkout/mock cleanup | `/en/payment`, `/ar/payment` |
| Done | Payment success | `/en/payment/success`, `/ar/payment/success` |
| Done | Payment history list | `/en/paymentHistory`, `/ar/paymentHistory` |
| Done | Payment history detail | `/en/paymentHistory/[paymentId]`, `/ar/paymentHistory/[paymentId]` |
| Done | Settings | `/en/settings`, `/ar/settings` |

## Phase 4 - Chat, AI, Notifications

| Status | Page / Surface | Route |
|---|---|---|
| Done | AI assistant | `/en/ai-assistant`, `/ar/ai-assistant` |
| Done | Learner messages list | `/en/messages`, `/ar/messages` |
| Done | Learner conversation | `/en/messages/[id]`, `/ar/messages/[id]` |
| Done | Tutor messages list | `/en/tutor/messages`, `/ar/tutor/messages` |
| Done | Tutor conversation | `/en/tutor/messages/[id]`, `/ar/tutor/messages/[id]` |
| Done | Notification panel | Sidebar notification bell |

## Phase 5 - Tutor Pages

| Status | Page | Route |
|---|---|---|
| Done | Create tutor profile | `/en/tutor/profile/create`, `/ar/tutor/profile/create` |
| Done | Tutor dashboard | `/en/tutor/dashboard`, `/ar/tutor/dashboard` |
| Done | Tutor availability | `/en/tutor/availability`, `/ar/tutor/availability` |
| Done | Edit tutor profile | `/en/tutor/profile/edit`, `/ar/tutor/profile/edit` |
| Done | Tutor earnings/payment | `/en/tutor/payment`, `/ar/tutor/payment` |
| Done | Tutor reviews | `/en/tutor/reviews`, `/ar/tutor/reviews` |

## Phase 6 - Admin Pages

| Status | Page | Route |
|---|---|---|
| Done | Admin dashboard | `/en/admin`, `/ar/admin` |
| Done | Admin users | `/en/admin/users`, `/ar/admin/users` |
| Done | Admin tutors | `/en/admin/tutors`, `/ar/admin/tutors` |
| Done | Admin bookings | `/en/admin/bookings`, `/ar/admin/bookings` |
| Done | Admin finance | `/en/admin/finance`, `/ar/admin/finance` |
| Done | Admin reviews | `/en/admin/reviews`, `/ar/admin/reviews` |

## Per-Page Definition Of Done

- English visible copy is correct.
- Arabic visible copy is present and directionally correct.
- Mobile and desktop layouts do not overflow.
- Icons, input padding, and alignment mirror correctly in RTL.
- Loading, empty, error, and disabled states are present when relevant.
- Duplicated/custom UI is replaced with shared components where practical.
- `npm run build --workspace apps/web` passes.
