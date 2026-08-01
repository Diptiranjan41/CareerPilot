import { useState } from "react";

const C = {
  bg1: "#020B18",
  bg2: "#0F172A",
  teal: "#00F0C8",
  blue: "#0099FF",
  purple: "#A855F7",
  text1: "#F8FAFC",
  text2: "#E2E8F0",
  text3: "#94A3B8",
  glass2: "rgba(255,255,255,0.07)",
  glass3: "rgba(255,255,255,0.04)",
  border2: "rgba(255,255,255,0.08)",
  accent: "#00F0C8",
  accentBg: "rgba(0,240,200,0.08)",
  accentBorder: "rgba(0,240,200,0.22)",
};

const QUESTIONS = [
  {
    id: 1, tag: "Intro",
    q: "Tell me about yourself.",
    hint: "Structure: Present → Past → Future. Keep it under 2 minutes. Start with your current role, briefly cover relevant experience, then explain why you're excited about this opportunity.",
    example: "I'm a final-year CS student specialising in full-stack development. Over the past 2 years I've built 3 production projects using MERN stack, and recently completed an internship at a SaaS startup. I'm looking to join a team where I can grow as an engineer and contribute to real-world product impact.",
  },
  {
    id: 2, tag: "Strength",
    q: "What is your greatest strength?",
    hint: "Pick ONE strength most relevant to the role. Back it with a concrete example using a mini-STAR format.",
    example: "My greatest strength is breaking down complex problems. During my internship, I was handed a legacy codebase no one had touched in 2 years. I mapped out dependencies, documented the flow, and refactored the auth module — reducing login errors by 40%.",
  },
  {
    id: 3, tag: "Weakness",
    q: "What is your greatest weakness?",
    hint: "Choose a real but non-critical weakness. Immediately follow with what you're actively doing to improve it. Never say 'I'm a perfectionist' — interviewers hate that.",
    example: "I used to struggle with delegating tasks because I wanted to control quality. I've been actively working on this by using task boards with my team, setting clear acceptance criteria, and doing code reviews instead of rewriting everything myself.",
  },
  {
    id: 4, tag: "Future",
    q: "Where do you see yourself in 5 years?",
    hint: "Align with the company's growth trajectory. Show ambition but also loyalty. Don't say 'running my own startup' in a corporate interview.",
    example: "In 5 years I see myself as a senior engineer — someone who not only writes good code but mentors juniors and helps shape technical decisions. I'd love to grow within this company, given how much you invest in engineering culture.",
  },
  {
    id: 5, tag: "Leadership",
    q: "Describe a time you showed leadership.",
    hint: "Use STAR: Situation → Task → Action → Result. Leadership doesn't require a title — coordinating a team project, resolving conflict, or driving a deadline counts.",
    example: "During a hackathon, our team had no clear direction after 2 hours. I stepped up, split the problem into modules, assigned roles based on each member's strength, and set 3-hour checkpoints. We shipped a working prototype and placed second out of 28 teams.",
  },
  {
    id: 6, tag: "Motivation",
    q: "Why do you want to work here?",
    hint: "Research the company beforehand — mention something specific: a product, a value, a recent achievement. Generic answers like 'great company culture' are red flags.",
    example: "I've been following your product roadmap closely. The way you approached [specific feature] showed a real user-first mindset that I admire. I want to be part of a team that ships things that genuinely matter to users, not just hit metrics.",
  },
  {
    id: 7, tag: "Conflict",
    q: "Tell me about a conflict with a coworker.",
    hint: "Stay neutral — never blame the other person. Focus on the resolution and what you learned. Show emotional maturity and collaboration.",
    example: "During a project, a teammate and I disagreed on API design. Instead of escalating, I requested a 30-minute sync, presented my reasoning with data, listened to theirs, and we landed on a hybrid approach that we both owned. The feature shipped on time.",
  },
  {
    id: 8, tag: "Pressure",
    q: "How do you handle stress or pressure?",
    hint: "Give a specific strategy you actually use — not just 'I stay calm'. Tie it to a real situation where it worked.",
    example: "I break the pressure down: I list everything stressing me, sort by impact, and focus only on the top 2. During exam season last year, I had 3 project deadlines in one week. That prioritisation approach helped me deliver all three without burning out.",
  },
  {
    id: 9, tag: "Teamwork",
    q: "Describe your ideal work environment.",
    hint: "Mirror values that align with the company's culture. Mention collaboration, feedback culture, and growth — these are safe universals.",
    example: "I thrive in environments where feedback is direct and frequent, where failing fast is encouraged, and where engineers have real ownership. I love teams that balance async deep work with regular syncs so everyone stays aligned.",
  },
  {
    id: 10, tag: "Achievement",
    q: "What is your proudest achievement so far?",
    hint: "Pick something quantifiable if possible. Show impact, not just effort. 'I worked really hard' is weak — 'I reduced load time by 60%' is strong.",
    example: "My proudest achievement is building an open-source CLI tool that now has 800+ GitHub stars. I built it to solve my own frustration, documented it well, posted it on Reddit, and watched it grow. It taught me that good dev tools with good communication create their own momentum.",
  },
];

