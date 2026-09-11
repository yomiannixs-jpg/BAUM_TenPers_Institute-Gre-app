BAUM TenPers GRE — Combined V2 + V3 Question Pool

This patch keeps BOTH V2 and V3 active for new sessions.

New question-session behavior
-----------------------------
Questions are drawn from:
    bank_version IN ('v2','v3')

That gives the app access to the full 10,000-question pool:
- 5,000 V2
- 5,000 V3

The legacy pre-version bank is still excluded.

Install
-------
Replace:
    supabase/functions/question-session/index.ts

Then run:
    npx supabase functions deploy question-session

No change is needed to submit-test.

Notes
-----
- V2 and V3 remain in Supabase.
- New sessions can draw from either bank.
- Existing sessions continue to work normally.
- If desired later, we can weight sampling so V3 appears more often than V2.
