
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  const auth=req.headers.get("Authorization")||"";
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,
    {global:{headers:{Authorization:auth}}});
  const {data:{user}}=await sb.auth.getUser();
  if(!user) return Response.json({error:"Unauthorized"},{status:401,headers:corsHeaders});
  const {data:me}=await sb.from("profiles").select("role,institution_id").eq("id",user.id).single();
  if(!me || !["instructor","admin"].includes(me.role))
    return Response.json({error:"Forbidden"},{status:403,headers:corsHeaders});
  return Response.json({ok:true,role:me.role,institution_id:me.institution_id},
    {headers:{...corsHeaders,"Content-Type":"application/json"}});
});
