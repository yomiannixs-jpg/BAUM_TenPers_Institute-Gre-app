BAUM TenPers GRE — Clean Home + Sidebar + Direct Fullscreen

This revision addresses three issues:
1. The home page is simplified: old button-heavy launch clusters are hidden.
2. Navigation is concentrated in the left sidebar.
3. Study topic selection now appears directly in the home-page hero.
4. Fullscreen is requested directly on the user's pointer-down on Start/Begin controls. This fixes the previous delayed fullscreen request, which browsers reject because it was no longer within the user gesture.

Replace:
index.html
practice.html
cbt.html
simulation.html
test.html
study.html

The question-session backend file is included unchanged from the Study Center version.

Browser limitation:
A webpage can enter browser fullscreen and detect exits/focus loss, but it cannot disable the operating-system Minimize button, Alt+Tab, Windows key, or Task Manager. For that, use a managed kiosk environment.
