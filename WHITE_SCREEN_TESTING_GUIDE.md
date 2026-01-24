# 🧪 White Screen Testing Guide

## Quick Testing Steps

### 1. Start the Application
```bash
# Option 1: Build and serve
npm run build
npm run preview

# Option 2: Development mode
npm run dev
```

### 2. Open Browser DevTools
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- Go to **Console** tab
- Clear the console (right-click → Clear console or Ctrl+L)

### 3. Test the Application
1. Open the app in Telegram WebApp or regular browser
2. Watch the console logs flow
3. Wait for authentication to complete
4. Check if the app loads or shows white screen

---

## 📊 What to Look For

### ✅ SUCCESS - Logs You Should See

```
=== SplashScreen DEBUG ===
isReady: true
isAuthLoading: true
isAuthenticated: false
...
SDK is ready - checking auth state
Auth is still loading - waiting

... (may repeat a few times) ...

=== SplashScreen DEBUG ===
isReady: true
isAuthLoading: false
isAuthenticated: true
authProfile: {id: "user-123", ...}
User authenticated - profile ID: user-123
Username found but min display time not completed - waiting

Minimum display time completed
finalizeSplash called - isMinDisplayTimeCompleted: true, authCompleted: true
Finalizing splash - calling onFinish
=== App: handleSplashFinish called ===
showSplash set to false

Auth state updated: { isAuthenticated: true, profile: user-123... }

=== Index component mounted ===
This means SplashScreen was successfully closed
```

**You should ALSO see:**
- Yellow banner: "✅ SPLASH FINISHED - SHOWING MAIN APP"
- The main app interface loads

---

### ❌ FAILURE - What Logs Indicate Problems

#### Problem 1: Splash Never Finishes
**You see:**
```
User authenticated - profile ID: user-123
Username found but min display time not completed - waiting
```
**Then nothing happens - no "Minimum display time completed" or "finalizeSplash"**

**Diagnosis:** Splash logic stuck, probably waiting for min display time

---

#### Problem 2: App Doesn't Update State
**You see:**
```
Finalizing splash - calling onFinish
```
**But no "=== App: handleSplashFinish called ==="**

**Diagnosis:** onFinish callback not working, state not updating

---

#### Problem 3: Index Never Mounts
**You see:**
```
=== App: handleSplashFinish called ===
showSplash set to false
App render - showSplash: false
```
**But no "=== Index component mounted ==="**

**Diagnosis:** React Router issue, Index component not rendering, or error (check ErrorBoundary)

---

#### Problem 4: Component Crash
**You see:**
```
ErrorBoundary caught error: [Error message]
ErrorBoundary caught: Error: [details] {componentStack: "..."}
```
**And red error screen appears**

**Diagnosis:** Component crashed during render - check stack trace

---

#### Problem 5: Auth Timeout
**You see:**
```
Auth timeout - proceeding anyway
```

**Diagnosis:** Auth took too long (>5 seconds), forced completion

---

## 📋 Test Scenarios

### Scenario A: Telegram WebApp (Normal Flow)
1. Open app in Telegram
2. Should see splash screen
3. Auth should complete
4. Splash should finish
5. Main app should load

**Expected:** All success logs, yellow banner, app loads

---

### Scenario B: Regular Browser
1. Open app in Chrome/Firefox
2. Should see splash screen briefly
3. Should redirect to `/auth` page
4. Should see email login form

**Expected:** Logs showing "SDK not ready and not in Telegram", then auth page

---

### Scenario C: Network Issues
1. Open DevTools Network tab
2. Throttle to "Slow 3G"
3. Open app
4. Watch logs

**Expected:** May see auth timeout, app should still load after timeout

---

### Scenario D: API Errors
1. Stop backend server
2. Open app
3. Watch console

**Expected:** Should see auth error logs, splash should finish with error state

---

## 🎯 Debugging Checklist

When reporting issues, check these boxes:

- [ ] Console logs copied (all of them)
- [ ] Yellow banner visible? (yes/no)
- [ ] "Index component mounted" appeared? (yes/no)
- [ ] ErrorBoundary triggered? (yes/no)
- [ ] Any errors in console? (yes/no)
- [ ] Screenshot of error screen? (if applicable)
- [ ] Network requests successful? (check Network tab)

---

## 🚨 Common Issues & Solutions

### Issue: "Auth timeout - proceeding anyway"
**Cause:** Backend responding slowly (>5 seconds)
**Solution:** Check backend performance, or increase timeout in SplashScreen.tsx

---

### Issue: ErrorBoundary catches error
**Cause:** Component crash
**Solution:** Check the error message and stack trace, fix the component

---

### Issue: No logs appearing
**Cause:** Console not open or logs filtered
**Solution:** Ensure Console tab is open and filters set to "All levels"

---

### Issue: Splash finishes but app doesn't load
**Cause:** React Router issue
**Solution:** Check if Index component imports are correct, verify route configuration

---

### Issue: Yellow banner shows but no app
**Cause:** Index component not rendering
**Solution:** Check if authentication state is correct, verify redirect logic

---

## 📝 Reporting Issues

When reporting an issue, provide:

1. **Complete Console Logs**
   - Copy ALL text from first log to last
   - Include any errors or warnings

2. **Screenshot**
   - What you see on screen
   - Any error messages visible

3. **Browser/Environment**
   - Browser name and version
   - Telegram WebApp or regular browser?
   - Operating system

4. **Timeline**
   - What you did
   - What you expected to happen
   - What actually happened

---

## ✅ Success Indicators

You'll know everything works if you see:

1. ✅ All console logs flow in sequence
2. ✅ Yellow banner appears at top
3. ✅ Main app interface loads
4. ✅ Can navigate between tabs
5. ✅ No errors in console
6. ✅ No ErrorBoundary triggered
7. ✅ App is responsive

---

## 🔧 Quick Fixes to Try

If you encounter issues:

### Fix 1: Refresh Page
- Click "🔄 Обновить страницу" button (if ErrorBoundary triggered)
- Or press F5/Cmd+R

### Fix 2: Clear Browser Cache
- Ctrl+Shift+Delete
- Select "All time"
- Check "Cached images and files"
- Click "Clear data"
- Reload page

### Fix 3: Check Backend
```bash
# Verify backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Restart if needed
docker-compose restart backend
```

### Fix 4: Check Environment Variables
```bash
# Verify .env file exists and has correct values
cat .env

# Should see:
# VITE_SERVER_BASE_URL=...
# API_BASE_URL=...
```

---

## 📚 Related Documentation

- `WHITE_SCREEN_FIX_SUMMARY.md` - Complete implementation details
- `CRITICAL_FIXES_SUMMARY.md` - Previous fixes for splash/auth
- `DEPLOY_FAQ.md` - Deployment troubleshooting

---

## 🆘 Need Help?

If after testing you still see a white screen:

1. Copy ALL console logs
2. Take a screenshot
3. Note the exact sequence of what happened
4. Check if ErrorBoundary shows an error
5. Report with all information above

The logs will show **exactly where** the problem occurs!
