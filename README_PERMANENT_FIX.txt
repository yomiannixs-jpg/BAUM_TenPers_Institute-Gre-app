BAUM TenPers GRE — Stable Offline Textbook Fix

WHY IT WORKED ONCE AND THEN FAILED
The earlier fallback used a browser-created blob URL when you chose a PDF manually.
Blob URLs are temporary. They disappear after page refresh/restart.
The app then fell back to a static /textbooks/... path and returned 404 if no file existed under that exact name.

PERMANENT FIX
1. Copy textbooks.html and setup_textbooks.ps1 into:
   C:\Users\HP\Downloads\BAUM_TenPers_GRE_Cloud_Routed_Server_Ready

2. Keep your PDF files in either:
   ...\BAUM_TenPers_GRE_Cloud_Routed_Server_Ready\testmaterials\
   or
   ...\BAUM_TenPers_GRE_Cloud_Routed_Server_Ready\textbooks\

3. Open PowerShell in the master folder and run:
   powershell -ExecutionPolicy Bypass -File .\setup_textbooks.ps1

4. The script creates these permanent normalized copies:
   textbooks\ETS_Official_Guide_GRE_Third_Edition.pdf
   textbooks\Manhattan_5lb_GRE_Practice_Problems.pdf
   textbooks\GRE_Big_Book.pdf

5. Start the server from the MASTER FOLDER:
   python -m http.server 8080

6. Open:
   http://localhost:8080/textbooks.html

Do not start python -m http.server from a parent folder or a different build folder.
The URL /textbooks/... is resolved relative to the folder where the server was started.
