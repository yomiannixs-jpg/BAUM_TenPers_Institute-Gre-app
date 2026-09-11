BAUM TenPers GRE — Chrome Desktop PWA Install Fix

Why Chrome was not installing:
The current working build linked to manifest.webmanifest, but the actual manifest and service-worker files were missing from the build. That means Chrome could not treat the site as an installable PWA.

This fix adds:
- manifest.webmanifest
- service-worker.js
- pwa-register.js
- valid 192x192 and 512x512 PNG app icons
- Apple touch icon
- Install App button on the main sidebar (shown when Chrome exposes the install prompt)
- pwa-diagnostics.html
- vercel.json headers for the manifest and service worker
- PWA metadata on all primary HTML pages

LOCAL TEST
1. Copy ALL files/folders from this package into your master app folder.
2. Preserve your existing supabase-config.js and textbooks folder.
3. Start from the exact master folder:
   cd "C:\Users\HP\Downloads\BAUM_TenPers_GRE_Cloud_Routed_Server_Ready"
   python -m http.server 8080
4. Open:
   http://localhost:8080/
5. Hard refresh once with Ctrl+F5.
6. Wait a few seconds. Chrome should show either:
   - the Install App button in the sidebar, or
   - an install icon in the address bar, or
   - Chrome menu -> Cast, save and share -> Install page as app
7. If not, open:
   http://localhost:8080/pwa-diagnostics.html

IMPORTANT
- Chrome installation requires localhost or HTTPS. file:// will not work.
- If an older broken service worker is registered, visit chrome://serviceworker-internals or DevTools -> Application -> Service Workers -> Unregister, then Ctrl+F5 once.
- For production, the Vercel HTTPS site is the preferred installation URL.
