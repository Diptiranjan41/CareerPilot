import { useState } from "react";

const NAV = {
  Product: ["Resume builder", "Job matching", "Interview prep", "Salary insights", "Career paths"],
  Resources: ["Blog", "Career guides", "Templates", "Webinars", "Community"],
  Company: ["About us", "Careers", "Press kit", "Partners", "Contact"],
};

const STATS = [
  { num: "40K+", lbl: "Professionals" },
  { num: "98%", lbl: "Match rate" },
  { num: "4.9★", lbl: "App rating" },
];

export default function CareerPilotFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = () => {
    if (email.includes("@")) {
      setDone(true);
      setEmail("");
      setTimeout(() => setDone(false), 3000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
        .cp { font-family: 'Cabinet Grotesk', sans-serif; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-22px) scale(1.07)} }
        @keyframes pulseDot { 0%,100%{box-shadow:0 0 6px rgba(0,240,200,.8)} 50%{box-shadow:0 0 16px rgba(0,240,200,1),0 0 32px rgba(0,240,200,.4)} }
        .orb1{animation:orbFloat 9s ease-in-out infinite}
        .orb2{animation:orbFloat 11s ease-in-out infinite 3s}
        .orb3{animation:orbFloat 8s ease-in-out infinite 5s}
        .orb4{animation:orbFloat 10s ease-in-out infinite 2s}
        .sdot{animation:pulseDot 2s ease-in-out infinite}
        .nav-a:hover{color:#00F0C8 !important;text-shadow:0 0 14px rgba(0,240,200,.6);padding-left:6px}
        .soc:hover{
          background:rgba(0,240,200,.15) !important;
          border-color:rgba(0,240,200,.45) !important;
          color:#00F0C8 !important;
          box-shadow:0 0 16px rgba(0,240,200,.3),0 0 32px rgba(0,240,200,.1) !important;
          transform:translateY(-2px)
        }
        .nl-btn{
          background: linear-gradient(135deg,#00F0C8,#0099FF) !important;
          color:#020B18 !important;
        }
        .nl-btn:hover{
          box-shadow:0 0 36px rgba(0,240,200,.55),0 0 70px rgba(0,153,255,.25) !important;
          transform:translateY(-1px);
          background: linear-gradient(135deg,#00F0C8,#0099FF) !important;
          color:#020B18 !important;
        }
        .nl-btn:active{
          background: linear-gradient(135deg,#00F0C8,#0099FF) !important;
          color:#020B18 !important;
        }
        .gc:hover{border-color:rgba(0,240,200,.28) !important}
        .leg:hover{color:#00F0C8 !important}

        /* Responsive grid */
        .cp-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .cp-main-grid {
            grid-template-columns: 1fr 1fr;
          }
          .cp-brand-card {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 560px) {
          .cp-main-grid {
            grid-template-columns: 1fr;
          }
          .cp-brand-card {
            grid-column: auto;
          }
          .cp-top-bar {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .cp-stats {
            flex-wrap: wrap;
          }
          .cp-newsletter {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .cp-nl-form {
            width: 100%;
            flex-direction: column;
          }
          .cp-nl-form input {
            width: 100% !important;
          }
          .cp-nl-form button {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
          .cp-bottom {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .cp-legal-links {
            flex-wrap: wrap;
            gap: 12px !important;
          }
        }
      `}</style>

      <div
        className="cp relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)",
          padding: "52px 36px 26px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Orbs */}
        {[
          { cls: "orb1", w: 420, h: 420, t: -160, l: -120, col: "rgba(0,240,200,.18)", bl: 40 },
          { cls: "orb2", w: 360, h: 360, t: -100, r: -80, col: "rgba(99,51,255,.22)", bl: 50 },
          { cls: "orb3", w: 280, h: 280, b: 0, l: "40%", col: "rgba(0,200,255,.15)", bl: 45 },
          { cls: "orb4", w: 200, h: 200, b: 60, r: 60, col: "rgba(255,60,160,.12)", bl: 40 },
        ].map(({ cls, w, h, t, l, r, b, col, bl }) => (
          <div
            key={cls}
            className={`${cls} absolute rounded-full pointer-events-none`}
            style={{
              width: w, height: h, top: t, left: l, right: r, bottom: b,
              background: `radial-gradient(circle,${col} 0%,transparent 65%)`,
              filter: `blur(${bl}px)`,
            }}
          />
        ))}

        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,240,200,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,200,.04) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative z-10">

          {/* ── TOP BAR ── */}
          <div
            className="cp-top-bar flex items-center justify-between flex-wrap gap-4 mb-10 pb-7"
            style={{ borderBottom: "1px solid rgba(0,240,200,.1)" }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                  boxShadow: "0 0 28px rgba(0,240,200,.5),0 0 56px rgba(0,240,200,.2),inset 0 1px 0 rgba(255,255,255,.3)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                </svg>
              </div>
              <div>
                <div
                  className="text-xl font-bold tracking-tight"
                  style={{
                    background: "linear-gradient(90deg,#00F0C8,#0099FF,#A855F7)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}
                >CareerPilot</div>
                <div className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: "rgba(0,240,200,.5)" }}>
                  AI Career Intelligence
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="cp-stats flex items-center gap-3">
              {STATS.map(({ num, lbl }) => (
                <div
                  key={lbl}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "rgba(0,240,200,.06)", border: "1px solid rgba(0,240,200,.15)", backdropFilter: "blur(12px)" }}
                >
                  <div
                    className="text-base font-bold"
                    style={{ background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                  >{num}</div>
                  <div className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,.4)" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="cp-main-grid">

            {/* Brand card */}
            <div
              className="cp-brand-card gc rounded-[18px] p-6 transition-all duration-300"
              style={{
                background: "linear-gradient(145deg,rgba(0,240,200,.05),rgba(0,153,255,.03))",
                border: "1px solid rgba(0,240,200,.12)",
                backdropFilter: "blur(20px)",
                boxShadow: "inset 0 1px 0 rgba(0,240,200,.1),0 4px 24px rgba(0,0,0,.3)",
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[.8px] uppercase mb-3"
                style={{ background: "rgba(0,240,200,.1)", border: "1px solid rgba(0,240,200,.22)", color: "#00F0C8" }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00F0C8", boxShadow: "0 0 6px #00F0C8", display: "inline-block" }} />
                Now hiring
              </div>
              <p className="text-[13px] font-medium leading-relaxed mb-5" style={{ color: "rgba(255,255,255,.45)", maxWidth: 230 }}>
                Precision AI navigation for every stage of your professional journey. Land roles faster, negotiate better, grow smarter.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Twitter", "LinkedIn", "GitHub", "Discord"].map((label) => (
                  <a
                    key={label}
                    aria-label={label}
                    href="#"
                    className="soc w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-250"
                    style={{ background: "rgba(0,240,200,.06)", border: "1px solid rgba(0,240,200,.15)", color: "rgba(255,255,255,.5)", fontSize: 15, textDecoration: "none" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      {label === "Twitter" && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
                      {label === "LinkedIn" && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></>}
                      {label === "GitHub" && <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                      {label === "Discord" && <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.01.023.02.044.037.054a19.907 19.907 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Nav cols */}
            {Object.entries(NAV).map(([heading, links]) => (
              <div
                key={heading}
                className="gc rounded-[18px] p-6 transition-all duration-300"
                style={{
                  background: "linear-gradient(145deg,rgba(0,240,200,.05),rgba(0,153,255,.03))",
                  border: "1px solid rgba(0,240,200,.12)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "inset 0 1px 0 rgba(0,240,200,.1),0 4px 24px rgba(0,0,0,.3)",
                }}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[2px] uppercase mb-[18px]" style={{ color: "#00F0C8" }}>
                  {heading}
                  <span style={{ display: "inline-block", width: 20, height: 1, background: "linear-gradient(90deg,#00F0C8,transparent)" }} />
                </div>
                {links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="nav-a block text-[13px] font-medium mb-[11px] transition-all duration-200"
                    style={{ color: "rgba(255,255,255,.45)", textDecoration: "none", paddingLeft: 0 }}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>

          {/* ── NEWSLETTER ── */}
          <div
            className="cp-newsletter rounded-[18px] p-[22px_26px] flex items-center justify-between flex-wrap gap-4 mb-5"
            style={{
              background: "linear-gradient(135deg,rgba(0,240,200,.07),rgba(168,85,247,.06))",
              border: "1px solid rgba(0,240,200,.15)",
              boxShadow: "inset 0 1px 0 rgba(0,240,200,.12),0 4px 24px rgba(0,0,0,.25)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-[13px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,rgba(0,240,200,.2),rgba(0,153,255,.15))",
                  border: "1px solid rgba(0,240,200,.25)",
                  boxShadow: "0 0 20px rgba(0,240,200,.2)",
                  color: "#00F0C8",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <div className="text-[15px] font-bold mb-1" style={{ color: "rgba(255,255,255,.9)" }}>Weekly career intelligence</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,.38)" }}>40,000+ pros read this. Join them — no spam.</div>
              </div>
            </div>
            <div className="cp-nl-form flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && subscribe()}
                placeholder="your@email.com"
                className="rounded-[10px] px-4 py-2.5 text-[13px] outline-none transition-all duration-200 w-48"
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(0,240,200,.18)",
                  color: "rgba(255,255,255,.8)",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={subscribe}
                className="nl-btn rounded-[10px] px-5 py-2.5 text-[13px] font-bold border-none cursor-pointer transition-all duration-250 whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                  color: "#020B18",
                  boxShadow: "0 0 22px rgba(0,240,200,.35)",
                  fontFamily: "inherit",
                }}
              >
                {done ? "✓ Done!" : "Subscribe →"}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(0,240,200,.08)", marginBottom: 20 }} />

          {/* Bottom */}
          <div className="cp-bottom flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs" style={{ color: "rgba(255,255,255,.3)" }}>
              © 2026{" "}
              <span style={{ background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>
                CareerPilot Inc.
              </span>{" "}
              All rights reserved.
            </p>
            <div className="cp-legal-links flex gap-[18px]">
              {["Privacy", "Terms", "Cookies", "Security"].map((l) => (
                <a key={l} href="#" className="leg text-xs transition-colors duration-200" style={{ color: "rgba(255,255,255,.28)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="sdot rounded-full"
                style={{ width: 7, height: 7, background: "#00F0C8", boxShadow: "0 0 8px rgba(0,240,200,.9)" }}
              />
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,.38)" }}>All systems operational</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
