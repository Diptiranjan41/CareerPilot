import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

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
@keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(0,240,200,.4)}70%{box-shadow:0 0 0 16px rgba(0,240,200,0)}100%{box-shadow:0 0 0 0 rgba(0,240,200,0)}}
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
.navlink{color:rgba(255,255,255,.38);text-decoration:none;font-size:13px;transition:color .2s;font-weight:500}
.navlink:hover{color:#00F0C8}
.textlink{color:rgba(0,240,200,.65);cursor:pointer;font-weight:700;transition:color .2s;text-decoration:none}
.textlink:hover{color:#00F0C8}
.otp-box{
  width:52px;height:58px;text-align:center;font-size:22px;font-weight:800;
  background:rgba(255,255,255,.04);border:1px solid rgba(0,240,200,.2);
  border-radius:12px;color:rgba(255,255,255,.9);font-family:'Cabinet Grotesk',sans-serif;
  outline:none;transition:all .2s;caret-color:#00F0C8;
}
.otp-box:focus{border-color:rgba(0,240,200,.6);background:rgba(0,240,200,.05);box-shadow:0 0 0 3px rgba(0,240,200,.08);transform:scale(1.06)}
.otp-box.filled{border-color:rgba(0,240,200,.4);background:rgba(0,240,200,.06)}
.strength-bar{height:3px;border-radius:2px;transition:all .4s;flex:1}
.tip-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;border-radius:11px;margin-bottom:8px}
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

const TIPS = [
  { icon: "🔐", title: "Use a unique password", desc: "Never reuse passwords across accounts" },
  { icon: "📱", title: "Enable 2FA after reset", desc: "Add an extra security layer to your account" },
  { icon: "🔍", title: "Check your spam folder", desc: "Sometimes emails land in spam/junk" },
];

const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const STEPS = [
  { n: 1, label: "Email" },
  { n: 2, label: "OTP" },
  { n: 3, label: "Reset" },
  { n: 4, label: "Done" },
];

// OTP expiry in seconds (5 minutes = 300 seconds)
const OTP_EXPIRY_SECONDS = 300;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECONDS);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const strength = getStrength(newPass);
  const strengthColors = ["", "#FF4444", "#FF8C00", "#FFD700", "#00F0C8"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const startCountdown = () => {
    setCountdown(OTP_EXPIRY_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(c => { 
        if (c <= 1) { 
          clearInterval(timerRef.current); 
          return 0; 
        } 
        return c - 1; 
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: email });
      
      if (response.data.message && !response.data.message.includes("Error")) {
        toast.success("OTP sent! Valid for 5 minutes.");
        setStep(2);
        startCountdown();
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter complete OTP");
      return;
    }
    
    if (countdown <= 0) {
      toast.error("OTP has expired!");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-otp`, {
        email: email,
        otp: code
      });
      
      if (response.data.message && response.data.message.includes("success")) {
        toast.success("OTP verified!");
        setStep(3);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 && countdown !== OTP_EXPIRY_SECONDS) {
      toast.error(`Please wait ${formatTime(countdown)}`);
      return;
    }
    
    setResent(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success("New OTP sent!");
      startCountdown();
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
    setTimeout(() => setResent(false), 2500);
  };

  const handleReset = async () => {
    if (!newPass) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }
    if (strength < 2) {
      toast.error("Choose a stronger password");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email: email,
        newPassword: newPass,
        otp: otp.join("")
      });
      
      if (response.data.message && response.data.message.includes("success")) {
        toast.success("Password reset successful!");
        setStep(4);
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="cp" style={{ background: BG, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{STYLES}</style>
      <Orbs />

      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "stretch", minHeight: "100vh" }}>

        {/* LEFT PANEL */}
        <div className="fadeup" style={{ width: "45%", padding: "56px 52px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(0,240,200,.07)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: "rgba(0,240,200,.08)", border: "1px solid rgba(0,240,200,.18)", marginBottom: 22, width: "fit-content" }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "#00F0C8", textTransform: "uppercase" }}>Secure Account Recovery</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, color: "rgba(255,255,255,.92)", letterSpacing: "-1px", marginBottom: 14 }}>
            Reset your<br />
            <span style={{ background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>password safely</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.38)", lineHeight: 1.7, maxWidth: 370, marginBottom: 40 }}>
            We use bank-grade security. Your OTP expires in 5 minutes.
          </p>

          <div style={{ marginBottom: 40 }}>
            {[
              { step: "01", title: "Enter your email", desc: "We'll send a secure 6-digit OTP", icon: "✉️" },
              { step: "02", title: "Verify with OTP", desc: "Enter the code from your inbox", icon: "🔢" },
              { step: "03", title: "Set new password", desc: "Choose a strong, unique password", icon: "🔑" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 2 ? "1px solid rgba(0,240,200,.06)" : "none" }}>
                <div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: step > i + 1 ? "linear-gradient(135deg,#00F0C8,#0099FF)" : step === i + 1 ? "linear-gradient(135deg,rgba(0,240,200,.2),rgba(0,153,255,.15))" : "rgba(255,255,255,.04)",
                    border: step > i + 1 ? "none" : `1px solid rgba(0,240,200,${step === i + 1 ? ".3" : ".1"})`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: step > i + 1 ? 16 : 14,
                    boxShadow: step > i + 1 ? "0 0 20px rgba(0,240,200,.4)" : "none",
                  }}>
                    {step > i + 1 ? "✓" : s.icon}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", color: step > i + 1 ? "#00F0C8" : "rgba(0,240,200,.35)" }}>Step {s.step}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: step >= i + 1 ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.3)" }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(0,240,200,.4)", marginBottom: 14 }}>Security Tips</div>
            {TIPS.map((t, i) => (
              <div key={i} className="tip-row" style={{ background: "rgba(0,240,200,.04)", border: "1px solid rgba(0,240,200,.08)" }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="fadeup2" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 52px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

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
                    <span style={{ fontSize: 10, fontWeight: 700, color: step >= s.n ? "rgba(0,240,200,.7)" : "rgba(255,255,255,.2)" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ width: 44, height: 2, background: step > s.n ? "linear-gradient(90deg,#00F0C8,#0099FF)" : "rgba(0,240,200,.1)", margin: "0 4px", marginBottom: 20 }} />}
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "36px 32px" }}>

              {step === 1 && (
                <div className="step-in">
                  <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,rgba(0,240,200,.15),rgba(0,153,255,.1))", border: "1px solid rgba(0,240,200,.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00F0C8" strokeWidth="2">
                        <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                      </svg>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,.92)" }}>Forgot password?</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Enter your email to receive a reset code.</p>
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <label className="lbl">Email address</label>
                    <input type="email" className="inp" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendOtp()} />
                  </div>

                  <button className="sbtn" onClick={handleSendOtp} disabled={loading || !email.includes("@")}>
                    {loading ? "Sending..." : "Send Reset Code →"}
                  </button>

                  <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.25)" }}>
                    Remember it? <Link to="/login" className="textlink">Back to Sign In</Link>
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="step-in">
                  <div style={{ textAlign: "center", marginBottom: 26 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,rgba(0,240,200,.18),rgba(0,153,255,.12))", border: "1px solid rgba(0,240,200,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00F0C8" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,.92)" }}>Enter OTP code</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>6-digit code sent to <span style={{ color: "#00F0C8" }}>{email}</span></p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 22 }}>
                    <div style={{ position: "relative", width: 44, height: 44 }}>
                      <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,240,200,.1)" strokeWidth="3"/>
                        <circle cx="22" cy="22" r="18" fill="none" stroke="#00F0C8" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray="113" strokeDashoffset={113 - (countdown / OTP_EXPIRY_SECONDS) * 113}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: countdown > 0 ? "#00F0C8" : "rgba(255,255,255,.3)" }}>
                        {formatTime(countdown)}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>Time remaining</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                    {otp.map((val, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`otp-box${val ? " filled" : ""}`}
                        value={val}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                      />
                    ))}
                  </div>

                  <button className="sbtn" onClick={handleVerifyOtp} disabled={loading || otp.join("").length < 6 || countdown <= 0} style={{ marginBottom: 14 }}>
                    {loading ? "Verifying..." : "Verify OTP →"}
                  </button>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span onClick={handleResend} style={{ fontSize: 13, color: (countdown > 0 && countdown !== OTP_EXPIRY_SECONDS) ? "rgba(255,255,255,.2)" : "rgba(0,240,200,.65)", cursor: (countdown > 0 && countdown !== OTP_EXPIRY_SECONDS) ? "not-allowed" : "pointer", fontWeight: 700 }}>
                      {resent ? "✓ Resent!" : (countdown > 0 && countdown !== OTP_EXPIRY_SECONDS) ? `Resend in ${formatTime(countdown)}` : "Resend code"}
                    </span>
                    <span className="textlink" style={{ fontSize: 12 }} onClick={() => { setStep(1); setOtp(["","","","","",""]); }}>← Change email</span>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-in">
                  <div style={{ textAlign: "center", marginBottom: 26 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,rgba(0,240,200,.18),rgba(0,153,255,.12))", border: "1px solid rgba(0,240,200,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00F0C8" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,.92)" }}>Set new password</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Choose a strong password</p>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="lbl">New password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showNew ? "text" : "password"} className="inp" placeholder="Min. 8 characters" value={newPass} onChange={e => setNewPass(e.target.value)} />
                      <button onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.28)" }}>
                        {showNew ? "👁" : "👁‍🗨"}
                      </button>
                    </div>
                  </div>

                  {newPass.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
                        {[1,2,3,4].map(i => <div key={i} className="strength-bar" style={{ background: i <= strength ? strengthColors[strength] : "rgba(255,255,255,.08)" }} />)}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                    </div>
                  )}

                  <div style={{ marginBottom: 22 }}>
                    <label className="lbl">Confirm password</label>
                    <input type={showConfirm ? "text" : "password"} className="inp" placeholder="Re-enter password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                    {confirmPass && newPass !== confirmPass && <p style={{ fontSize: 11, color: "#FF6B6B", marginTop: 6 }}>⚠ Passwords do not match</p>}
                  </div>

                  <button className="sbtn" onClick={handleReset} disabled={loading || !newPass || newPass !== confirmPass || strength < 2}>
                    {loading ? "Resetting..." : "Reset Password →"}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="step-in" style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ width: 76, height: 76, borderRadius: 22, background: "linear-gradient(135deg,#00F0C8,#0099FF)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: "rgba(255,255,255,.92)" }}>Password reset! 🎉</h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.38)", marginBottom: 26 }}>Redirecting to login...</p>
                  <button onClick={() => navigate("/login")} className="sbtn">Sign In →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}