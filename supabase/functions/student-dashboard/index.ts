
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  const auth=req.headers.get("Authorization")||"";
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,
    {global:{headers:{Authorization:auth}}});
  const {data:{user}}=await sb.auth.getUser();
  if(!user) return Response.json({error:"Unauthorized"},{status:401,headers:corsHeaders});
  const [{data:sessions},{data:skills},{data:profile}]=await Promise.all([
    sb.from("test_sessions").select("*").order("started_at",{ascending:false}).limit(20),
    sb.from("student_skill_stats").select("*"),
    sb.from("profiles").select("*").single()
  ]);
  return Response.json({profile,sessions,skills},{headers:{...corsHeaders,"Content-Type":"application/json"}});
});
