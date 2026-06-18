# Backend API Integration - Quick Start

## 📋 Files Created

### Core API Files

- **`apps/web/src/lib/api-client.ts`** - Axios instance with request/response interceptors
- **`apps/web/src/lib/auth-service.ts`** - Auth API service (login, register, verify)
- **`apps/web/src/lib/auth-proxy.ts`** - Auth verification helpers for middleware

### Server Actions (Recommended)

- **`apps/web/src/app/(auth)/Login/actions-api.ts`** - API-based login action
- **`apps/web/src/app/(auth)/register/actions-api.ts`** - API-based register action

### Client-Side Option

- **`apps/web/src/hooks/useAuth.ts`** - Custom hook for auth with loading/error states
- **`apps/web/src/components/forms/auth-form-examples.tsx`** - React Hook Form examples

### Documentation

- **`apps/web/src/API_INTEGRATION_GUIDE.md`** - Comprehensive integration guide

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd apps/web
npm install axios
# Optional: for client-side React Hook Form
npm install react-hook-form @hookform/resolvers
```

### Step 2: Set Environment Variables

Create/update `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Step 3: Update Your Login/Register Pages

Replace the current mock actions with API actions:

**Login page:**

```tsx
import { loginActionWithAPI } from './actions-api';

export default function LoginPage() {
  const [state, action] = useActionState(loginActionWithAPI, undefined);
  // ... rest of your component
  return <form action={action}>{/* ... */}</form>;
}
```

**Register page:**

```tsx
import { registerActionWithAPI } from './actions-api';

export default function RegisterPage() {
  const [state, action] = useActionState(registerActionWithAPI, undefined);
  // ... rest of your component
  return <form action={action}>{/* ... */}</form>;
}
```

---

## 📡 Backend Requirements

Your API needs these endpoints:

### `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": { "id": "123", "name": "John", "email": "...", "role": "student" },
    "token": "jwt-token-here" // optional
  }
}
```

### `POST /auth/register`

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password",
  "role": "student"
}
```

### `GET /auth/verify` (optional)

Verify current session/token

### `POST /auth/logout` (optional)

Logout endpoint

**See `API_INTEGRATION_GUIDE.md` for detailed backend examples**

---

## 🎯 Authentication Flow

```
User fills form
    ↓
Form submitted to Server Action (loginActionWithAPI)
    ↓
AuthService.login() called (via API)
    ↓
API returns user + token
    ↓
Token stored in httpOnly cookie (secure)
    ↓
User redirected to /Home
```

---

## 🔑 Token Storage Options

### Recommended: Server-Side httpOnly Cookie

✅ Secure, CSRF-protected, XSS-safe

```typescript
cookieStore.set(AUTH_TOKEN_COOKIE, response.token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 604800, // 7 days
});
```

### Alternative: Session-Based (Current Mock)

Keep using the current approach - no token, session ID managed by backend

### Not Recommended: localStorage/sessionStorage

❌ Vulnerable to XSS attacks

---

## 🧠 Choose Your Approach

### Option A: Server Actions (RECOMMENDED)

- ✅ Most secure (form data never in JS)
- ✅ Automatic CSRF protection
- ✅ Token in httpOnly cookie
- Files: `actions-api.ts`
- Best for: Form submissions

### Option B: Custom useAuth Hook

- ✅ More control over loading/error states
- ✅ Real-time validation feedback
- ⚠️ Slightly less secure (requires careful handling)
- Files: `useAuth.ts`, `auth-form-examples.tsx`
- Best for: Advanced forms with custom UI

### Option C: Direct AuthService

- ✅ Flexibility for complex flows
- ⚠️ Requires manual error handling
- Files: `auth-service.ts`
- Best for: Programmatic login/signup

---

## 🔄 Migrate Gradually

Start with login, then register:

1. Keep mock data for development
2. Create API routes on your backend
3. Update login action → test → deploy
4. Update register action → test → deploy
5. Remove mock data when confident

Switch back anytime by using the original `actions.ts` files.

---

## 🛠️ Debugging

### Check if API is being called:

```typescript
// Add to auth-service.ts
console.log('Calling login API:', { email, password });
```

### Check if token is stored:

```typescript
// In browser DevTools Console
document.cookie; // Should show auth_token with HttpOnly flag
```

### Network errors:

- Check CORS settings on backend
- Verify API_BASE_URL in .env.local
- Check backend is running on correct port

### 401 Unauthorized:

- Token might be expired
- Implement token refresh in api-client.ts interceptor
- Check backend token validation

---

## 📚 Learn More

- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
- **Axios**: https://axios-http.com/docs/intro
- **React Hook Form**: https://react-hook-form.com/
- **JWT Authentication**: https://auth0.com/learn/json-web-tokens

---

## ❓ Common Questions

**Q: Should I use Server Actions or useAuth hook?**
A: Start with Server Actions. They're more secure and handle forms better.

**Q: Where should I store the JWT token?**
A: In an httpOnly cookie set by the server. Never in localStorage.

**Q: How do I refresh an expired token?**
A: Add logic to api-client.ts interceptor to detect 401 and refresh.

**Q: Can I keep using mock data in development?**
A: Yes! Switch between them by changing which `actions.ts` file you import.

**Q: What if my backend returns different response format?**
A: Update the response types in `api-client.ts` and `auth-service.ts`.

---

## 📞 Need Help?

1. Check `API_INTEGRATION_GUIDE.md` for detailed examples
2. Review `auth-form-examples.tsx` for component patterns
3. Check backend API requirements section above
4. Review error handling in `auth-service.ts`

Good luck! 🎉
