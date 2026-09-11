BAUM TenPers GRE — Minimal Sidebar + Fullscreen Exam Upgrade

WHAT CHANGED
- Most navigation buttons moved into a persistent left sidebar.
- Top interface is cleaner; only essential exam controls remain in the main workspace.
- Quant and Verbal topic navigation now live inside collapsible sidebar groups.
- Study Center, Untimed Practice, Timed CBT, Full Simulation, Test Center and Dashboard are in the sidebar.
- Fullscreen Mode added.
- Timed/testing pages attempt to enter fullscreen when a test begins.
- If the exam loses browser focus or exits fullscreen, a return-to-test shield appears.

IMPORTANT BROWSER LIMIT
A normal webpage CANNOT disable the Windows/macOS browser Minimize button, Alt+Tab, Windows key, Task Manager, or other operating-system controls. Browsers deliberately block this for security.
The strongest browser-safe behavior implemented here is:
1. request fullscreen,
2. detect fullscreen exit,
3. detect tab/window focus loss,
4. cover the exam with a resume shield until the student returns.

For a truly locked kiosk environment, use a managed browser/device kiosk policy outside the webpage.

FILES
Replace:
- practice.html
- cbt.html
- simulation.html
- test.html
- study.html

The question-session backend file is included unchanged from the Study Navigation upgrade.
If you have already deployed that backend version, you do not need to redeploy it merely for this interface update.

TEST LOCALLY
python -m http.server 8080
Then open:
http://localhost:8080/study.html
http://localhost:8080/cbt.html
