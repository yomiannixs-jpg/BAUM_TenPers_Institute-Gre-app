
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:corsHeaders});
  const auth=req.headers.get("Authorization")||"";
  const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,
    {global:{headers:{Authorization:auth}}});
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:{user}}=await client.auth.getUser();
  if(!user) return Response.json({error:"Unauthorized"},{status:401,headers:corsHeaders});

  const {session_id,answers=[]}=await req.json();
  const ids=answers.map((a:any)=>a.question_id);
  const {data:keys,error}=await admin.from("gre_questions")
    .select("id,section,skill,correct_answer,explanation").in("id",ids);
  if(error) return Response.json({error:error.message},{status:400,headers:corsHeaders});
  const map=new Map((keys||[]).map((x:any)=>[x.id,x]));
  const graded=answers.map((a:any)=>{
    const k:any=map.get(a.question_id);
    return {...a,is_correct:!!k && a.answer===k.correct_answer,
      correct_answer:k?.correct_answer,explanation:k?.explanation,skill:k?.skill,section:k?.section};
  });
  const rows=graded.map((g:any)=>({session_id,user_id:user.id,question_id:g.question_id,
    selected_answer:g.answer,is_correct:g.is_correct,response_time_seconds:g.response_time_seconds||null}));
  if(rows.length) await admin.from("question_responses").upsert(rows,{onConflict:"session_id,question_id"});
  await admin.from("test_sessions").update({status:"completed",completed_at:new Date().toISOString()})
    .eq("id",session_id).eq("user_id",user.id);
  return Response.json({graded,correct:graded.filter((x:any)=>x.is_correct).length,total:graded.length},
    {headers:{...corsHeaders,"Content-Type":"application/json"}});
});
