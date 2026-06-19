# Infinite Redirect Loop Fix - Complete Implementation Guide

## Root Causes Diagnosed

### 1. **Dual Authentication Layers (PRIMARY CAUSE)**

- **Problem**: Middleware reads from cookies, but backend never sets them
- **Impact**: Middleware finds no auth token → redirects to login, while client-side has token in localStorage
- **Result**: Infinite redirect cycle

### 2. **Helmet Security Headers Interference**

- **Problem**: Default Helmet config included headers that blocked credential transmission
- **Impact**: CORS issues combined with session cookies not being set
- **Fix**: Custom Helmet config with explicit credential policies

### 3. **Client-Side Race Condition in Layout**

- **Problem**: useEffect with `pathname` and `router` dependencies
- **Impact**: Each redirect triggers new route → useEffect re-runs → triggers new redirect
- **Cascade**: Hard refresh loop from conflicting redirects

### 4. **Missing HTTP-Only Cookies**

- **Problem**: Auth controller only returned JWT in response body, not in cookies
- **Impact**: Middleware couldn't access auth state without cookies
- **Result**: Server-side middleware unaware of client authentication

### 5. **Invalid Redirect Logic Flow**

- **Problem**: Both middleware AND layout.js performed role-based redirects
- **Impact**: Double-validation and potential infinite loop
- **Solution**: Single source of truth using middleware + client-side context

---

## Changes Made

### Backend (Express Server)

#### 1. **server.js** - Helmet & CORS Configuration

```javascript
// BEFORE: Conflicting order, missing cookie-parser
app.use(cors({ ... }));
app.use(helmet());

// AFTER: Proper order with cookie support
app.use(cookieParser());
app.use(cors({ ... })); // CORS before Helmet
app.use(helmet({        // Custom Helmet config
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: { ... }
}));
```

**Why this matters:**

- `cookie-parser` middleware enables Express to read/write cookies
- CORS must come before Helmet to ensure proper header negotiation
- Custom Helmet config prevents blocking of credentials

#### 2. **authController.js** - HTTP-Only Cookie Setting

```javascript
// BEFORE: Only JSON response, no cookies
return res.status(statusCode).json({ success: true, token, user });

// AFTER: Set HTTP-only cookies + JSON response
res.cookie("token", token, {
  httpOnly: true, // XSS protection
  secure: isProd, // HTTPS only in production
  sameSite: "lax", // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
});
res.cookie("user", JSON.stringify(userResponse), {
  httpOnly: false, // Frontend needs to read
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
});
```

**Why this matters:**

- Cookies are automatically sent with every request
- Middleware can now read auth state
- Prevents XSS attacks with httpOnly flag
- Prevents CSRF attacks with sameSite

#### 3. **server/package.json** - Added Dependency

```json
"cookie-parser": "^1.4.6"
```

### Frontend (Next.js Client)

#### 1. **New AuthContext** - `src/providers/AuthContext.jsx`

- **Purpose**: Single source of truth for auth state
- **Eliminates**: Race conditions from duplicate redirects
- **Key Features**:
  - Initializes auth once on mount (avoids repeated hydration)
  - Provides `useAuth()` hook for components
  - Manages localStorage + state synchronously
  - Prevents multiple redirects with `redirectedRef`

```javascript
// Usage in components
const { user, token, isHydrated, isLoading, setAuth, logout } = useAuth();
```

#### 2. **New DashboardGuard** - `src/components/dashboard/DashboardGuard.jsx`

- **Purpose**: Encapsulates all dashboard protection logic
- **Eliminates**: Complex useEffect dependencies in layout
- **Key Features**:
  - Waits for hydration before checking auth
  - Uses `redirectedRef` to prevent infinite redirects
  - Role-based route protection
  - Handles all redirect scenarios

#### 3. **Updated Layout** - `src/app/dashboard/layout.js`

```javascript
// BEFORE: Complex useEffect with pathname dependency
useEffect(() => {
  // 80+ lines of redirect logic
  // Triggers on every route change
}, [pathname, router]);

// AFTER: Delegates to DashboardGuard
<DashboardGuard>
  <DashboardLayoutContent>{children}</DashboardLayoutContent>
</DashboardGuard>;
```

#### 4. **Updated Root Layout** - `src/app/layout.js`

```javascript
// Added AuthProvider wrapper
<ThemeProvider>
  <AuthProvider>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </AuthProvider>
</ThemeProvider>
```

