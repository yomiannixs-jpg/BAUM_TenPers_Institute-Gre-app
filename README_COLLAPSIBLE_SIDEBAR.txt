BAUM TenPers GRE — Collapsible Sidebar Upgrade

What changed
------------
The permanent 260px sidebar has been rebuilt as an OPEN/CLOSED desktop menu.

OPEN:
- 260px wide
- full labels
- cloud sync/export card

CLOSED:
- 76px wide
- icons only
- labels appear as hover tooltips
- dashboards, institutional pages, modals and test content get almost the full browser width

Behavior
--------
- The sidebar defaults to CLOSED the first time.
- Click the ‹ / › button at the top of the sidebar to open or close it.
- The user's choice is remembered in localStorage across pages and browser refreshes.
- On mobile/tablet it remains an off-canvas drawer controlled by the hamburger button.
- No Supabase redeployment is needed.

Install
-------
Replace ONLY these two files in the current master build:
  baum-shell.css
  baum-shell.js

Then Ctrl+F5.
