import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

function canonicalAnswer(v: unknown): number | string | Array<number | string> | null {
  if (v === null || v === undefined || v === "") return null;
  if (Array.isArray(v)) {
    return v.map(canonicalAnswer)
      .filter((x): x is number | string => x !== null && !Array.isArray(x))
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (/^\d+$/.test(t)) return Number(t);
    // Also tolerate letter keys if an older import used A/B/C... rather than 0/1/2...
    if (/^[A-Z]$/i.test(t)) return t.toUpperCase().charCodeAt(0) - 65;
    return t;
  }
  return String(v);
}
function normalize(v: unknown): string {
  return JSON.stringify(canonicalAnswer(v));
}
function scale(correct:number,total:number):number|null{
  if(!total) return null;
  return Math.max(130,Math.min(170,Math.round(130+40*correct/total)));
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return Response.json({error:"Method not allowed"},{status:405,headers:corsHeaders});

  const auth=req.headers.get("Authorization")||"";
  const client=createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {global:{headers:{Authorization:auth}}}
  );
  const admin=createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const {data:{user},error:userErr}=await client.auth.getUser();
  if(userErr || !user) return Response.json({error:"Unauthorized"},{status:401,headers:corsHeaders});

  let body:any={};
  try{body=await req.json();}catch(_e){}
  const sessionId=String(body.session_id||"");
  const answers=Array.isArray(body.answers)?body.answers:[];
  const durationSeconds=Number.isFinite(Number(body.duration_seconds))?Math.max(0,Math.round(Number(body.duration_seconds))):null;
  if(!sessionId) return Response.json({error:"session_id is required"},{status:400,headers:corsHeaders});

  const {data:session,error:sErr}=await admin.from("test_sessions")
    .select("id,user_id,status").eq("id",sessionId).eq("user_id",user.id).single();
  if(sErr || !session) return Response.json({error:"Session not found"},{status:404,headers:corsHeaders});
  if(session.status==="completed") return Response.json({error:"Session has already been submitted"},{status:409,headers:corsHeaders});

  const {data:allowed,error:aErr}=await admin.from("session_questions")
    .select("question_id,position").eq("session_id",sessionId).order("position",{ascending:true});
  if(aErr) return Response.json({error:aErr.message},{status:400,headers:corsHeaders});
  const allowedIds=new Set((allowed||[]).map((x:any)=>String(x.question_id)));
  if(!allowedIds.size) return Response.json({error:"Session has no assigned questions"},{status:409,headers:corsHeaders});

  const submittedIds=answers.map((a:any)=>String(a.question_id||""));
  if(submittedIds.some((id:string)=>!allowedIds.has(id))){
    return Response.json({error:"Submission contains a question that is not assigned to this session"},{status:403,headers:corsHeaders});
  }

  const ids=[...allowedIds];
  const {data:keys,error:kErr}=await admin.from("gre_questions")
    .select("id,section,skill,correct_answer,explanation").in("id",ids);
  if(kErr) return Response.json({error:kErr.message},{status:400,headers:corsHeaders});
  const keyMap=new Map((keys||[]).map((x:any)=>[String(x.id),x]));
  const answerMap=new Map(answers.map((x:any)=>[String(x.question_id),x]));

  const graded=(allowed||[]).map((link:any)=>{
    const id=String(link.question_id);
    const a:any=answerMap.get(id)||{question_id:id,answer:null,response_time_seconds:null};
    const k:any=keyMap.get(id);
    const is_correct=!!k && normalize(a.answer)===normalize(k.correct_answer);
    return {
      question_id:id,
      answer:a.answer,
      response_time_seconds:a.response_time_seconds??null,
      is_correct,
      correct_answer:canonicalAnswer(k?.correct_answer),
      explanation:k?.explanation,
      skill:k?.skill,
      section:k?.section
    };
  });

  const rows=graded.map((g:any)=>({
    session_id:sessionId,user_id:user.id,question_id:g.question_id,
    selected_answer:normalize(g.answer),is_correct:g.is_correct,
    response_time_seconds:Number.isFinite(Number(g.response_time_seconds))?Math.max(0,Math.round(Number(g.response_time_seconds))):null
  }));
  const {error:rErr}=await admin.from("question_responses").upsert(rows,{onConflict:"session_id,question_id"});
  if(rErr) return Response.json({error:rErr.message},{status:400,headers:corsHeaders});

  let qc=0,qt=0,vc=0,vt=0;
  for(const g of graded){
    if(g.section==="Quant"){qt++;if(g.is_correct)qc++;}
    if(g.section==="Verbal"){vt++;if(g.is_correct)vc++;}
  }
  const quantScore=scale(qc,qt),verbalScore=scale(vc,vt);
  const totalScore=(quantScore!==null&&verbalScore!==null)?quantScore+verbalScore:null;

  const {error:uErr}=await admin.from("test_sessions").update({
    status:"completed",completed_at:new Date().toISOString(),duration_seconds:durationSeconds,
    quant_score:quantScore,verbal_score:verbalScore,total_score:totalScore
  }).eq("id",sessionId).eq("user_id",user.id);
  if(uErr) return Response.json({error:uErr.message},{status:400,headers:corsHeaders});

  // Maintain per-skill aggregate statistics for the authenticated student.
  const skillGroups=new Map<string,{attempted:number;correct:number;times:number[]}>();
  for(const g of graded){
    const skill=String(g.skill||"Unknown");
    const cur=skillGroups.get(skill)||{attempted:0,correct:0,times:[]};
    cur.attempted++; if(g.is_correct)cur.correct++;
    if(Number.isFinite(Number(g.response_time_seconds)))cur.times.push(Number(g.response_time_seconds));
    skillGroups.set(skill,cur);
  }
  for(const [skill,delta] of skillGroups){
    const {data:old}=await admin.from("student_skill_stats").select("attempted,correct,avg_time")
      .eq("user_id",user.id).eq("skill",skill).maybeSingle();
    const oldAttempted=Number(old?.attempted||0),oldCorrect=Number(old?.correct||0);
    const newAttempted=oldAttempted+delta.attempted,newCorrect=oldCorrect+delta.correct;
    let avgTime=old?.avg_time==null?null:Number(old.avg_time);
    if(delta.times.length){
      const deltaAvg=delta.times.reduce((a,b)=>a+b,0)/delta.times.length;
      avgTime=avgTime==null?deltaAvg:((avgTime*oldAttempted)+(deltaAvg*delta.attempted))/newAttempted;
    }
    await admin.from("student_skill_stats").upsert({
      user_id:user.id,skill,attempted:newAttempted,correct:newCorrect,avg_time:avgTime,updated_at:new Date().toISOString()
    },{onConflict:"user_id,skill"});
  }

  return Response.json({
    graded,
    correct:graded.filter((x:any)=>x.is_correct).length,
    total:graded.length,
    quant_score:quantScore,
    verbal_score:verbalScore,
    total_score:totalScore
  },{headers:{...corsHeaders,"Content-Type":"application/json"}});
});