#### 5. **Updated Middleware** - `src/middleware.js`

- Added better cookie parsing with `decodeURIComponent()`
- Added validation for `/dashboard/` with trailing slash
- Clearer role-based routing logic
- Proper fallback for missing user data

#### 6. **Updated LoginForm** - `src/components/auth/LoginForm.jsx`

```javascript
// BEFORE: Used js-cookie to manually set cookies
Cookies.set("token", data.token, { expires: 30 });

// AFTER: Uses AuthContext + credentials: "include"
const { setAuth } = useAuth();
const res = await fetch(API_URL, {
  credentials: "include", // Browser handles cookies automatically
});
setAuth(data.token, data.user); // Update context
```

### Middleware

#### `src/middleware.js` - Enhanced Route Protection

- Proper cookie parsing with URL decoding
- Clear role-based access control
- Prevents redirect loops by checking auth state first
- Works in coordination with DashboardGuard

---

## How It Works Now (Fixed Flow)

### 1. **User Logs In**

```
Browser → POST /api/auth/login
Server sets HTTP-only cookies + returns JSON
Browser automatically stores cookies
LoginForm calls setAuth() to update context
```

### 2. **User Navigates to Dashboard**

```
Browser requests /dashboard
Middleware checks cookies (not localStorage)
Middleware validates role against route
Passes request if authorized
```

### 3. **Dashboard Layout Mounts**

```
DashboardGuard initializes AuthContext from localStorage
Waits for hydration complete
Checks role once and redirects if needed
Prevents multiple redirects with redirectedRef
Renders content when authorized
```

### 4. **User Navigates Between Routes**

```
Next.js Router handles navigation
Middleware validates at server level
DashboardGuard validates at client level
No infinite loops because:
- redirectedRef prevents duplicate redirects
- Hydration check prevents early auth reads
- Single source of truth in context
```

---

## Deployment Instructions

### 1. Install Backend Dependencies

```bash
cd server
npm install
# This installs the new cookie-parser package
```

### 2. Restart Services

```bash
# Stop current services
# In root directory:
npm run dev

# This runs:
# - Next.js on localhost:3000
# - Express on localhost:5000
# Both with hot reload
```

### 3. Test Authentication Flow

1. Go to `http://localhost:3000/register`
2. Create an account and verify email
3. Go to `http://localhost:3000/login`
4. Log in with the test account
5. Should redirect to `/dashboard/user` without loops
6. Navigate between routes in dashboard
7. No infinite reloads should occur

### 4. Verify Cookies Are Set

1. Open DevTools → Application → Cookies
2. For `localhost:3000`:
   - `token` cookie should exist (HTTP-only)
   - `user` cookie should exist (readable by JavaScript)
3. Both should have `SameSite=Lax`

---

## Security Improvements

| Aspect              | Before            | After                       |
| ------------------- | ----------------- | --------------------------- |
| **Cookie Storage**  | Not set           | HTTP-only, secure, SameSite |
| **XSS Protection**  | No                | HTTP-only flag              |
| **CSRF Protection** | No                | SameSite=Lax                |
| **Helmet Headers**  | Default only      | Custom config               |
| **Auth Validation** | Client-side only  | Server + Client             |
| **Session State**   | localStorage only | Cookies + localStorage      |

---

## Troubleshooting

### Still Getting Infinite Loops?

1. Clear browser cache and cookies
2. Check DevTools Network tab for 308/307 redirects
3. Verify `NEXT_PUBLIC_API_URL` is set correctly
4. Ensure Node backend is running and logs show requests

### Cookies Not Being Set?

1. Check browser console for CORS errors
2. Verify `credentials: "include"` in fetch calls
3. Check that Express has `helmet()` applied AFTER `cors()`
4. Verify `cookie-parser` is imported in server.js

### Middleware Not Working?

1. Check that `/src/middleware.js` exists
2. Verify matcher pattern includes your routes
3. Check Next.js logs for middleware errors
4. Ensure cookies are actually being sent

### "Verifying Session..." Stuck?

1. Check if DashboardGuard is mounted
2. Verify AuthProvider wraps the app
3. Check browser console for JavaScript errors
4. Ensure localStorage has token + user data

---

## Files Changed

### Backend

- ✅ `server/server.js` - Helmet & cookie setup
- ✅ `server/controllers/authController.js` - Cookie setting
- ✅ `server/package.json` - Added cookie-parser

### Frontend

