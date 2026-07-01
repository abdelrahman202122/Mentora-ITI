# Mentora Manual Test Scenarios

Use this checklist when opening the website and testing feature by feature. Each developer should report issues with:

```txt
Page:
Steps:
Expected:
Actual:
Screenshot/Video:
Console error:
Network error:
Browser:
User role:
```

## Global Setup

Test with these roles:

- Logged out user
- Learner
- Tutor
- Admin, if admin dashboard is ready

Use two browsers or incognito windows when testing chat and notifications:

- Browser 1: learner
- Browser 2: tutor

Test both locales:

- `/en`
- `/ar`

## 1. Public Website

Routes to test:

```txt
/en
/ar
/en/login
/en/register
/en/find-tutor
/ar/find-tutor
/en/ai-assistant
/ar/ai-assistant
```

Scenarios:

1. Open home page.
   - Expected: page loads without 404.
   - Header is responsive on desktop/mobile.
   - Buttons navigate correctly.
   - No console errors.

2. Test language switching.
   - Expected: English pages show English.
   - Arabic pages show Arabic.
   - Arabic layout is RTL.
   - Fonts and spacing look correct.

3. Click "Find Tutor".
   - Expected: goes to Find Tutor flow.
   - No 404.
   - Filters/steps work.

4. Click "Become a mentor".
   - Logged out: should go to login with `next` pointing to tutor profile create.
   - Logged in learner: should go to tutor profile create.
   - Existing tutor: button should disappear or not send them to create again.

## 2. Authentication

Routes:

```txt
/en/register
/en/login
/ar/register
/ar/login
```

Register scenarios:

1. Submit empty form.
   - Expected: validation errors.
   - No backend 500.

2. Invalid email.
   - Expected: email validation error.

3. Short password.
   - Expected: password validation error.

4. Missing phone number.
   - Expected: phone validation error if phone is required.

5. Valid registration.
   - Expected: user created and redirected correctly.
   - `/users/me` returns current user.
   - No token in localStorage/sessionStorage.

6. Duplicate email.
   - Expected: clean 409/400 message, not Mongo duplicate-key raw error.

Login scenarios:

1. Valid login.
   - Expected: redirect to intended page or dashboard.
   - Cookies are set.
   - `/users/me` works.

2. Wrong password.
   - Expected: `401 Invalid credentials`.

3. Unknown email.
   - Expected: `401 Invalid credentials`.

4. Protected route while logged out.
   - Open:
     ```txt
     /en/dashboard
     /en/messages
     /en/tutor/dashboard
     ```
   - Expected: redirect to `/en/login?next=...`.

5. Login after protected redirect.
   - Expected: user returns to original requested page.

Logout scenarios:

1. Click logout.
   - Expected: backend clears cookie.
   - User becomes unauthenticated.
   - Protected pages redirect to login.

## 3. Learner Dashboard

Routes:

```txt
/en/dashboard
/ar/dashboard
```

Scenarios:

1. Open learner dashboard as learner.
   - Expected: dashboard loads.
   - Sidebar links work.
   - Active sidebar item highlights correctly.

2. Click Find Tutor from sidebar.
   - Expected: navigates to `/en/find-tutor`.
   - Sidebar active state highlights Find Tutor.

3. Refresh page.
   - Expected: still authenticated.

4. Open as logged out user.
   - Expected: redirect to login.

5. Open as tutor.
   - Expected: either allowed if tutor also keeps learner access, or redirected according to app rule.

## 4. Find Tutor Flow

Routes:

```txt
/en/find-tutor
/ar/find-tutor
/en/find-tutor?mode=browse
```

Scenarios:

1. Open Find Tutor.
   - Expected: structured stepper appears.

2. Go through curriculum, level, subject.
   - Expected: each selection moves forward correctly.
   - Stepper text and icons align in English and Arabic.

3. Browse mode.
   - Open:
     ```txt
     /en/find-tutor?mode=browse
     ```
   - Expected: goes directly to browse/results view.

4. Filter by language.
   - Expected: only applies language filter if user enters/chooses language.
   - No default English filter unless selected.

5. Filter by price/rating/sort.
   - Expected: results update.
   - Page resets to 1 when filters change.

6. No results.
   - Expected: clean empty state.
   - No crash.

7. Result cards.
   - Expected:
     - Correct tutor name.
     - Correct price.
     - Correct rating.
     - Correct review count.
     - Correct subjects.
     - Buttons work.

8. Arabic Find Tutor.
   - Expected:
     - All visible text translated.
     - RTL layout looks natural.
     - No English hardcoded labels in stepper/results/cards.

## 5. Tutor Profile View

Routes:

```txt
/en/tutor-match/:tutorId
/ar/tutor-match/:tutorId
```

Scenarios:

