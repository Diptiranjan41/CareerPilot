import { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const CARD = "linear-gradient(145deg,rgba(0,240,200,.06),rgba(0,153,255,.03))";
const BORDER = "1px solid rgba(0,240,200,.13)";
const SHADOW = "inset 0 1px 0 rgba(0,240,200,.1),0 8px 48px rgba(0,0,0,.5)";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.cp{font-family:'Cabinet Grotesk',sans-serif}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes pulseDot{0%,100%{box-shadow:0 0 6px rgba(0,240,200,.8)}50%{box-shadow:0 0 18px rgba(0,240,200,1),0 0 36px rgba(0,240,200,.4)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes slideRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.orb1{animation:orbFloat 9s ease-in-out infinite}
.orb2{animation:orbFloat 12s ease-in-out infinite 3s}
.orb3{animation:orbFloat 8s ease-in-out infinite 5s}
.sdot{animation:pulseDot 2s ease-in-out infinite}
.fadeup{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) forwards}
.fadeup2{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .14s forwards;opacity:0}
.step-in{animation:slideRight .4s cubic-bezier(.22,1,.36,1) forwards}
.card{background:${CARD};border:${BORDER};border-radius:22px;backdrop-filter:blur(24px);box-shadow:${SHADOW}}
.inp{
  width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(0,240,200,.16);
  border-radius:12px;padding:13px 16px;color:rgba(255,255,255,.85);
  font-size:14px;font-family:'Cabinet Grotesk',sans-serif;outline:none;transition:all .2s;
}
.inp:focus{border-color:rgba(0,240,200,.5);background:rgba(0,240,200,.03);box-shadow:0 0 0 3px rgba(0,240,200,.07)}
.inp::placeholder{color:rgba(255,255,255,.22)}
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
.socbtn{
  flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
  padding:11px;border-radius:11px;background:rgba(255,255,255,.04);
  border:1px solid rgba(0,240,200,.13);color:rgba(255,255,255,.55);
  font-family:'Cabinet Grotesk',sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;transition:all .2s;
}
.socbtn:hover{background:rgba(0,240,200,.08);border-color:rgba(0,240,200,.28);color:rgba(255,255,255,.9)}
.textlink{color:rgba(0,240,200,.65);cursor:pointer;font-weight:700;transition:color .2s}
.textlink:hover{color:#00F0C8}
.divline{flex:1;height:1px;background:rgba(0,240,200,.1)}
.otp-box{
  width:52px;height:58px;text-align:center;font-size:22px;font-weight:800;
  background:rgba(255,255,255,.04);border:1px solid rgba(0,240,200,.2);
  border-radius:12px;color:rgba(255,255,255,.9);font-family:'Cabinet Grotesk',sans-serif;
  outline:none;transition:all .2s;caret-color:#00F0C8;
}
.otp-box:focus{border-color:rgba(0,240,200,.6);background:rgba(0,240,200,.05);box-shadow:0 0 0 3px rgba(0,240,200,.08);transform:scale(1.06)}
.otp-box.filled{border-color:rgba(0,240,200,.4);background:rgba(0,240,200,.06)}
.strength-bar{height:3px;border-radius:2px;transition:all .4s;flex:1}
`;

const API_URL = "http://localhost:8080/api";

const Orbs = () => (
  <>
    {[
      { cls: "orb1", w: 500, h: 500, t: -200, l: -150, col: "rgba(0,240,200,.13)", bl: 55 },
      { cls: "orb2", w: 350, h: 350, t: -50, r: -80, col: "rgba(99,51,255,.18)", bl: 60 },
      { cls: "orb3", w: 280, h: 280, b: -80, l: "40%", col: "rgba(0,200,255,.11)", bl: 50 },
    ].map(({ cls, w, h, t, l, r, b, col, bl }) => (
      <div key={cls} className={cls} style={{ position: "absolute", width: w, height: h, top: t, left: l, right: r, bottom: b, borderRadius: "50%", background: `radial-gradient(circle,${col} 0%,transparent 65%)`, filter: `blur(${bl}px)`, pointerEvents: "none" }} />
    ))}
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(0,240,200,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,200,.03) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
  </>
);

const PERKS = [
  { emoji: "🎯", text: "AI-powered job matching across 500K+ live roles" },
  { emoji: "💬", text: "Interview coach with real-time feedback" },
  { emoji: "📊", text: "Salary benchmarks for your exact title & city" },
  { emoji: "🗺️", text: "Career path planner with skill gap analysis" },
  { emoji: "🔔", text: "Smart alerts when dream jobs go live" },
];

const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const otpRefs = useRef([]);

  const strength = getStrength(password);
  const strengthColors = ["", "#FF4444", "#FF8C00", "#FFD700", "#00F0C8"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  // Google OAuth — window.location.href se karo, Axios se nahi
  const handleSocialLogin = (provider) => {
    if (provider === "google") {
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    } else {
      toast.error("LinkedIn login coming soon!");
    }
  };

  // ✅ FIXED: /auth/register ki jagah /auth/send-otp use kar raha hai
  const handleSignup = async () => {
    if (!name.trim()) { toast.error("Pehla naam daalo"); return; }
    if (!email.includes("@")) { toast.error("Valid email daalo"); return; }
    if (password.length < 6) { toast.error("Password 6+ characters hona chahiye"); return; }

    setLoading(true);
    try {
      const fullName = lastName.trim() ? `${name.trim()} ${lastName.trim()}` : name.trim();

      // ✅ CORRECT ENDPOINT — send-otp
      const response = await axios.post(`${API_URL}/auth/send-otp`, {
        fullName,
        email,
        password,
        role: "STUDENT",
      });

      console.log("Send OTP response:", response.data);
      toast.success(response.data.message || "OTP bheja gaya! Email check karo.");
      setStep(2);

    } catch (err) {
      console.error("Signup error:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.status === 409) {
        toast.error("Yeh email pehle se registered hai.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. Backend CORS check karo.");
      } else if (err.code === "ERR_NETWORK") {
        toast.error("Backend se connect nahi ho pa raha. Port 8080 check karo.");
      } else {
        toast.error("Registration fail: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: OTP verify karo phir complete-registration call karo
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Poora 6-digit OTP daalo"); return; }

    setLoading(true);
    try {
      // Step 1: OTP verify
      await axios.post(`${API_URL}/auth/verify-otp`, { email, otp: code });

      // Step 2: Registration complete
      const fullName = lastName.trim() ? `${name.trim()} ${lastName.trim()}` : name.trim();
      const finalRes = await axios.post(`${API_URL}/auth/complete-registration`, {
        fullName,
        email,
        password,
        role: "STUDENT",
      });

      console.log("Complete registration response:", finalRes.data);

      if (finalRes.data.token) {
        localStorage.setItem("token", finalRes.data.token);
        localStorage.setItem("user", JSON.stringify({
          id: finalRes.data.id,
          email: finalRes.data.email || email,
          fullName: finalRes.data.fullName || fullName,
          role: finalRes.data.role || "STUDENT",
        }));
      }

      toast.success("Email verify ho gaya! Welcome to CareerPilot!");
      setStep(3);

    } catch (err) {
      console.error("OTP verification error:", err);
      if (err.response?.status === 400) {
        toast.error("Galat ya expired OTP. Dobara try karo.");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Verification fail ho gayi. Dobara try karo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, {
        fullName: lastName.trim() ? `${name.trim()} ${lastName.trim()}` : name.trim(),
        email,
        password,
        role: "STUDENT",
      });
      toast.success("Naya OTP bheja gaya!");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP resend fail. Try again.");
    }
    setTimeout(() => setResent(false), 3000);
  };

  const STEPS = [
    { n: 1, label: "Account" },
    { n: 2, label: "Verify" },
    { n: 3, label: "Done" },
  ];

  return (
    <div className="cp" style={{ background: BG, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{STYLES}</style>
      <Orbs />

      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "stretch", minHeight: "100vh" }}>

        {/* LEFT PANEL */}
        <div className="fadeup" style={{ width: "45%", padding: "56px 52px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(0,240,200,.07)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: "rgba(0,240,200,.08)", border: "1px solid rgba(0,240,200,.18)", marginBottom: 22, width: "fit-content" }}>
            <span className="sdot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F0C8", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "#00F0C8", textTransform: "uppercase" }}>Free forever · No credit card</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, color: "rgba(255,255,255,.92)", letterSpacing: "-1px", marginBottom: 14 }}>
            Your career,<br />
            <span style={{ background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>supercharged</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.38)", lineHeight: 1.7, maxWidth: 370, marginBottom: 40 }}>
            Join 40,000+ professionals who use CareerPilot daily to find better roles, negotiate higher salaries, and grow faster.
          </p>
          <div style={{ marginBottom: 40 }}>
            {PERKS.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "10px 0", borderBottom: i < PERKS.length - 1 ? "1px solid rgba(0,240,200,.06)" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,rgba(0,240,200,.12),rgba(0,153,255,.08))", border: "1px solid rgba(0,240,200,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{p.emoji}</div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.4 }}>{p.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["RK", "AS", "ML", "PB"].map((a, i) => (
                <div key={a} style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,rgba(0,240,200,${.2 + i * .05}),rgba(0,153,255,.2))`, border: "2px solid #020B18", marginLeft: i ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#00F0C8" }}>{a}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.65)" }}>40,000+ pros onboard</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)" }}>Joined this month ↑ 12%</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="fadeup2" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 52px" }}>
          <div style={{ width: "100%", maxWidth: 430 }}>

            {/* Step Indicators */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 30 }}>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: step >= s.n ? "linear-gradient(135deg,#00F0C8,#0099FF)" : "rgba(255,255,255,.06)",
                      border: step >= s.n ? "none" : "1px solid rgba(0,240,200,.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                      color: step >= s.n ? "#020B18" : "rgba(255,255,255,.3)",
                      boxShadow: step >= s.n ? "0 0 16px rgba(0,240,200,.4)" : "none",
                    }}>
                      {step > s.n ? "✓" : s.n}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".8px", color: step >= s.n ? "rgba(0,240,200,.7)" : "rgba(255,255,255,.2)" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 56, height: 2, background: step > s.n ? "linear-gradient(90deg,#00F0C8,#0099FF)" : "rgba(0,240,200,.1)", borderRadius: 1, margin: "0 6px", marginBottom: 20 }} />
                  )}
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "36px 32px" }}>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="step-in">
                  <div style={{ marginBottom: 26 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,.92)", marginBottom: 5 }}>Create your account 🚀</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.32)" }}>Free forever — no credit card required</p>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                    <button className="socbtn" onClick={() => handleSocialLogin("google")}>
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                    <button className="socbtn" onClick={() => handleSocialLogin("linkedin")}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                      LinkedIn
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                    <div className="divline" /><span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", fontWeight: 600, whiteSpace: "nowrap" }}>or with email</span><div className="divline" />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <label className="lbl">First name</label>
                      <input type="text" className="inp" placeholder="Alex" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="lbl">Last name</label>
                      <input type="text" className="inp" placeholder="Johnson" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="lbl">Email address</label>
                    <input type="email" className="inp" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label className="lbl">Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} className="inp" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} style={{ paddingRight: 44 }} />
                      <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.28)" }}>
                        {showPass ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/></svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {password.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="strength-bar" style={{ background: i <= strength ? strengthColors[strength] : "rgba(255,255,255,.08)" }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                          {[
                            { label: "8+ chars", pass: password.length >= 8 },
                            { label: "Uppercase", pass: /[A-Z]/.test(password) },
                            { label: "Number", pass: /[0-9]/.test(password) },
                          ].map(c => (
                            <span key={c.label} style={{ fontSize: 10, color: c.pass ? "#00F0C8" : "rgba(255,255,255,.25)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                              {c.pass ? "✓" : "○"} {c.label}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                      </div>
                    </div>
                  )}

                  <button className="sbtn" onClick={handleSignup} disabled={loading} style={{ marginBottom: 16 }}>
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        OTP bhej rahe hain...
                      </span>
                    ) : "Continue — Verify Email →"}
                  </button>

                  <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "rgba(255,255,255,.25)" }}>
                    Already have an account? <Link to="/login" className="textlink">Sign in</Link>
                  </p>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="step-in">
                  <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,rgba(0,240,200,.18),rgba(0,153,255,.12))", border: "1px solid rgba(0,240,200,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00F0C8" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,.92)", marginBottom: 8 }}>Verify your email ✉️</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
                      We sent a 6-digit code to<br />
                      <span style={{ color: "#00F0C8", fontWeight: 700 }}>{email}</span>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28 }}>
                    {otp.map((val, i) => (
                      <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
                        className={`otp-box${val ? " filled" : ""}`} value={val}
                        onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} />
                    ))}
                  </div>

                  <button className="sbtn" onClick={handleVerify} disabled={loading || otp.join("").length < 6} style={{ marginBottom: 14 }}>
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Verify ho raha hai...
                      </span>
                    ) : "Verify & Activate Account →"}
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>Nahi mila OTP? </span>
                    <span className="textlink" style={{ fontSize: 13 }} onClick={!resent ? handleResend : undefined}>
                      {resent ? "✓ Bhej diya!" : "Dobara bhejo"}
                    </span>
                  </div>

                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.2)", cursor: "pointer" }}
                      onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); }}>
                      ← Galat email? Wapas jao
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="step-in" style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#00F0C8,#0099FF)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: "rgba(255,255,255,.92)", marginBottom: 8 }}>You're in! 🎉</h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 28 }}>
                    Welcome to CareerPilot!<br />Your AI career dashboard is ready.
                  </p>
                  <Link to="/dashboard" className="sbtn" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                    Go to Dashboard →
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