- ✅ `src/providers/AuthContext.jsx` - NEW
- ✅ `src/components/dashboard/DashboardGuard.jsx` - NEW
- ✅ `src/app/dashboard/layout.js` - Refactored
- ✅ `src/app/layout.js` - Added AuthProvider
- ✅ `src/middleware.js` - Enhanced
- ✅ `src/components/auth/LoginForm.jsx` - Updated

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER / NEXT.JS                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Root Layout (layout.js)                               │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  AuthProvider (AuthContext.jsx)                 │ │ │
│  │  │  - Manages auth state globally                  │ │ │
│  │  │  - Initializes from localStorage once           │ │ │
│  │  │  - Provides useAuth() hook                      │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌───────────────────────────────────────────┐ │ │ │
│  │  │  │  Dashboard Layout                         │ │ │ │
│  │  │  │  ┌─────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  DashboardGuard                     │ │ │ │ │
│  │  │  │  │  - Waits for hydration              │ │ │ │ │
│  │  │  │  │  - Validates auth state             │ │ │ │ │
│  │  │  │  │  - Prevents infinite redirects      │ │ │ │ │
│  │  │  │  │  - Handles role-based routing       │ │ │ │ │
│  │  │  │  └─────────────────────────────────────┘ │ │ │ │
│  │  │  │  ┌─────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Dashboard Content                  │ │ │ │ │
│  │  │  │  │  (Sidebar, Topbar, Main)            │ │ │ │ │
│  │  │  │  └─────────────────────────────────────┘ │ │ │ │
│  │  │  └───────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Middleware (src/middleware.js)                              │
│  - Validates cookies on each request                         │
│  - Role-based route protection                               │
│  - Redirects before component rendering                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
            ↕  credentials: "include" + HTTP cookies
┌─────────────────────────────────────────────────────────────┐
│             EXPRESS SERVER (server/server.js)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Middleware Stack:                                           │
│  1. express.json()                                           │
│  2. cookie-parser()     ← NEW                                │
│  3. cors({              ← ENHANCED                           │
│       credentials: true                                      │
│     })                                                       │
│  4. helmet({            ← CUSTOMIZED                         │
│       crossOriginOpenerPolicy: { ... }                       │
│     })                                                       │
│                                                               │
│  Routes:                                                     │
│  - POST /api/auth/login                                      │
│    └─ sendTokenResponse() ← Sets HTTP-only cookies           │
│  - GET /api/dashboard                                        │
│  - POST /api/webhook                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
            ↕  HTTP-only cookies set in response
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER STORAGE                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Cookies (HTTP-only, Secure, SameSite=Lax):                  │
│  - token ────────────────┐                                   │
│  - user                  ├─ Sent with every request          │
│                          │  (middleware reads these)         │
│  localStorage:           │                                   │
│  - token ────────────────┤                                   │
│  - user                  ├─ Used by AuthContext              │
│                          │  (client-side state)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Prevention of Infinite Loops

### Old Implementation (BROKEN)

```
User clicks dashboard → Router navigates
→ Layout useEffect fires (pathname changed)
→ Layout reads localStorage + checks role
→ Layout calls router.replace()
→ Router navigates to new URL
→ Layout useEffect fires again (pathname changed again)
→ Loop condition not met, but race condition causes jank
```

### New Implementation (FIXED)

```
User clicks dashboard → Router navigates
→ Next.js Middleware checks cookies first
→ If valid, page loads
→ DashboardGuard initializes (once per route)
→ Checks hydration complete
→ Checks auth state once
→ Sets redirectedRef to prevent repeat checks
→ If redirect needed, calls router.replace() once
→ Component renders or redirects
→ DashboardGuard now has redirectedRef = true
→ useEffect doesn't re-run (no more pathname changes trigger it)
→ No infinite loop
```

---

## Performance Improvements

1. **Single Auth Check**: DashboardGuard checks auth once per route change (not twice)
2. **Early Middleware**: Server-side validation prevents unnecessary client redirects
3. **No Cookie Parsing**: Reduced HTTP-only cookie overhead in components
4. **Optimized Context**: AuthProvider initializes once on mount

---

## Next Steps (Optional Enhancements)

1. **Logout Route**: Create `/api/auth/logout` to clear cookies
2. **Token Refresh**: Implement refresh token rotation
3. **Session Validation**: Add periodic token verification
4. **Audit Logging**: Track login/logout events
5. **Rate Limiting**: Add login attempt rate limiting