1. Open profile from Find Tutor card.
   - Expected: profile loads, not "Tutor not found."

2. Verify data consistency.
   - Result card price/rating/reviews should match profile page.

3. Click Chat.
   - Logged in learner: creates/opens chat.
   - Logged out: should redirect to login or show auth-required behavior.
   - Wrong role: should show correct error.

4. Click Book Session.
   - Expected: booking page opens with tutor/subject/rate prefilled.

5. Old profile-id URL.
   - If an older `/tutor-match/{profileId}` exists, it should either resolve or show a clean fallback.

## 6. Booking Flow

Routes:

```txt
/en/booking
/en/bookings
/en/bookings/:bookingId
```

Scenarios:

1. Open booking from tutor profile.
   - Expected: tutor data is prefilled.
   - Price and subject are correct.

2. Submit booking with missing required fields.
   - Expected: validation errors.

3. Submit valid booking.
   - Expected: booking created.
   - Learner sees booking in list/details.

4. Tutor accepts booking.
   - Expected: status changes.

5. Tutor rejects booking.
   - Expected: status changes and learner sees update.

6. Learner cancels booking.
   - Expected: cancel works.
   - If cancel reason exists, verify it is sent and displayed.

7. Confirmation/session code.
   - Learner sees confirmation code only for their own booking.
   - Tutor enters code.
   - Correct code starts/confirms session.
   - Wrong code shows clean error.
   - Reusing code behaves correctly.

8. Unauthorized access.
   - Learner cannot open another learner's booking.
   - Tutor cannot confirm booking not assigned to them.

## 7. Payment Flow

Scenarios:

1. Booking payment button appears only when booking is payable.

2. Click pay.
   - Expected: frontend calls backend payment initiation.
   - Redirects to Paymob iframe/page if configured.

3. Payment success redirect.
   - Expected: returns to frontend success page.

4. Payment failure/cancel redirect.
   - Expected: clear failed/cancelled state.

5. Refresh payment success page.
   - Expected: no duplicate payment.

6. If using ngrok:
   - Backend webhook URL must be public.
   - Frontend redirect URL can be localhost for local browser testing, but public redirect is needed if testing from Paymob outside local browser constraints.

## 8. Tutor Profile Creation

Routes:

```txt
/en/tutor/profile/create
/en/tutor/profile/edit
```

Scenarios:

1. Logged out opens create profile.
   - Expected: redirect to `/en/login?next=/en/tutor/profile/create`.

2. Learner opens create profile.
   - Expected: form loads.

3. Submit empty form.
   - Expected: validation errors.

4. Submit valid profile.
   - Expected:
     - Profile created.
     - User role becomes tutor.
     - Auth user cache refreshes.
     - User can access tutor pages immediately.

5. Existing tutor opens create profile.
   - Expected: redirected to edit/profile/dashboard, not duplicate creation.

6. Upload avatar.
   - Expected: avatar uploads once.
   - Retrying submit does not re-upload old pending file.

7. Arabic page.
   - Expected: no hardcoded English labels.

## 9. Tutor Dashboard

Routes:

```txt
/en/tutor/dashboard
/en/tutor/profile/edit
/en/tutor/messages
/en/tutor/availability
/en/tutor/subjects
```

Scenarios:

1. Tutor dashboard loads.
   - Expected: no 404.
   - Sidebar works.
   - Back/home button wording is correct.

2. Profile edit.
   - Expected: existing profile data loads.
   - Save updates backend.
   - Name/avatar/headline/bio/rate update correctly.

3. Subjects.
   - Add subject.
   - Edit subject.
   - Delete subject.
   - Subject appears in Find Tutor results.

4. Availability.
   - Add slots.
   - Edit slots.
   - Delete slots.
   - Booking page reflects availability if connected.

5. Tutor messages.
   - Expected: chat list loads.
   - Conversation opens.
   - Send/receive works.

## 10. Chat

Routes:

```txt
/en/messages
/en/messages/:chatId
/en/tutor/messages
/en/tutor/messages/:chatId
```

Use two sessions:

- Learner in browser
- Tutor in another browser/Postman Socket.IO

Scenarios:

1. Chat list loads.
   - Expected: active chats show.
   - Last message preview appears.
   - Archived tab works.

2. Open conversation.
   - Expected:
     - Participant name appears.
     - Messages load.
     - No "Messages / Conversation history" generic title if participant exists.

3. Send message as learner.
   - Expected:
     - Message appears immediately.
     - Tutor receives in realtime.
     - Chat list preview updates immediately.

4. Send message as tutor.
   - Expected:
     - Learner receives in realtime.
     - Last message preview updates immediately.

5. Read receipts.
   - Sender sees sent/delivered/read icons update realtime.
   - Recipient opening conversation marks messages as read.

