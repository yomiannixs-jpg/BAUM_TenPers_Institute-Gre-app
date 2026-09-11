BAUM TenPers GRE — V2 Question Bank Cutover

This patch changes ONLY question-session.

What it does
------------
Every gre_questions query in question-session now requires:
    bank_version = 'v2'

The legacy 5,000 questions remain in Supabase untouched and are no longer
eligible for newly-created sessions.

Install
-------
Copy:
    supabase/functions/question-session/index.ts
from this package into the same path in your master project, replacing the
existing file.

Then deploy from the master project folder:
    npx supabase functions deploy question-session

Do NOT redeploy submit-test for this cutover.

After deployment, start a brand-new practice session and confirm the new
content mix is appearing. Existing sessions created before the cutover can
still contain legacy question IDs; create a new session for the test.

Rollback
--------
If needed, redeploy the prior question-session file. Do not delete the
legacy questions yet.
