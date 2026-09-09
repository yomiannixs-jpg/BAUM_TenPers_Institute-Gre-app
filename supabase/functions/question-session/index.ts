
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:corsHeaders});
  const auth=req.headers.get("Authorization")||"";
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,
    {global:{headers:{Authorization:auth}}});
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return Response.json({error:"Unauthorized"},{status:401,headers:corsHeaders});

  const {section="Mixed",mode="practice",count=20}=await req.json();
  let q=supabase.from("gre_questions")
    .select("id,section,skill,difficulty,prompt,choices")
    .eq("active",true).limit(Math.min(Number(count)||20,54));
  if(section!=="Mixed") q=q.eq("section",section);
  const {data:questions,error}=await q;
  if(error) return Response.json({error:error.message},{status:400,headers:corsHeaders});

  const {data:session,error:sErr}=await supabase.from("test_sessions")
    .insert({user_id:user.id,test_type:section,mode}).select("id").single();
  if(sErr) return Response.json({error:sErr.message},{status:400,headers:corsHeaders});

  return Response.json({session_id:session.id,questions},{headers:{...corsHeaders,"Content-Type":"application/json"}});
});