const TAGS = ["All", "Intro", "Strength", "Weakness", "Future", "Leadership", "Motivation", "Conflict", "Pressure", "Teamwork", "Achievement"];

const GridPattern = () => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#00F0C8" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
  </svg>
);

const Chip = ({ label, active, accent, onClick }) => (
  <button onClick={onClick} style={{
    fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
    padding: "4px 12px", borderRadius: 20, cursor: "pointer",
    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
    color: active ? accent : C.text3,
    border: `1px solid ${active ? `${accent}44` : "rgba(255,255,255,0.08)"}`,
    transition: "all 0.18s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  }}>{label}</button>
);

const ProgressBar = ({ done, total, accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${(done / total) * 100}%`,
        background: `linear-gradient(90deg, ${accent}, ${C.blue})`,
        borderRadius: 2, transition: "width 0.4s ease",
      }} />
    </div>
    <span style={{ fontSize: 11, color: C.text3, fontWeight: 600, whiteSpace: "nowrap" }}>{done}/{total} reviewed</span>
  </div>
);

const QuestionCard = ({ item, idx, accent, onReviewed, reviewed }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("hint");

  return (
    <div style={{
      background: open ? `rgba(0,240,200,0.04)` : C.glass3,
      border: `1px solid ${open ? `${accent}30` : C.border2}`,
      borderRadius: 14, overflow: "hidden",
      transition: "all 0.2s",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "16px 20px", cursor: "pointer",
          display: "flex", alignItems: "flex-start", gap: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, paddingTop: 2 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, color: accent,
            background: `${accent}18`, border: `1px solid ${accent}30`,
            borderRadius: 6, padding: "2px 7px", letterSpacing: "0.05em",
          }}>Q{idx + 1}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: accent, opacity: 0.7,
            background: `${accent}10`, borderRadius: 4, padding: "2px 5px",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>{item.tag}</span>
        </div>

        <span style={{ flex: 1, fontSize: 14, color: C.text1, lineHeight: 1.6, fontWeight: 500 }}>{item.q}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {reviewed && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#22C55E",
              background: "rgba(34,197,94,0.12)", borderRadius: 6, padding: "2px 7px",
              border: "1px solid rgba(34,197,94,0.25)",
            }}>✓ Done</span>
          )}
          <span style={{
            fontSize: 14, color: accent, transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none", display: "block",
          }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${accent}15` }}>
          <div style={{ display: "flex", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            {["hint", "example"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 700,
                color: tab === t ? accent : C.text3,
                background: tab === t ? `${accent}08` : "transparent",
                border: "none", borderBottom: `2px solid ${tab === t ? accent : "transparent"}`,
                cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
                fontFamily: "inherit", transition: "all 0.15s",
              }}>{t === "hint" ? "💡 Hint" : "📝 Sample Answer"}</button>
            ))}
          </div>

          <div style={{ padding: "16px 20px" }}>
            <p style={{ margin: 0, fontSize: 13.5, color: C.text2, lineHeight: 1.7 }}>
              {tab === "hint" ? item.hint : item.example}
            </p>
          </div>

          <div style={{ padding: "0 20px 16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => onReviewed(item.id)}
              style={{
                fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 8,
                background: reviewed ? "rgba(34,197,94,0.12)" : `${accent}15`,
                color: reviewed ? "#22C55E" : accent,
                border: `1px solid ${reviewed ? "rgba(34,197,94,0.3)" : `${accent}30`}`,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                letterSpacing: "0.04em",
              }}
            >{reviewed ? "✓ Reviewed" : "Mark as Reviewed"}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function HRInterview({ onBack }) {
  const [activeTag, setActiveTag] = useState("All");
  const [reviewed, setReviewed] = useState(new Set());

  const filtered = activeTag === "All" ? QUESTIONS : QUESTIONS.filter(q => q.tag === activeTag);

  const toggleReviewed = (id) => {
    setReviewed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg1, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <GridPattern />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          borderBottom: `1px solid ${C.border2}`,
          background: `${C.bg2}E0`,
          backdropFilter: "blur(16px)",
          padding: "0 28px",
          display: "flex", alignItems: "center", gap: 14, height: 58,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {onBack && (
            <button onClick={onBack} style={{
              background: C.glass2, border: `1px solid ${C.border2}`,
              color: C.text2, borderRadius: 8, padding: "6px 13px",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
            }}>← Back</button>
          )}
          <div style={{ width: 1, height: 22, background: C.border2 }} />
          <span style={{ fontSize: 18 }}>🎙️</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text1, letterSpacing: "-0.01em" }}>HR Interview</span>
          <div style={{ marginLeft: "auto" }}>
            <ProgressBar done={reviewed.size} total={QUESTIONS.length} accent={C.accent} />
          </div>
        </div>

        <div style={{ padding: "36px 28px", maxWidth: 780, margin: "0 auto" }}>

          <div style={{
            background: `linear-gradient(135deg, rgba(0,240,200,0.08), rgba(0,153,255,0.05), transparent)`,
            border: `1px solid ${C.accentBorder}`,
            borderRadius: 18, padding: "24px 26px", marginBottom: 32,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: "rgba(0,240,200,0.12)", border: "1px solid rgba(0,240,200,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                boxShadow: "0 0 20px rgba(0,240,200,0.2)",
              }}>🎙️</div>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: C.text1, letterSpacing: "-0.02em" }}>
                  HR Interview Prep
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Master behavioral questions — confidence, clarity, and authentic storytelling.
                </p>
              </div>
              <div style={{
                marginLeft: "auto", flexShrink: 0, textAlign: "center",
                background: "rgba(0,240,200,0.08)", borderRadius: 12,
                border: "1px solid rgba(0,240,200,0.2)", padding: "10px 18px",
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.accent }}>{QUESTIONS.length}</div>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 700, letterSpacing: "0.07em" }}>QUESTIONS</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Behavioral", "STAR Method", "Strengths", "Weaknesses", "Leadership", "Teamwork"].map(t => (
                <span key={t} style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(0,240,200,0.10)", color: C.accent,
                  border: "1px solid rgba(0,240,200,0.22)", letterSpacing: "0.04em",
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {TAGS.map(tag => (
              <Chip key={tag} label={tag} active={activeTag === tag} accent={C.accent} onClick={() => setActiveTag(tag)} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {filtered.length} Question{filtered.length !== 1 ? "s" : ""}
              {activeTag !== "All" ? ` · ${activeTag}` : ""}
            </span>
            {reviewed.size > 0 && (
              <button onClick={() => setReviewed(new Set())} style={{
                fontSize: 11, color: C.text3, background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
                padding: "3px 10px", cursor: "pointer", fontFamily: "inherit",
              }}>Reset Progress</button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((item, i) => (
              <QuestionCard
                key={item.id} item={item} idx={i} accent={C.accent}
                reviewed={reviewed.has(item.id)} onReviewed={toggleReviewed}
              />
            ))}
          </div>

          <div style={{
            marginTop: 32, padding: "16px 20px",
            background: C.glass2, border: `1px solid ${C.border2}`, borderRadius: 12,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.text2 }}>Pro tip</p>
              <p style={{ margin: 0, fontSize: 12, color: C.text3, lineHeight: 1.6 }}>
                Practice answering out loud — not just reading. Recording yourself for 30 seconds per question dramatically improves delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        button:hover { opacity: 0.88; }
      `}</style>
    </div>
  );
}