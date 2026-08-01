import { useState, useEffect, useRef } from "react";

/* ─────────────────────── DATA ─────────────────────── */
const NAV_LINKS = [
  { label: "Product",   href: "#features" },
  { label: "Resources", href: "#blog" },
  { label: "Pricing",   href: "#pricing" },
  { label: "Blog",      href: "#blog" },
];

const STATS = [
  { num: "40K+", lbl: "Professionals", icon: "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  { num: "98%", lbl: "Match Rate",     icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { num: "3.2x", lbl: "Faster Hiring", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { num: "4.9★", lbl: "App Rating",    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" },
];

const FEATURES = [
  {
    title: "AI Resume Builder",
    desc: "Generate ATS-optimised, role-tailored resumes in seconds. Our model analyses 50K+ job descriptions to surface exactly the right keywords.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
    tag: "Most popular",
  },
  {
    title: "Smart Job Matching",
    desc: "Stop scrolling job boards. CareerPilot surfaces roles that match your skills, salary expectations, and culture fit — before they go viral.",
    icon: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    tag: "New",
  },
  {
    title: "Interview Co-Pilot",
    desc: "Practice with an AI that adapts to each company's known interview style. Get real-time feedback on pacing, clarity, and confidence.",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 4v-4z",
    tag: null,
  },
  {
    title: "Salary Intelligence",
    desc: "Know your number before you negotiate. Real-time compensation data from 2M+ offers, broken down by role, level, company, and location.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    tag: null,
  },
  {
    title: "Career Path Mapping",
    desc: "Visualise the fastest routes to your dream role. Compare skills gaps, estimated timelines, and the exact moves that high-achievers made.",
    icon: "M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0 8V9m0 0L9 7",
    tag: null,
  },
  {
    title: "Network Radar",
    desc: "Uncover warm paths into your target companies. AI maps your extended network and surfaces who can make an intro at the right moment.",
    icon: "M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1",
    tag: null,
  },
];

const BLOG_POSTS = [
  {
    tag: "Career Strategy",
    tagColor: "#00F0C8",
    title: "How to Negotiate a 30% Raise Without Losing the Offer",
    excerpt: "Most professionals leave $20K+ on the table in their first negotiation. Here's the exact playbook our top users follow — backed by 500K real offer outcomes.",
    author: "Sarah Chen",
    role: "Head of Career Research",
    date: "May 18, 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    tag: "AI & Work",
    tagColor: "#0099FF",
    title: "The Rise of the AI-Native Job Seeker",
    excerpt: "Candidates using AI tools are landing roles 3x faster. But there's a right and a wrong way to leverage AI in your job search.",
    author: "Marcus Reid",
    role: "Product Lead",
    date: "May 14, 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    tag: "Resume Tips",
    tagColor: "#A855F7",
    title: "7 Resume Mistakes That Kill ATS Scores in 2026",
    excerpt: "Applicant tracking systems have gotten smarter — and so have the ways to beat them. Avoid these common pitfalls to get seen by real humans.",
    author: "Priya Nair",
    role: "Resume Strategist",
    date: "May 10, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    tag: "Interview Prep",
    tagColor: "#F59E0B",
    title: "STAR Method 2.0: Why Classic Frameworks Are Failing Candidates",
    excerpt: "The old Situation-Task-Action-Result format is being gamed by everyone. Here's what elite interviewers actually want to hear.",
    author: "James Okafor",
    role: "Interview Coach",
    date: "May 6, 2026",
    readTime: "7 min read",
    featured: false,
  },
];

const TESTIMONIALS = [
  { name: "Aisha P.", role: "Software Engineer → Staff Eng", quote: "Landed a $60K raise using CareerPilot's salary data. The negotiation playbook was spot-on.", avatar: "A" },
  { name: "Leo T.", role: "Marketing → Product Manager", quote: "The career path mapping showed me exactly which skills to build. Transitioned in 8 months.", avatar: "L" },
  { name: "Nina R.", role: "Recent Graduate", quote: "Got 3 offers in 6 weeks. The resume builder and interview prep together are unbeatable.", avatar: "N" },
];

