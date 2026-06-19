# Quick Start Deployment Guide

## 🚀 One-Time Setup

### Step 1: Install Backend Dependency

```bash
cd server
npm install
# This adds cookie-parser package
```

### Step 2: Restart Development Servers

```bash
# In root directory, stop any running servers
# Then run:
npm run dev

# Or run separately in two terminals:
# Terminal 1:
npm run client  # Next.js on :3000

# Terminal 2:
npm run server  # Express on :5000
```

## ✅ Verification Checklist

### Test Login Flow

- [ ] Go to http://localhost:3000/register
- [ ] Create test account
- [ ] Verify email (check your email)
- [ ] Go to http://localhost:3000/login
- [ ] Log in with credentials
- [ ] **Should redirect to dashboard WITHOUT infinite loop**
- [ ] Navigating between routes works smoothly

### Verify Cookies

1. Open DevTools (F12)
2. Go to Application → Cookies → localhost:3000
3. Check:
   - [ ] `token` cookie exists
   - [ ] `user` cookie exists
   - [ ] Both have `SameSite=Lax`

### Check Backend Logs

- [ ] POST /api/auth/login request appears in console
- [ ] No CORS errors in browser console
- [ ] No "Helmet" errors in logs

## 🔍 If Things Still Don't Work

### Infinite Loop Still Happening?

```bash
# Clear everything and start fresh:
1. Close browser DevTools (Ctrl+Shift+I)
2. Go to chrome://settings/clearBrowserData
   - Select "All time"
   - Check Cookies, Cached images
3. Refresh page (Ctrl+Shift+R)
4. Try login again
```

### "Verifying Session..." Stuck?

Check browser console (F12 → Console) for errors:

- **CORS error?** → Express server might not be running
- **Cannot read properties of undefined?** → AuthProvider might not be loaded
- **"Cannot find module"?** → Run `npm install` in root and `server/`

### Middleware Not Working?

Verify file exists:

```bash
ls -la src/middleware.js  # Should exist
```

## 📋 Changed Files Summary

**Backend (server/):**

- `server.js` - Added cookie-parser, custom Helmet config
- `controllers/authController.js` - Sets HTTP-only cookies
- `package.json` - Added cookie-parser dependency

**Frontend (src/):**

- `providers/AuthContext.jsx` - NEW Auth state management
- `components/dashboard/DashboardGuard.jsx` - NEW Route protection
- `app/dashboard/layout.js` - Refactored to use DashboardGuard
- `app/layout.js` - Wrapped with AuthProvider
- `middleware.js` - Enhanced cookie parsing
- `components/auth/LoginForm.jsx` - Uses AuthContext

## 🎯 Key Architecture Changes

### Before (Broken)

```
Browser ←→ Express
↓
localStorage (NOT synchronized with server)
↓
Layout.js does complex auth checks on every route change
→ Causes infinite redirect loops
```

### After (Fixed)

```
Browser ←→ Express
↓
HTTP-only Cookies + localStorage (synchronized)
↓
Middleware validates first (server-side)
↓
DashboardGuard validates once (client-side)
→ Single redirect, no loops
```

## 🛡️ Security Features Added

- ✅ HTTP-only cookies (prevent XSS)
- ✅ SameSite=Lax (prevent CSRF)
- ✅ Secure flag in production
- ✅ Server-side auth validation (middleware)
- ✅ Client-side role-based protection
- ✅ Proper CORS + Helmet configuration

## 📞 Common Issues & Solutions

| Issue                                    | Solution                                              |
| ---------------------------------------- | ----------------------------------------------------- |
| "Cannot read localStorage in middleware" | Normal - middleware is server-side, uses cookies only |
| Cookies not being set                    | Check `credentials: "include"` in fetch calls         |
| Helmet blocking requests                 | Fixed - custom Helmet config applied                  |
| Still getting 308 redirects              | Clear cache (Ctrl+Shift+R) and cookies                |
| Auth context is undefined                | Make sure AuthProvider wraps the app in layout.js     |

## 🧪 Testing Scenarios

### Test Case 1: Normal Login

```
1. Fresh browser, no auth
2. Go to /login
3. Log in
4. Should redirect to /dashboard/user
5. No infinite loops
✓ PASS
```

### Test Case 2: Admin Login

```
1. Log in with admin account
2. Should redirect to /dashboard/admin
3. Try accessing /dashboard/user
4. Should NOT redirect (admin has access)
✓ PASS
```

### Test Case 3: Unauthorized Access

```
1. Log in as user
2. Try accessing /dashboard/admin directly
3. Should redirect to /dashboard/user
4. No infinite loops
✓ PASS
```

### Test Case 4: Session Persistence

```
1. Log in
2. Refresh page (F5)
3. Should stay logged in (not redirect to /login)
4. Dashboard loads immediately
✓ PASS
```

## 📖 Documentation Files

- **REDIRECT_LOOP_FIX.md** - Complete technical documentation
- **DEPLOYMENT_QUICK_START.md** - This file
- Check browser DevTools Console for any errors

## 🚦 Next Steps After Deployment

1. **Test thoroughly** - Use all test cases above
2. **Monitor logs** - Check server console for requests
3. **User feedback** - Ask if dashboard feels responsive
4. **Consider enhancements** - Token refresh, session timeout, etc.

---

**Need help?** Check REDIRECT_LOOP_FIX.md for detailed architecture and troubleshooting.
