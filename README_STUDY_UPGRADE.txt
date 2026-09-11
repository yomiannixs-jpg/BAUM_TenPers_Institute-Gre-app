BAUM TenPers GRE — Study Center + Subject Navigation Upgrade

WHAT IS ADDED
1. Quant Topics dropdown with full topic navigation.
2. Verbal Topics dropdown with full topic navigation.
3. Study & Practice dropdown linking Study Center, Untimed Practice, Timed CBT, Full Simulation and Test Center.
4. New study.html:
   - choose Quant or Verbal
   - choose a specific topic
   - read a short lesson: what to master, best method, common trap, mini-example
   - start a protected 10-question drill specifically from that topic
   - receive secure server grading and explanations at the end
5. Question-session now accepts a skills[] filter, while still drawing only from V2 + V3.
6. The current multi-answer fixes are preserved.
7. Visible bank wording updated to 10,000 questions where present.

FILES TO COPY TO MASTER FOLDER
- practice.html
- cbt.html
- simulation.html
- test.html
- study.html

BACKEND FILE TO REPLACE
supabase/functions/question-session/index.ts

DEPLOY ONLY THIS FUNCTION
cd "C:\Users\HP\Downloads\BAUM_TenPers_GRE_Cloud_Routed_Server_Ready"
npx supabase functions deploy question-session

Then restart/refresh local app and open:
http://localhost:8080/study.html

IMPORTANT
V2 and V3 both remain active. No question rows are deleted.
submit-test does not need redeployment.
