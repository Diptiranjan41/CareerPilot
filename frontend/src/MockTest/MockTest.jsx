import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ── API Configuration ───────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
axios.defaults.withCredentials = true;

// ── Brand tokens ───────────────────────────────────────────────────────────
const BG   = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const CARD = "linear-gradient(145deg,rgba(0,240,200,.06),rgba(0,153,255,.03))";
const BORDER = "1px solid rgba(0,240,200,.13)";
const SHADOW = "inset 0 1px 0 rgba(0,240,200,.1),0 8px 48px rgba(0,0,0,.5)";
const ACCENT   = "#00F0C8";
const ACCENT2  = "#0099FF";
const ACCENT_DIM = "rgba(0,240,200,.08)";
const ACCENT_BORDER = "rgba(0,240,200,.18)";
const T1 = "rgba(255,255,255,.92)";
const T2 = "rgba(255,255,255,.55)";
const T3 = "rgba(255,255,255,.32)";
const T4 = "rgba(255,255,255,.22)";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body,html{font-family:'Cabinet Grotesk',sans-serif}
.cp{font-family:'Cabinet Grotesk',sans-serif}
@keyframes orbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.06)}}
@keyframes pulseDot{0%,100%{box-shadow:0 0 6px rgba(0,240,200,.8)}50%{box-shadow:0 0 18px rgba(0,240,200,1),0 0 36px rgba(0,240,200,.4)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.6}}
.orb1{animation:orbFloat 9s ease-in-out infinite}
.orb2{animation:orbFloat 12s ease-in-out infinite 3s}
.orb3{animation:orbFloat 8s ease-in-out infinite 6s}
.sdot{animation:pulseDot 2s ease-in-out infinite}
.fadeup{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) forwards}
.fadeup2{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .1s forwards;opacity:0}
.fadeup3{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .2s forwards;opacity:0}
.card{background:${CARD};border:${BORDER};border-radius:22px;backdrop-filter:blur(24px);box-shadow:${SHADOW}}
.card-sm{background:linear-gradient(145deg,rgba(0,240,200,.05),rgba(0,153,255,.02));border:1px solid rgba(0,240,200,.11);border-radius:16px;backdrop-filter:blur(16px)}
.lbl{font-size:11px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:rgba(0,240,200,.65);display:block;margin-bottom:7px}
.sbtn{
  width:100%;padding:14px;border:none;border-radius:12px;
  background:linear-gradient(135deg,#00F0C8,#0099FF);
  color:#020B18;font-family:'Cabinet Grotesk',sans-serif;
  font-size:15px;font-weight:800;cursor:pointer;
  transition:all .25s;box-shadow:0 0 28px rgba(0,240,200,.35);letter-spacing:.3px;
}
.sbtn:hover:not(:disabled){box-shadow:0 0 52px rgba(0,240,200,.65),0 0 90px rgba(0,153,255,.3);transform:translateY(-2px)}
.sbtn:disabled{opacity:.55;cursor:not-allowed}
.sbtn-outline{
  width:100%;padding:12px;border:1px solid rgba(0,240,200,.22);border-radius:12px;
  background:rgba(0,240,200,.05);color:${ACCENT};font-family:'Cabinet Grotesk',sans-serif;
  font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;
}
.sbtn-outline:hover{background:rgba(0,240,200,.1);border-color:rgba(0,240,200,.4);box-shadow:0 0 24px rgba(0,240,200,.15)}
.cat-btn{
  padding:14px 10px;border-radius:14px;border:1px solid rgba(0,240,200,.1);
  background:rgba(255,255,255,.03);cursor:pointer;text-align:center;
  transition:all .2s;backdrop-filter:blur(8px);font-family:'Cabinet Grotesk',sans-serif;
}
.cat-btn:hover{border-color:rgba(0,240,200,.28);background:rgba(0,240,200,.06)}
.cat-btn.active{border-color:${ACCENT};background:rgba(0,240,200,.1);box-shadow:0 0 20px rgba(0,240,200,.12)}
.pill{
  padding:7px 16px;border-radius:100px;border:1px solid rgba(0,240,200,.14);
  background:rgba(255,255,255,.04);color:${T2};font-size:12px;font-weight:600;
  cursor:pointer;transition:all .18s;font-family:'Cabinet Grotesk',sans-serif;
  backdrop-filter:blur(8px);
}
.pill:hover{border-color:rgba(0,240,200,.3);color:${ACCENT}}
.pill.active{border-color:${ACCENT};background:rgba(0,240,200,.1);color:${ACCENT}}
.opt-btn{
  width:100%;text-align:left;padding:14px 18px;border-radius:12px;
  border:1px solid rgba(0,240,200,.1);background:rgba(255,255,255,.03);
  color:${T2};font-size:14px;cursor:pointer;transition:all .18s;
  font-family:'Cabinet Grotesk',sans-serif;display:flex;align-items:center;gap:12px;
}
.opt-btn:hover:not(:disabled){border-color:rgba(0,240,200,.28);background:rgba(0,240,200,.05);color:${T1}}
.opt-btn.selected{border-color:${ACCENT};background:rgba(0,240,200,.08);color:${ACCENT}}
.opt-btn.correct{border-color:#22c55e;background:rgba(34,197,94,.1);color:#4ade80}
.opt-btn.wrong{border-color:#ef4444;background:rgba(239,68,68,.1);color:#f87171}
.opt-btn:disabled{cursor:default}
.navlink-btn{
  flex:1;padding:13px;border-radius:12px;border:1px solid rgba(0,240,200,.13);
  background:rgba(255,255,255,.03);color:${T2};font-size:14px;font-weight:600;
  cursor:pointer;transition:all .2s;font-family:'Cabinet Grotesk',sans-serif;
}
.navlink-btn:hover:not(:disabled){background:rgba(0,240,200,.06);border-color:rgba(0,240,200,.28);color:${T1}}
.navlink-btn:disabled{opacity:.4;cursor:not-allowed}
.divline{flex:1;height:1px;background:rgba(0,240,200,.1)}
input[type=range]{width:100%;accent-color:${ACCENT};cursor:pointer}
.urgent{animation:timerPulse 1s ease-in-out infinite}
`;

// ── Orbs background ────────────────────────────────────────────────────────
const Orbs = () => (
  <>
    {[
      { cls:"orb1", w:480,h:480,t:-180,l:-140,col:"rgba(0,240,200,.15)",bl:55 },
      { cls:"orb2", w:380,h:380,t:-60,r:-100,col:"rgba(99,51,255,.2)",bl:60 },
      { cls:"orb3", w:260,h:260,b:-60,l:"45%",col:"rgba(0,200,255,.13)",bl:50 },
    ].map(({cls,w,h,t,l,r,b,col,bl})=>(
      <div key={cls} className={cls} style={{position:"absolute",width:w,height:h,top:t,left:l,right:r,bottom:b,borderRadius:"50%",background:`radial-gradient(circle,${col} 0%,transparent 65%)`,filter:`blur(${bl}px)`,pointerEvents:"none"}}/>
    ))}
    <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,240,200,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,200,.03) 1px,transparent 1px)",backgroundSize:"44px 44px"}}/>
  </>
);

// ── Data ───────────────────────────────────────────────────────────────────
const categories = [
  {id:"Aptitude",label:"Aptitude",icon:"◈",sub:"Quant & Logic"},
  {id:"Java",label:"Java",icon:"◉",sub:"Core & Advanced"},
  {id:"DSA",label:"DSA",icon:"◆",sub:"Algo & DS"},
  {id:"SQL",label:"SQL",icon:"◇",sub:"DB & Queries"},
  {id:"Web Development",label:"Web Dev",icon:"◎",sub:"HTML CSS JS"},
  {id:"Operating System",label:"OS",icon:"⬡",sub:"Processes & Mem"},
  {id:"Computer Networks",label:"Networks",icon:"◈",sub:"TCP/IP & Proto"},
  {id:"HR Interview",label:"HR",icon:"◉",sub:"Soft Skills"},
];
const difficulties = [
  {value:"Mixed",label:"Mixed"},
  {value:"Easy",label:"Easy"},
  {value:"Medium",label:"Medium"},
  {value:"Hard",label:"Hard"},
];
const topicsByCategory = {
  Aptitude:["Numbers","Percentages","Profit & Loss","Time & Work","Time & Distance","Probability","Permutation & Combination","Ratio & Proportion","Averages","Data Interpretation","Logical Reasoning"],
  Java:["OOP Concepts","Collections","Multithreading","Exception Handling","Stream API","JVM Architecture","String Handling","Generics","Design Patterns"],
  DSA:["Arrays","Linked Lists","Stacks & Queues","Trees","Graphs","Dynamic Programming","Recursion","Sorting Algorithms","Searching Algorithms","Hashing"],
  "SQL":["Joins","Subqueries","Normalization","Indexes","Transactions","Views","Stored Procedures","Aggregate Functions","Window Functions"],
  "Web Development":["HTML/CSS","JavaScript","React","Node.js","REST APIs","Authentication","Web Security","CSS Animations"],
  "Operating System":["Process Management","Memory Management","File Systems","Deadlock","Synchronization","CPU Scheduling","Threads","Virtual Memory"],
  "Computer Networks":["OSI Model","TCP/IP","Network Security","Routing Protocols","IP Addressing","DNS","HTTP/HTTPS","Subnetting"],
  "HR Interview":["Tell me about yourself","Strengths & Weaknesses","Leadership","Teamwork","Problem Solving","Conflict Resolution","Career Goals"],
};

// ── AI generator (calls backend API) ───────────────────────────────────────
async function generateQuestionsAI({category, difficulty, topic, count}) {
  try {
    console.log("Calling backend API to generate questions...", {category, difficulty, topic, count});
    
    const response = await axios.post(`${API_URL}/mocktest/generate`, {
      category: category,
      difficulty: difficulty,
      topic: topic || "",
      numberOfQuestions: count
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Backend response:", response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from server");
    }
    
    return response.data;
  } catch (error) {
    console.error("Generation error:", error);
    
    if (error.response) {
      const errorMsg = error.response.data?.message || error.response.data?.error || "Server error";
      throw new Error(`${errorMsg} (Status: ${error.response.status})`);
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please check if backend is running on port 8080.");
    } else {
      throw new Error(error.message || "Failed to generate questions");
    }
  }
}

// ── Timer ring ─────────────────────────────────────────────────────────────
function TimerRing({seconds,total}){
  const pct=total>0?seconds/total:0;
  const r=30,circ=2*Math.PI*r;
  const urgent=seconds<60;
  const col=urgent?"#ef4444":ACCENT;
  const fmt=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
  return(
    <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
      <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(0,240,200,.08)" strokeWidth="3"/>
        <circle cx="40" cy="40" r={r} fill="none" stroke={col} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span className={urgent?"urgent":""} style={{fontSize:14,fontWeight:800,color:urgent?"#ef4444":ACCENT,lineHeight:1,fontFamily:"'Cabinet Grotesk',sans-serif"}}>{fmt}</span>
        <span style={{fontSize:9,color:"rgba(255,255,255,.28)",marginTop:2,fontWeight:600,letterSpacing:".5px"}}>LEFT</span>
      </div>
    </div>
  );
}

// ── Diff badge ─────────────────────────────────────────────────────────────
function DiffBadge({d}){
  const l=(d||"").toLowerCase();
  const cfg=l==="easy"?{bg:"rgba(34,197,94,.12)",col:"#4ade80"}:l==="hard"?{bg:"rgba(239,68,68,.12)",col:"#f87171"}:{bg:"rgba(251,191,36,.12)",col:"#fbbf24"};
  return <span style={{padding:"3px 12px",borderRadius:99,fontSize:10,fontWeight:700,background:cfg.bg,color:cfg.col,letterSpacing:".5px",textTransform:"uppercase"}}>{d}</span>;
}

// ── SCREEN 1: Config ───────────────────────────────────────────────────────
function ConfigScreen({onStart}){
  const [category,setCategory]=useState("");
  const [difficulty,setDifficulty]=useState("Mixed");
  const [topic,setTopic]=useState("");
  const [count,setCount]=useState(5);
  const [loading,setLoading]=useState(false);

  const handleGenerate=async()=>{
    if(!category){toast.error("Please select a category");return;}
    setLoading(true);
    try{
      const questions=await generateQuestionsAI({category,difficulty,topic,count});
      onStart({questions,category,difficulty,topic,count});
      toast.success(`${questions.length} questions generated successfully!`);
    }catch(e){
      toast.error("Generation failed — "+e.message);
    }finally{setLoading(false);}
  };

  return(
    <div className="cp" style={{background:BG,minHeight:"100vh",position:"relative",overflow:"hidden",padding:"48px 20px"}}>
      <style>{STYLES}</style>
      <Orbs/>
      <div style={{position:"relative",zIndex:10,maxWidth:800,margin:"0 auto"}}>
        {/* Badge */}
        <div className="fadeup" style={{display:"flex",justifyContent:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,background:ACCENT_DIM,border:`1px solid ${ACCENT_BORDER}`}}>
            <span className="sdot" style={{width:6,height:6,borderRadius:"50%",background:ACCENT,display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:ACCENT,textTransform:"uppercase"}}>AI Mock Test Generator · CareerPilot</span>
          </div>
        </div>

        {/* Title */}
        <div className="fadeup2" style={{textAlign:"center",marginBottom:44}}>
          <h1 style={{fontSize:"clamp(32px,6vw,54px)",fontWeight:900,color:T1,lineHeight:1.08,letterSpacing:"-1.5px",marginBottom:12}}>
            Placement-Ready<br/>
            <span style={{background:`linear-gradient(90deg,${ACCENT},${ACCENT2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Mock Tests</span>
          </h1>
          <p style={{fontSize:15,color:T3,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>AI-generated questions personalised to your category, difficulty & topic</p>
        </div>

        {/* Main card */}
        <div className="card fadeup3" style={{padding:"36px 32px"}}>
          {/* Category grid */}
          <div style={{marginBottom:28}}>
            <span className="lbl">Select Category</span>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {categories.map(c=>(
                <button key={c.id} className={`cat-btn${category===c.id?" active":""}`}
                  onClick={()=>{setCategory(c.id);setTopic("");}}>
                  <div style={{fontSize:20,marginBottom:5,color:category===c.id?ACCENT:"rgba(255,255,255,.28)"}}>{c.icon}</div>
                  <div style={{fontSize:12,fontWeight:800,color:category===c.id?ACCENT:T2,marginBottom:2}}>{c.label}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.22)"}}>{c.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty + Count */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:28}}>
            <div>
              <span className="lbl">Difficulty</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {difficulties.map(d=>(
                  <button key={d.value} className={`pill${difficulty===d.value?" active":""}`} onClick={()=>setDifficulty(d.value)}>{d.label}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="lbl">Questions — <span style={{color:ACCENT}}>{count}</span></span>
              <input type="range" min={3} max={15} step={1} value={count} onChange={e=>setCount(Number(e.target.value))} style={{marginBottom:4}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(255,255,255,.2)",fontWeight:600}}>
                <span>3</span><span>15</span>
              </div>
            </div>
          </div>

          {/* Topic pills */}
          {category&&(
            <div style={{marginBottom:28}}>
              <span className="lbl">Topic <span style={{color:"rgba(255,255,255,.2)",textTransform:"none",letterSpacing:0,fontWeight:400}}>— optional</span></span>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                <button className={`pill${topic===""?" active":""}`} onClick={()=>setTopic("")}>All topics</button>
                {(topicsByCategory[category]||[]).map(t=>(
                  <button key={t} className={`pill${topic===t?" active":""}`} onClick={()=>setTopic(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* Generate */}
          <button className="sbtn" onClick={handleGenerate} disabled={loading||!category}>
            {loading?(
              <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Generating {count} questions…
              </span>
            ):`Generate ${count} Questions →`}
          </button>
        </div>

        {/* Feature pills */}
        <div className="fadeup" style={{display:"flex",justifyContent:"center",gap:12,marginTop:24,flexWrap:"wrap"}}>
          {["🎯 Placement-focused","⚡ Instant generation","📊 Live score tracking","💡 AI explanations"].map(f=>(
            <span key={f} className="card-sm" style={{padding:"6px 14px",fontSize:11,color:T3,fontWeight:600}}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 2: Test ─────────────────────────────────────────────────────────
function TestScreen({questions, category, difficulty, topic, count, onBack}){
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [revealed,setRevealed]=useState({});
  const totalTime=questions.length*90;
  const [timeLeft,setTimeLeft]=useState(totalTime);
  const navigate = useNavigate();

  useEffect(()=>{
    const t=setInterval(()=>{
      setTimeLeft(p=>{
        if(p<=1){clearInterval(t);doSubmit();return 0;}
        return p-1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[]);

  const q=questions[idx];
  const answeredCount=Object.keys(answers).length;
  const progress=((idx+1)/questions.length)*100;

  const selectAnswer=(opt)=>{
    if(answers[idx]!==undefined)return;
    setAnswers(p=>({...p,[idx]:opt}));
    setRevealed(p=>({...p,[idx]:true}));
  };

  const doSubmit=()=>{
    const score = questions.reduce((acc,q,i)=>acc+(answers[i]===q.correct_answer?1:0),0);
    const percentage = Math.round((score / questions.length) * 100);
    
    const resultData = {
      questions,
      answers,
      score,
      percentage,
      category,
      difficulty,
      topic,
      totalQuestions: questions.length,
      correctAnswers: score,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // Save to sessionStorage as backup
    sessionStorage.setItem('mockTestResult', JSON.stringify(resultData));
    
    // Navigate to results page with matching route path (with hyphen)
    navigate('/mock-test/results', {
      state: resultData
    });
  };

  return(
    <div className="cp" style={{background:BG,minHeight:"100vh",position:"relative",overflow:"hidden",padding:"36px 20px"}}>
      <style>{STYLES}</style>
      <Orbs/>
      <div style={{position:"relative",zIndex:10,maxWidth:740,margin:"0 auto"}}>
        {/* Top bar */}
        <div className="fadeup" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
          <button onClick={onBack} style={{background:"none",border:`1px solid rgba(0,240,200,.13)`,color:T2,padding:"8px 16px",borderRadius:10,cursor:"pointer",fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:600}}>← Back</button>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div className="card-sm" style={{padding:"10px 18px",display:"flex",gap:20}}>
              {[
                {label:"Question",val:`${idx+1} / ${questions.length}`},
                {label:"Answered",val:`${answeredCount}`},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div style={{fontSize:17,fontWeight:800,color:T1}}>{s.val}</div>
                  <div style={{fontSize:9,color:T3,textTransform:"uppercase",letterSpacing:".7px",fontWeight:700}}>{s.label}</div>
                </div>
              ))}
            </div>
            <TimerRing seconds={timeLeft} total={totalTime}/>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{height:3,background:"rgba(0,240,200,.08)",borderRadius:99,marginBottom:24,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${ACCENT},${ACCENT2})`,borderRadius:99,transition:"width .3s ease"}}/>
        </div>

        {/* Question card */}
        <div className="card fadeup2" style={{padding:"32px",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontWeight:800,color:ACCENT,letterSpacing:".8px"}}>Q{idx+1}</span>
            <DiffBadge d={q.difficulty}/>
            <span className="card-sm" style={{padding:"3px 12px",fontSize:10,color:T3,fontWeight:600}}>{q.topic}</span>
          </div>
          <p style={{fontSize:16,color:T1,lineHeight:1.7,marginBottom:24,fontWeight:500}}>{q.question}</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:revealed[idx]?20:0}}>
            {q.options.map((opt,oi)=>{
              const isSelected=answers[idx]===opt;
              const isCorrect=opt===q.correct_answer;
              const show=revealed[idx];
              let cls="opt-btn";
              if(show&&isCorrect)cls+=" correct";
              else if(show&&isSelected&&!isCorrect)cls+=" wrong";
              else if(!show&&isSelected)cls+=" selected";
              return(
                <button key={oi} className={cls} onClick={()=>selectAnswer(opt)} disabled={!!answers[idx]}>
                  <span style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid currentColor`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,fontWeight:800}}>
                    {show&&isCorrect?"✓":show&&isSelected&&!isCorrect?"✗":String.fromCharCode(65+oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {revealed[idx]&&(
            <div style={{padding:"14px 18px",borderRadius:12,background:"rgba(0,240,200,.06)",border:"1px solid rgba(0,240,200,.15)"}}>
              <div style={{fontSize:9,color:ACCENT,fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Explanation</div>
              <p style={{fontSize:13,color:T2,lineHeight:1.65,margin:0}}>{q.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="fadeup3" style={{display:"flex",gap:10,alignItems:"center"}}>
          <button className="navlink-btn" onClick={()=>setIdx(p=>Math.max(0,p-1))} disabled={idx===0}>← Prev</button>
          <div style={{display:"flex",gap:5,alignItems:"center",padding:"0 8px"}}>
            {questions.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)} style={{
                width:i===idx?20:answers[i]!==undefined?8:6,
                height:i===idx?8:answers[i]!==undefined?8:6,
                borderRadius:99,border:"none",padding:0,cursor:"pointer",transition:"all .2s ease",
                background:i===idx?`linear-gradient(90deg,${ACCENT},${ACCENT2})`:answers[i]!==undefined?"rgba(0,240,200,.4)":"rgba(255,255,255,.15)",
              }}/>
            ))}
          </div>
          {idx===questions.length-1?(
            <button className="sbtn" style={{flex:1,padding:"13px"}} onClick={doSubmit}>Submit Test</button>
          ):(
            <button className="navlink-btn" onClick={()=>setIdx(p=>Math.min(questions.length-1,p+1))}>Next →</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function MockTestGenerator(){
  const [screen,setScreen]=useState("config");
  const [testData,setTestData]=useState(null);

  if(screen==="test" && testData) {
    return (
      <TestScreen 
        questions={testData.questions} 
        category={testData.category} 
        difficulty={testData.difficulty}
        topic={testData.topic}
        count={testData.count}
        onBack={() => setScreen("config")}
      />
    );
  }

  return <ConfigScreen onStart={d => { setTestData(d); setScreen("test"); }} />;
}