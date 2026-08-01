import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const CARD = "linear-gradient(145deg,rgba(0,240,200,.06),rgba(0,153,255,.03))";
const BORDER = "1px solid rgba(0,240,200,.13)";
const SHADOW = "inset 0 1px 0 rgba(0,240,200,.1),0 8px 48px rgba(0,0,0,.5)";

const API_URL = "http://localhost:8080/api";

// Configure axios
axios.defaults.withCredentials = true;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Cabinet Grotesk',sans-serif}
.cp{font-family:'Cabinet Grotesk',sans-serif}
@keyframes orbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.06)}}
@keyframes pulseDot{0%,100%{box-shadow:0 0 6px rgba(0,240,200,.8)}50%{box-shadow:0 0 18px rgba(0,240,200,1),0 0 36px rgba(0,240,200,.4)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.orb1{animation:orbFloat 9s ease-in-out infinite}
.orb2{animation:orbFloat 12s ease-in-out infinite 3s}
.orb3{animation:orbFloat 8s ease-in-out infinite 6s}
.sdot{animation:pulseDot 2s ease-in-out infinite}
.fadeup{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) forwards}
.fadeup2{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .12s forwards;opacity:0}
.fadeup3{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .24s forwards;opacity:0}
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
.navlink{color:rgba(255,255,255,.38);text-decoration:none;font-size:13px;transition:color .2s;font-weight:500}
.navlink:hover{color:#00F0C8}
.textlink{color:rgba(0,240,200,.65);cursor:pointer;font-weight:700;transition:color .2s}
.textlink:hover{color:#00F0C8}
.divline{flex:1;height:1px;background:rgba(0,240,200,.1)}
.feature-row{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(0,240,200,.06)}
.feature-row:last-child{border-bottom:none}
.feat-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(0,240,200,.15),rgba(0,153,255,.1));
  border:1px solid rgba(0,240,200,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
`;

const Orbs = () => (
  <>
    {[
      { cls: "orb1", w: 480, h: 480, t: -180, l: -140, col: "rgba(0,240,200,.15)", bl: 55 },
      { cls: "orb2", w: 380, h: 380, t: -60, r: -100, col: "rgba(99,51,255,.2)", bl: 60 },
      { cls: "orb3", w: 260, h: 260, b: -60, l: "45%", col: "rgba(0,200,255,.13)", bl: 50 },
    ].map(({ cls, w, h, t, l, r, b, col, bl }) => (
      <div key={cls} className={cls} style={{ position: "absolute", width: w, height: h, top: t, left: l, right: r, bottom: b, borderRadius: "50%", background: `radial-gradient(circle,${col} 0%,transparent 65%)`, filter: `blur(${bl}px)`, pointerEvents: "none" }} />
    ))}
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(0,240,200,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,200,.03) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
  </>
);

const FEATURES = [
  { icon: "🎯", title: "AI Job Matching", desc: "98% match rate across 500K+ listings" },
  { icon: "💰", title: "Salary Intelligence", desc: "Real-time compensation benchmarks" },
  { icon: "🚀", title: "Career Acceleration", desc: "Land roles 3× faster with AI guidance" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting login with:", email);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Login response:", response.data);
      
      // Handle successful login
      if (response.data && response.data.token) {
        // Store token
        localStorage.setItem("token", response.data.token);
        
        // Store user data
        const userData = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName || response.data.username || email.split('@')[0],
          role: response.data.role || "USER",
          username: response.data.username
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        toast.success("Login successful!");
        
        // Dispatch event for navbar to update
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: true, user: userData } }));
        window.dispatchEvent(new CustomEvent('profile-updated'));
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.response) {
        // Server responded with error
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        if (err.response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || "Invalid request. Please check your credentials.";
        } else if (err.response.status === 403) {
          errorMessage = "Your account is locked. Please contact support.";
        } else if (err.response.status === 404) {
          errorMessage = "Login service unavailable. Please try again later.";
        } else {
          errorMessage = err.response.data?.message || err.response.data?.error || "Login failed. Please try again.";
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = "Cannot connect to server. Please check if the backend is running on port 8080.";
        console.error("No response received:", err.request);
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "google") {
      // Store current location to redirect back after OAuth
      localStorage.setItem("oauth_redirect", window.location.origin);
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    } else if (provider === "linkedin") {
      toast.error("LinkedIn login coming soon!");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="cp" style={{ background: BG, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{STYLES}</style>
      <Orbs />

      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "stretch", minHeight: "100vh" }}>

        {/* LEFT PANEL */}
        <div className="fadeup" style={{ width: "45%", padding: "60px 56px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(0,240,200,.07)" }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: "rgba(0,240,200,.08)", border: "1px solid rgba(0,240,200,.18)", marginBottom: 22, width: "fit-content" }}>
            <span className="sdot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F0C8", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "#00F0C8", textTransform: "uppercase" }}>Trusted by 40,000+ Professionals</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, color: "rgba(255,255,255,.92)", letterSpacing: "-1px", marginBottom: 16 }}>
            Navigate your<br />
            <span style={{ background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>career with AI</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.38)", lineHeight: 1.7, maxWidth: 380, marginBottom: 44 }}>
            The most precise AI career platform — from resume intelligence to salary negotiation, all in one cockpit.
          </p>

          <div style={{ marginBottom: 44 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-row">
                <div className="feat-icon">
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.8)", marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.33)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{ padding: "18px 20px", background: "linear-gradient(135deg,rgba(0,240,200,.06),rgba(0,153,255,.04))", border: "1px solid rgba(0,240,200,.12)", borderRadius: 16 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
              "CareerPilot helped me land a Senior PM role at a FAANG company with a 40% salary bump. The AI coaching is genuinely different."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(0,240,200,.3),rgba(0,153,255,.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#00F0C8" }}>RK</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.65)" }}>Rahul K.</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)" }}>Senior PM · Google</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 13 }}>⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="fadeup2" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "52px 56px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div className="card" style={{ padding: "38px 34px" }}>

              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,.92)", marginBottom: 6, letterSpacing: "-.4px" }}>Welcome back 👋</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.32)" }}>Sign in to your CareerPilot dashboard</p>
              </div>

              {/* Social Buttons */}
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

              <div style={{ marginBottom: 16 }}>
                <label className="lbl">Email address</label>
                <input 
                  type="email" 
                  className="inp" 
                  placeholder="you@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete="email"
                />
              </div>

              <div style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <label className="lbl" style={{ marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 11, color: "rgba(0,240,200,.55)", textDecoration: "none", fontWeight: 700 }}>Forgot password?</Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showPass ? "text" : "password"} 
                    className="inp" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    onKeyPress={handleKeyPress}
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }} 
                  />
                  <button 
                    onClick={() => setShowPass(!showPass)} 
                    type="button"
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.28)", display: "flex" }}
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#ef4444", fontSize: "12px", textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button className="sbtn" onClick={handleLogin} disabled={loading}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign In to CareerPilot →"
                )}
              </button>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.25)" }}>
                New to CareerPilot? <Link to="/signup" className="textlink" style={{ textDecoration: "none" }}>Create a free account</Link>
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 20, flexWrap: "wrap" }}>
              {["🔒 SOC 2 Certified", "🛡️ GDPR Ready", "✦ No credit card"].map(b => (
                <span key={b} style={{ fontSize: 11, color: "rgba(255,255,255,.2)", fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}