6. Emoji picker.
   - Add emoji.
   - Send emoji-only message.
   - Cursor behavior is okay.

7. Archive chat.
   - Expected: moves to archived list.
   - Cannot send while archived, or follows app rule.

8. Restore chat.
   - Expected: returns to active list.

9. Refresh conversation.
   - Expected: message history persists from backend.

10. Unauthorized chat access.
    - User cannot open chat they are not part of.

## 11. Notifications

Scenarios:

1. Notification bell appears in authenticated sidebar.

2. Unread count loads.

3. Message notification:
   - Recipient is not inside chat.
   - Sender sends message.
   - Expected: recipient gets `notification:new`.
   - Bell count increments live.
   - Notification appears in panel.

4. Active-chat suppression:
   - Recipient is inside same chat.
   - Sender sends message.
   - Expected: no notification record created.
   - Message still arrives.

5. Mark one read.
   - Expected: unread count decreases.
   - Other open tab syncs.

6. Mark all read.
   - Expected: unread count becomes 0.
   - Other open tab syncs.

7. Click message notification.
   - Learner goes to:
     ```txt
     /en/messages/:chatId
     ```
   - Tutor goes to:
     ```txt
     /en/tutor/messages/:chatId
     ```

8. Arabic notification panel.
   - Expected: translated text and RTL layout.

## 12. AI Assistant

Routes:

```txt
/en/ai-assistant
/ar/ai-assistant
```

Scenarios:

1. Open AI Assistant.
   - Expected: chat-style UI, not Find Tutor filter UI.

2. Send message.
   - Expected:
     - User message appears.
     - Assistant reply appears.
     - Loading clears.

3. Missing OpenAI key.
   - Expected: fallback assistant reply appears.
   - Page does not crash.

4. Empty message.
   - Expected: send disabled.

5. Enter vs Shift+Enter.
   - Enter sends.
   - Shift+Enter adds newline, if implemented.

6. Arabic route.
   - Expected: Arabic text and RTL.

## 13. AI Tutor Recommendations

If still exposed through Find Tutor or AI flow:

1. Send structured criteria:
   ```json
   {
     "query": "math",
     "category": "mathematics",
     "educationLevel": "secondary",
     "curriculum": "igcse",
     "languages": ["English"],
     "maxHourlyRate": 300
   }
   ```

2. Expected:
   - Recommendations appear.
   - Score breakdown appears.
   - Reasons are clear.
   - Chat/book/profile buttons work.

3. Without OpenAI:
   - Structured recommendation still works.
   - Free-text extraction may be limited.

## 14. Admin Dashboard

Only if FE5/admin is ready.

Scenarios:

1. Admin login.

2. Open admin dashboard.

3. Users list loads.

4. Edit user drawer opens.

5. Avatar null values do not crash build/page.

6. Tutor approval list loads.

7. Approve tutor.
   - Tutor appears in public Find Tutor results.

8. Reject tutor.
   - Tutor does not appear publicly.

9. Audit logs load.

10. Non-admin cannot access admin routes.

## 15. Accessibility and UX

All developers should check:

1. Keyboard navigation.

2. Buttons have clear labels.

3. Forms show errors near fields.

4. Loading states are visible.

5. Empty states are helpful.

6. No buttons that say one thing and do another.

7. Images do not break Next Image rules.

8. No horizontal scroll on mobile.

9. Arabic layout does not look mirrored incorrectly.

10. Console has no red errors.

## 16. Technical Browser Checks

For every tested page:

1. Open browser console.
   - Expected: no uncaught errors.

2. Open Network tab.
   - Expected:
     - No unexpected 404.
     - No 500.
     - API requests go to Express backend, not wrong Next `/api` route.

3. Refresh page.
   - Expected: auth state persists.

4. Test hard reload.
   - Expected: page still works.

5. Test mobile viewport.
   - Expected: no broken layout.

## Priority Testing Order

Use this order before demo:

1. Auth register/login/logout.
2. Home page and routing.
3. Find Tutor results.
4. Tutor profile view.
5. Booking creation.
6. Tutor profile create/edit.
7. Chat realtime.
8. Notifications.
9. Payment.
10. AI assistant.
11. Arabic/RTL.
12. Admin.

## Most Important Bug Areas To Watch

Based on what we already saw:

- `userId` vs `tutorProfileId` mismatch.
- `/api/tutors` list response different from `/api/tutors/:id/profile`.
- Hardcoded English text in Arabic pages.
- Sidebar active states.
- Next Image invalid `src`.
- Auth redirects losing `next`.
- Socket.IO path/auth/cookie issues.
- Chat list preview not updating live.
- Read receipts not updating live.
- LocalStorage/mock services still being used by mistake.
- Frontend calling relative `/api/...` instead of Express base URL.
- Web build blocked by unrelated TypeScript errors.
