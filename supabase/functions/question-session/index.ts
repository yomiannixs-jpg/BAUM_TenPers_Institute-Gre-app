import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type PublicQuestion = {
  id:string; section:string; skill:string; difficulty:string; prompt:string; choices:unknown;
};

function shuffle<T>(items:T[]):T[]{
  const a=[...items];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

Deno.serve(async (req) => {
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return Response.json({error:"Method not allowed"},{status:405,headers:corsHeaders});

  const auth=req.headers.get("Authorization")||"";
  const userClient=createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {global:{headers:{Authorization:auth}}}
  );
  const admin=createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const {data:{user},error:userErr}=await userClient.auth.getUser();
  if(userErr || !user) return Response.json({error:"Unauthorized"},{status:401,headers:corsHeaders});

  let body:any={};
  try{ body=await req.json(); }catch(_e){}
  const section=["Quant","Verbal","Mixed"].includes(body.section)?body.section:"Mixed";
  const mode=String(body.mode||"practice").slice(0,40);
  const count=Math.max(1,Math.min(Number(body.count)||20,54));
  const skills=Array.isArray(body.skills)
    ? body.skills.map((x:any)=>String(x||"").trim()).filter((x:string)=>x).slice(0,40)
    : [];

  async function sampleSection(sec:"Quant"|"Verbal",wanted:number):Promise<PublicQuestion[]>{
    const applyFilters=(q:any)=>{
      let x=q.eq("active",true).in("bank_version",["v2","v3"]).eq("section",sec);
      if(skills.length) x=x.in("skill",skills);
      return x;
    };
    if(wanted<=0) return [];
    const base=applyFilters(admin.from("gre_questions").select("id",{count:"exact",head:true}));
    const {count:total,error:countErr}=await base;
    if(countErr) throw countErr;
    if(!total) return [];

    const windowSize=Math.min(total,Math.max(wanted*8,80));
    const start=Math.floor(Math.random()*total);
    const fields="id,section,skill,difficulty,prompt,choices";
    let pool:PublicQuestion[]=[];

    const firstEnd=Math.min(total-1,start+windowSize-1);
    const {data:first,error:firstErr}=await applyFilters(admin.from("gre_questions").select(fields))
      .order("created_at",{ascending:true}).range(start,firstEnd);
    if(firstErr) throw firstErr;
    pool.push(...((first||[]) as PublicQuestion[]));

    const remaining=windowSize-pool.length;
    if(remaining>0){
      const {data:wrap,error:wrapErr}=await admin.from("gre_questions")
        .select(fields).eq("active",true).in("bank_version",["v2","v3"]).eq("section",sec)
        .order("created_at",{ascending:true}).range(0,remaining-1);
      if(wrapErr) throw wrapErr;
      pool.push(...((wrap||[]) as PublicQuestion[]));
    }
    return shuffle(pool).slice(0,wanted);
  }

  try{
    let questions:PublicQuestion[]=[];
    if(section==="Mixed"){
      const qCount=Math.ceil(count/2),vCount=Math.floor(count/2);
      const [q,v]=await Promise.all([sampleSection("Quant",qCount),sampleSection("Verbal",vCount)]);
      questions=shuffle([...q,...v]).slice(0,count);
    }else{
      questions=await sampleSection(section as "Quant"|"Verbal",count);
    }
    if(questions.length!==count){
      return Response.json({error:`Only ${questions.length} eligible questions were available.`},{status:409,headers:corsHeaders});
    }

    const {data:session,error:sErr}=await admin.from("test_sessions")
      .insert({user_id:user.id,test_type:section,mode,status:"active"})
      .select("id").single();
    if(sErr) throw sErr;

    const links=questions.map((q,i)=>({session_id:session.id,question_id:q.id,position:i+1}));
    const {error:linkErr}=await admin.from("session_questions").insert(links);
    if(linkErr){
      await admin.from("test_sessions").delete().eq("id",session.id).eq("user_id",user.id);
      throw linkErr;
    }

    return Response.json(
      {session_id:session.id,questions},
      {headers:{...corsHeaders,"Content-Type":"application/json"}}
    );
  }catch(e:any){
    return Response.json({error:e?.message||"Unable to create question session"},{status:400,headers:corsHeaders});
  }
});
