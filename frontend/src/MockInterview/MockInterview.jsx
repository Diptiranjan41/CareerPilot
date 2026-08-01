import { useState } from "react";
import HRInterview from "./HRInterview";

const COLORS = {
  bg1: "#020B18",
  bg2: "#0F172A",
  teal: "#00F0C8",
  blue: "#0099FF",
  purple: "#A855F7",
  amber: "#F59E0B",
  pink: "#FF3CA0",
  green: "#22C55E",
  text1: "#F8FAFC",
  text2: "#E2E8F0",
  text3: "#94A3B8",
  glass2: "rgba(255,255,255,0.07)",
  glass3: "rgba(255,255,255,0.04)",
  border2: "rgba(255,255,255,0.08)",
};

const CATEGORIES = [
  {
    id: "hr",
    icon: "🎙️",
    label: "HR Interview",
    accent: "#00F0C8",
    accentBg: "rgba(0,240,200,0.08)",
    accentBorder: "rgba(0,240,200,0.22)",
    chips: ["Behavioral", "Strengths", "Weaknesses", "Leadership"],
    desc: "Master the art of selling yourself — confidence, clarity, and character.",
    count: 10,
  },
  {
    id: "tech",
    icon: "💻",
    label: "Technical Interview",
    accent: "#0099FF",
    accentBg: "rgba(0,153,255,0.08)",
    accentBorder: "rgba(0,153,255,0.22)",
    chips: ["Java", "MERN", "DBMS", "CN", "OOPs", "OS"],
    desc: "Deep-dive into core CS concepts and full-stack development fundamentals.",
    count: 7,
  },
  {
    id: "coding",
    icon: "⌨️",
    label: "Coding Interview",
    accent: "#A855F7",
    accentBg: "rgba(168,85,247,0.08)",
    accentBorder: "rgba(168,85,247,0.22)",
    chips: ["DSA", "Live Coding", "AI Hints"],
    desc: "Solve DSA problems with live hints — arrays, trees, graphs, and DP.",
    count: 7,
  },
  {
    id: "aptitude",
    icon: "📊",
    label: "Aptitude Round",
    accent: "#F59E0B",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.22)",
    chips: ["Quantitative", "Reasoning", "Verbal"],
    desc: "Sharpen your speed and accuracy — the gateway round every company uses.",
    count: 7,
  },
  {
    id: "company",
    icon: "🏢",
    label: "Company Specific",
    accent: "#FF3CA0",
    accentBg: "rgba(255,60,160,0.08)",
    accentBorder: "rgba(255,60,160,0.22)",
    chips: ["TCS", "Infosys", "Wipro", "Accenture", "Amazon"],
    desc: "Tailored prep for top companies — their style, their culture, their format.",
    count: 7,
  },
  {
    id: "fullstack",
    icon: "🎯",
    label: "Full Stack Mock",
    accent: "#22C55E",
    accentBg: "rgba(34,197,94,0.06)",
    accentBorder: "rgba(34,197,94,0.16)",
    chips: ["Coming Soon"],
    desc: "Complete end-to-end interview simulation — all rounds in one session.",
    comingSoon: true,
    count: 0,
  },
];

const GridPattern = () => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#00F0C8" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

const ScanLine = ({ accent }) => (
  <div style={{
    position: "absolute", top: 0, left: 0, right: 0, height: 2,
    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
    opacity: 0.55, animation: "scanline 3s ease-in-out infinite",
  }} />
);

const Chip = ({ label, accent }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
    padding: "3px 9px", borderRadius: 20,
    background: `${accent}14`, color: accent,
    border: `1px solid ${accent}2E`,
    whiteSpace: "nowrap",
  }}>{label}</span>
);

const CategoryCard = ({ cat, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(cat)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: hovered ? cat.accentBg : COLORS.glass3,
        border: `1px solid ${hovered ? cat.accentBorder : COLORS.border2}`,
        borderRadius: 16,
        padding: "22px 20px",
        cursor: cat.comingSoon ? "default" : "pointer",
        transition: "all 0.22s ease",
        transform: hovered && !cat.comingSoon ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered && !cat.comingSoon ? `0 14px 36px ${cat.accent}14` : "none",
        opacity: cat.comingSoon ? 0.7 : 1,
      }}
    >
      {hovered && !cat.comingSoon && <ScanLine accent={cat.accent} />}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 14 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: `${cat.accent}16`, border: `1px solid ${cat.accent}2A`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21,
          boxShadow: hovered ? `0 0 18px ${cat.accent}28` : "none",
          transition: "box-shadow 0.22s",
        }}>
          {cat.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.text1, letterSpacing: "-0.01em" }}>
              {cat.label}
            </span>
            {cat.comingSoon && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.07em",
                padding: "2px 6px", borderRadius: 6,
                background: "rgba(245,158,11,0.12)", color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.22)",
                textTransform: "uppercase",
              }}>Soon</span>
            )}
          </div>
          <p style={{ fontSize: 11.5, color: COLORS.text3, margin: 0, lineHeight: 1.55 }}>
            {cat.desc}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 15 }}>
        {cat.chips.map(c => <Chip key={c} label={c} accent={cat.accent} />)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, color: cat.accent, fontWeight: 700 }}>
          {cat.comingSoon ? "Notify me" : `${cat.count} questions`}
        </span>
        {!cat.comingSoon && (
          <span style={{
            fontSize: 11.5, color: cat.accent, fontWeight: 700,
            opacity: hovered ? 1 : 0.45, transition: "opacity 0.2s",
          }}>
            Start →
          </span>
        )}
      </div>

      {hovered && !cat.comingSoon && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${cat.accent}70, transparent)`,
        }} />
      )}
    </div>
  );
};

export default function MockInterview() {
  const [page, setPage] = useState(null);

  if (page === "hr") {
    return <HRInterview onBack={() => setPage(null)} />;
  }

  const handleClick = (cat) => {
    if (!cat.comingSoon) setPage(cat.id);
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg1,
      fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <GridPattern />

      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(0,240,200,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        padding: "40px 28px 48px",
        maxWidth: 920,
        margin: "0 auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 14,
        }}>
          {CATEGORIES.map(cat => (
            <CategoryCard key={cat.id} cat={cat} onClick={handleClick} />
          ))}
        </div>

        <div style={{
          marginTop: 32, textAlign: "center",
          padding: "14px", borderTop: `1px solid ${COLORS.border2}`,
        }}>
          <p style={{ fontSize: 11, color: COLORS.text3, margin: 0, letterSpacing: "0.02em" }}>
            MockPrep.ai · Practice Smart. Ace More. ·{" "}
            <span style={{ color: COLORS.teal }}>More rounds coming soon</span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes scanline { 0%,100%{opacity:0.3} 50%{opacity:0.75} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}