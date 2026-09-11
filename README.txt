BAUM TenPers GRE — Multi-Answer Frontend Fix

Replace these four files in the master folder:
practice.html
test.html
cbt.html
simulation.html

Fixes:
- Sentence Equivalence: two selections.
- Two-blank Text Completion: one selection for (i), one for (ii).
- Three-blank Text Completion: one selection for each blank.
- Multi-answer instructions shown in the UI.
- Answer arrays remain compatible with server submission/grading.

This is frontend-only. No Supabase function redeployment is required.
