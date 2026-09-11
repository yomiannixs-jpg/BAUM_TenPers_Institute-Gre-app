BAUM TenPers GRE — Auth + Textbook Stability Fix

AUTHENTICATION
- Sign In / Register overlay is restored on all app HTML pages.
- If there is no valid Supabase session, opening the app URL shows the auth gate.
- A valid session hides the gate.

TEXTBOOKS
- textbooks.html no longer guesses filenames.
- On the Python local server, it reads the actual directory listing from /textbooks/ and builds the book cards from the PDF files that really exist.
- This avoids repeated 404s caused by renamed/mismatched PDFs or temporary blob URLs.

LOCAL SERVER REQUIREMENT
Start Python from the exact master folder:
  cd "C:\Users\HP\Downloads\BAUM_TenPers_GRE_Cloud_Routed_Server_Ready"
  python -m http.server 8080

Do NOT start the server from Downloads, a parent directory, or an older build directory.

COPY ALL FILES IN THIS FIX into the master folder, keeping your existing textbooks/ PDF folder.