/* ─────────────────────── COMPONENT ─────────────────────── */
export default function CareerPilotHome() {
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const subscribe = () => {
    if (email.includes("@")) { setSubDone(true); setEmail(""); setTimeout(() => setSubDone(false), 3000); }
  };

  return (
    <div style={{ background: "#020B18", minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }

        /* ── Animations ── */
        @keyframes orbFloat  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.06)} }
        @keyframes orbFloat2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(20px) scale(.96)} }
        @keyframes pulseDot  { 0%,100%{box-shadow:0 0 6px rgba(0,240,200,.8)} 50%{box-shadow:0 0 18px rgba(0,240,200,1),0 0 36px rgba(0,240,200,.4)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes scanLine  { 0%{top:-100%} 100%{top:100%} }
        @keyframes shimmerMove { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes counterUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .orb1 { animation: orbFloat  11s ease-in-out infinite; }
        .orb2 { animation: orbFloat2  9s ease-in-out infinite 2s; }
        .orb3 { animation: orbFloat  13s ease-in-out infinite 5s; }
        .orb4 { animation: orbFloat2  8s ease-in-out infinite 3s; }
        .sdot { animation: pulseDot 2s ease-in-out infinite; }

        .fade-up   { animation: fadeUp .7s ease both; }
        .fade-up-2 { animation: fadeUp .7s ease .15s both; }
        .fade-up-3 { animation: fadeUp .7s ease .3s  both; }
        .fade-up-4 { animation: fadeUp .7s ease .45s both; }
        .fade-in   { animation: fadeIn .5s ease both; }

        /* ── Grid texture ── */
        .grid-bg {
          background-image: linear-gradient(rgba(0,240,200,.04) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(0,240,200,.04) 1px,transparent 1px);
          background-size: 44px 44px;
        }

        /* ── Glass card ── */
        .glass-card {
          background: linear-gradient(145deg,rgba(0,240,200,.05),rgba(0,153,255,.03));
          border: 1px solid rgba(0,240,200,.12);
          backdrop-filter: blur(20px);
          box-shadow: inset 0 1px 0 rgba(0,240,200,.1), 0 4px 32px rgba(0,0,0,.35);
          transition: border-color .25s, box-shadow .25s, transform .25s;
        }
        .glass-card:hover {
          border-color: rgba(0,240,200,.3);
          box-shadow: inset 0 1px 0 rgba(0,240,200,.15), 0 8px 48px rgba(0,0,0,.5), 0 0 32px rgba(0,240,200,.08);
          transform: translateY(-3px);
        }

        /* ── Blog card ── */
        .blog-card {
          background: linear-gradient(145deg,rgba(0,240,200,.04),rgba(0,30,60,.6));
          border: 1px solid rgba(0,240,200,.1);
          backdrop-filter: blur(20px);
          transition: border-color .25s, box-shadow .25s, transform .25s;
          overflow: hidden;
        }
        .blog-card:hover {
          border-color: rgba(0,240,200,.28);
          box-shadow: 0 8px 40px rgba(0,0,0,.5), 0 0 24px rgba(0,240,200,.07);
          transform: translateY(-4px);
        }
        .blog-card .read-more {
          color: rgba(0,240,200,.6);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .5px;
          transition: color .2s, letter-spacing .2s;
        }
        .blog-card:hover .read-more { color: #00F0C8; letter-spacing: 1px; }

        /* ── Buttons ── */
        .btn-primary {
          background: linear-gradient(135deg,#00F0C8,#0099FF) !important;
          color: #020B18 !important;
          border: none; border-radius: 12px;
          font-family: inherit; font-weight: 800; font-size: 14px;
          cursor: pointer; padding: 13px 28px;
          box-shadow: 0 0 24px rgba(0,240,200,.35);
          transition: box-shadow .22s, transform .15s;
          display: inline-flex; align-items: center; gap: 8px;
          white-space: nowrap;
        }
        .btn-primary:hover {
          box-shadow: 0 0 44px rgba(0,240,200,.55), 0 0 80px rgba(0,153,255,.25) !important;
          transform: translateY(-2px);
          background: linear-gradient(135deg,#00F0C8,#0099FF) !important;
          color: #020B18 !important;
        }
        .btn-ghost {
          background: rgba(0,240,200,.07);
          border: 1px solid rgba(0,240,200,.2);
          color: rgba(255,255,255,.7);
          border-radius: 12px; font-family: inherit; font-weight: 700; font-size: 14px;
          cursor: pointer; padding: 13px 28px;
          transition: all .2s;
          display: inline-flex; align-items: center; gap: 8px;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: rgba(0,240,200,.13); border-color: rgba(0,240,200,.4); color: #00F0C8; }

        /* ── Gradient text ── */
        .grad-text {
          background: linear-gradient(90deg,#00F0C8,#0099FF 50%,#A855F7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .grad-text-2 {
          background: linear-gradient(90deg,#00F0C8,#0099FF);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Hero scan ── */
        .scan-line {
          position:absolute; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(0,240,200,.6),transparent);
          animation: scanLine 4s linear infinite;
          pointer-events:none;
        }

        /* ── Shimmer badge ── */
        .shimmer-badge {
          background: linear-gradient(90deg,rgba(0,240,200,.08) 0%,rgba(0,240,200,.2) 50%,rgba(0,240,200,.08) 100%);
          background-size: 200% auto;
          animation: shimmerMove 3s linear infinite;
        }

        /* ── Responsive ── */
        @media (max-width:768px) {
          .hero-title   { font-size: clamp(36px,10vw,56px) !important; }
          .feat-grid    { grid-template-columns: 1fr !important; }
          .stats-grid   { grid-template-columns: 1fr 1fr !important; }
          .blog-grid    { grid-template-columns: 1fr !important; }
          .test-grid    { grid-template-columns: 1fr !important; }
        }
        @media (max-width:480px) {
          .stats-grid   { grid-template-columns: 1fr !important; }
          .hero-ctas    { flex-direction: column !important; align-items: stretch !important; }
          .hero-ctas button, .hero-ctas a { text-align:center; justify-content:center; width:100%; }
        }
      `}</style>

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} style={{ position:"relative", overflow:"hidden", padding:"100px 24px 120px", minHeight:"88vh", display:"flex", alignItems:"center" }}>
        {/* bg */}
        <div className="grid-bg" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,240,200,.1) 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* Orbs */}
        {[
          { cls:"orb1", w:600, h:600, t:-200, l:-150, col:"rgba(0,240,200,.15)", bl:60 },
          { cls:"orb2", w:500, h:500, t:-100, r:-100, col:"rgba(99,51,255,.18)", bl:70 },
          { cls:"orb3", w:350, h:350, b:0,   l:"35%", col:"rgba(0,153,255,.12)", bl:55 },
          { cls:"orb4", w:250, h:250, b:60,  r:60,    col:"rgba(255,60,160,.1)",  bl:50 },
        ].map(({ cls,w,h,t,l,r,b,col,bl }) => (
          <div key={cls} className={cls} style={{ position:"absolute", width:w, height:h, top:t, left:l, right:r, bottom:b, borderRadius:"50%", background:`radial-gradient(circle,${col} 0%,transparent 65%)`, filter:`blur(${bl}px)`, pointerEvents:"none" }} />
        ))}

        {/* Scan line */}
        <div className="scan-line" />

        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
          {/* Badge */}
          <div className="fade-in" style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <div className="shimmer-badge" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:99, border:"1px solid rgba(0,240,200,.22)" }}>
              <div className="sdot" style={{ width:7, height:7, borderRadius:"50%", background:"#00F0C8" }} />
              <span style={{ fontSize:11.5, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"rgba(0,240,200,.85)" }}>Now in public beta · 40,000+ users</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="hero-title fade-up" style={{ fontSize:"clamp(44px,6vw,84px)", fontWeight:900, lineHeight:1.05, letterSpacing:"-2px", color:"#fff", marginBottom:24, maxWidth:900 }}>
            Your AI co-pilot for<br />
            <span className="grad-text">every career move.</span>
          </h1>

          <p className="fade-up-2" style={{ fontSize:"clamp(15px,2vw,19px)", color:"rgba(255,255,255,.5)", lineHeight:1.65, maxWidth:580, marginBottom:40, fontWeight:500 }}>
            Land roles 3x faster. Negotiate salaries with real data. Prep for interviews with an AI that knows your target company inside-out.
          </p>

          {/* CTAs */}
          <div className="hero-ctas fade-up-3" style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", marginBottom:56 }}>
            <button className="btn-primary" style={{ fontSize:15, padding:"14px 32px" }}>Start for free →</button>
            <button className="btn-ghost" style={{ fontSize:15, padding:"14px 32px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Watch demo
            </button>
          </div>

          {/* Social proof row */}
          <div className="fade-up-4" style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
            <div style={{ display:"flex" }}>
              {["A","B","C","D","E"].map((l,i) => (
                <div key={l} style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,hsl(${i*40+160},70%,45%),hsl(${i*40+200},70%,35%))`, border:"2px solid #020B18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", marginLeft: i ? -10 : 0, zIndex:5-i, position:"relative" }}>{l}</div>
              ))}
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.45)", fontWeight:500 }}>Joined by <span style={{ color:"#00F0C8", fontWeight:700 }}>40,000+</span> professionals this month</div>
            <div style={{ display:"flex", gap:3 }}>
              {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/></svg>)}
              <span style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginLeft:6, fontWeight:600 }}>4.9 / 5.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section style={{ padding:"0 24px 80px", position:"relative" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {STATS.map(({ num, lbl, icon }) => (
              <div key={lbl} className="glass-card" style={{ borderRadius:20, padding:"28px 24px", textAlign:"center" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(0,240,200,.08)", border:"1px solid rgba(0,240,200,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:"#00F0C8" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                </div>
                <div className="grad-text-2" style={{ fontSize:36, fontWeight:900, lineHeight:1, marginBottom:6 }}>{num}</div>
                <div style={{ fontSize:12.5, fontWeight:600, color:"rgba(255,255,255,.4)", letterSpacing:".5px", textTransform:"uppercase" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" style={{ padding:"80px 24px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent,rgba(0,240,200,.03) 50%,transparent)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          {/* Section header */}
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", borderRadius:99, background:"rgba(0,240,200,.08)", border:"1px solid rgba(0,240,200,.2)", marginBottom:20 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#00F0C8" }}>Platform features</span>
            </div>
            <h2 style={{ fontSize:"clamp(30px,4vw,52px)", fontWeight:900, color:"#fff", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:16 }}>
              Everything you need to<br/><span className="grad-text">win at your career.</span>
            </h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,.45)", maxWidth:520, margin:"0 auto", lineHeight:1.6 }}>
              Six precision tools — one integrated platform. Each powered by models trained on millions of real career outcomes.
            </p>
          </div>

          {/* Feature grid */}
          <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="glass-card" style={{ borderRadius:20, padding:"28px", position:"relative", overflow:"hidden" }}>
                {/* tag */}
                {f.tag && (
                  <div style={{ position:"absolute", top:20, right:20, padding:"3px 10px", borderRadius:99, background:"rgba(0,240,200,.12)", border:"1px solid rgba(0,240,200,.3)", fontSize:10, fontWeight:700, color:"#00F0C8", letterSpacing:".5px", textTransform:"uppercase" }}>{f.tag}</div>
                )}
                {/* Number watermark */}
                <div style={{ position:"absolute", bottom:-16, right:16, fontSize:100, fontWeight:900, color:"rgba(0,240,200,.03)", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>0{i+1}</div>
                <div style={{ width:48, height:48, borderRadius:13, background:"linear-gradient(135deg,rgba(0,240,200,.12),rgba(0,153,255,.08))", border:"1px solid rgba(0,240,200,.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, color:"#00F0C8" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                </div>
                <h3 style={{ fontSize:17, fontWeight:800, color:"rgba(255,255,255,.9)", marginBottom:10, letterSpacing:"-.3px" }}>{f.title}</h3>
                <p style={{ fontSize:13.5, color:"rgba(255,255,255,.42)", lineHeight:1.65, fontWeight:500 }}>{f.desc}</p>
                <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:6, color:"rgba(0,240,200,.65)", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
                  Learn more
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section style={{ padding:"80px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 100%,rgba(0,153,255,.07) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", borderRadius:99, background:"rgba(0,153,255,.08)", border:"1px solid rgba(0,153,255,.2)", marginBottom:20 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#0099FF" }}>Testimonials</span>
            </div>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"#fff", letterSpacing:"-1.5px" }}>Real results from real people.</h2>
          </div>

          <div className="test-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="glass-card" style={{ borderRadius:20, padding:"28px", position:"relative", opacity: i === activeTestimonial ? 1 : .65, transition:"opacity .5s, transform .5s", transform: i === activeTestimonial ? "scale(1.02)" : "scale(1)" }}>
                <div style={{ display:"flex", gap:3, marginBottom:14 }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/></svg>)}
                </div>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.65)", lineHeight:1.65, fontWeight:500, marginBottom:20, fontStyle:"italic" }}>"{t.quote}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#00F0C8,#0099FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#020B18", flexShrink:0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:800, color:"rgba(255,255,255,.85)" }}>{t.name}</div>
                    <div style={{ fontSize:11.5, color:"rgba(255,255,255,.35)", fontWeight:500 }}>{t.role}</div>
                  </div>
                </div>
                {i === activeTestimonial && (
                  <div style={{ position:"absolute", top:16, right:16, width:8, height:8, borderRadius:"50%", background:"#00F0C8", boxShadow:"0 0 10px rgba(0,240,200,.8)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:28 }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i===activeTestimonial?24:8, height:8, borderRadius:99, background: i===activeTestimonial?"#00F0C8":"rgba(0,240,200,.25)", border:"none", cursor:"pointer", transition:"all .3s", padding:0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ BLOG ═══════════════ */}
      <section id="blog" style={{ padding:"80px 24px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent,rgba(0,240,200,.025) 50%,transparent)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:40 }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", borderRadius:99, background:"rgba(168,85,247,.08)", border:"1px solid rgba(168,85,247,.2)", marginBottom:20 }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#A855F7" }}>Career Blog</span>
              </div>
              <h2 style={{ fontSize:"clamp(28px,4vw,52px)", fontWeight:900, color:"#fff", letterSpacing:"-1.5px", lineHeight:1.1 }}>
                Insights that <span className="grad-text">move careers.</span>
              </h2>
            </div>
            <button className="btn-ghost" style={{ fontSize:13, padding:"10px 22px", borderRadius:10, flexShrink:0 }}>View all posts →</button>
          </div>

          {/* Featured + sidebar */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            {/* Featured post */}
            <div className="blog-card" style={{ borderRadius:22, padding:"36px", gridRow:"span 1", position:"relative", overflow:"hidden", cursor:"pointer" }}>
              <div style={{ position:"absolute", top:0, right:0, width:200, height:200, background:"radial-gradient(circle at top right,rgba(0,240,200,.08),transparent 70%)", pointerEvents:"none" }} />
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(0,240,200,.1)", border:"1px solid rgba(0,240,200,.25)", marginBottom:18 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#00F0C8" }} />
                <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color:"#00F0C8" }}>{BLOG_POSTS[0].tag}</span>
              </div>
              <h3 style={{ fontSize:"clamp(20px,2.5vw,28px)", fontWeight:900, color:"rgba(255,255,255,.92)", lineHeight:1.2, letterSpacing:"-.5px", marginBottom:14 }}>{BLOG_POSTS[0].title}</h3>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.7, marginBottom:28, fontWeight:500 }}>{BLOG_POSTS[0].excerpt}</p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#00F0C8,#0099FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#020B18" }}>S</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.8)" }}>{BLOG_POSTS[0].author}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{BLOG_POSTS[0].date} · {BLOG_POSTS[0].readTime}</div>
                  </div>
                </div>
                <span className="read-more">Read article →</span>
              </div>
            </div>

            {/* Secondary posts col */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {BLOG_POSTS.slice(1,3).map((post, i) => (
                <div key={post.title} className="blog-card" style={{ borderRadius:20, padding:"24px 28px", cursor:"pointer", flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background: post.tagColor, boxShadow:`0 0 8px ${post.tagColor}` }} />
                    <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color: post.tagColor }}>{post.tag}</span>
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:800, color:"rgba(255,255,255,.85)", lineHeight:1.3, letterSpacing:"-.2px", marginBottom:10 }}>{post.title}</h3>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,.38)", lineHeight:1.6, marginBottom:16, fontWeight:500 }}>{post.excerpt.slice(0,100)}…</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.3)", fontWeight:500 }}>{post.date} · {post.readTime}</span>
                    <span className="read-more">Read →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="blog-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {BLOG_POSTS.slice(3).map(post => (
              <div key={post.title} className="blog-card" style={{ borderRadius:20, padding:"24px 28px", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background: post.tagColor, boxShadow:`0 0 8px ${post.tagColor}` }} />
                  <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color: post.tagColor }}>{post.tag}</span>
                </div>
                <h3 style={{ fontSize:16, fontWeight:800, color:"rgba(255,255,255,.85)", lineHeight:1.3, letterSpacing:"-.2px", marginBottom:10 }}>{post.title}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,.38)", lineHeight:1.6, marginBottom:16, fontWeight:500 }}>{post.excerpt.slice(0,100)}…</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${post.tagColor},#0099FF)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#020B18" }}>{post.author[0]}</div>
                    <span style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,.45)" }}>{post.author}</span>
                  </div>
                  <span className="read-more">Read →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BAND ═══════════════ */}
      <section id="pricing" style={{ padding:"80px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ position:"relative", borderRadius:28, overflow:"hidden", padding:"64px 48px", background:"linear-gradient(145deg,rgba(0,240,200,.08),rgba(0,153,255,.06),rgba(168,85,247,.08))", border:"1px solid rgba(0,240,200,.18)", boxShadow:"inset 0 1px 0 rgba(0,240,200,.15),0 0 80px rgba(0,240,200,.08)", textAlign:"center" }}>
            {/* bg glow */}
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(0,240,200,.08) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div className="grid-bg" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", borderRadius:99, background:"rgba(0,240,200,.1)", border:"1px solid rgba(0,240,200,.25)", marginBottom:24 }}>
                <div className="sdot" style={{ width:6, height:6, borderRadius:"50%", background:"#00F0C8" }} />
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#00F0C8" }}>Free to start</span>
              </div>
              <h2 style={{ fontSize:"clamp(28px,4vw,54px)", fontWeight:900, color:"#fff", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:18 }}>
                Ready to pilot your<br/><span className="grad-text">next career chapter?</span>
              </h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,.45)", maxWidth:480, margin:"0 auto 36px", lineHeight:1.65 }}>
                Join 40,000+ professionals. No credit card needed. Full access for 14 days.
              </p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
                <button className="btn-primary" style={{ fontSize:15, padding:"15px 36px" }}>Get started free →</button>
                <button className="btn-ghost" style={{ fontSize:15, padding:"15px 36px" }}>See pricing</button>
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.25)", marginTop:18, fontWeight:500 }}>No credit card · Cancel anytime · GDPR compliant</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}