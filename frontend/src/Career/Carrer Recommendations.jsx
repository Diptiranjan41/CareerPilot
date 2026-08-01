import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
.card-hover{transition:all .3s ease;cursor:pointer}
.card-hover:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.4),0 0 0 1px rgba(0,240,200,.2)}
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
.sbtn-outline{
  padding:10px 20px;border-radius:12px;background:transparent;
  border:1px solid rgba(0,240,200,.3);color:rgba(0,240,200,.8);
  font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;
}
.sbtn-outline:hover{border-color:#00F0C8;background:rgba(0,240,200,.05)}
.skill-tag{
  display:inline-block;padding:6px 14px;border-radius:20px;
  background:rgba(0,240,200,.08);border:1px solid rgba(0,240,200,.2);
  color:rgba(0,240,200,.8);font-size:12px;font-weight:600;
  transition:all .2s;cursor:pointer;
}
.skill-tag:hover{background:rgba(0,240,200,.15);border-color:rgba(0,240,200,.4);transform:scale(1.02)}
.skill-tag.selected{background:linear-gradient(135deg,#00F0C8,#0099FF);color:#020B18;border:none}
.rec-card{
  background:rgba(255,255,255,.03);border:1px solid rgba(0,240,200,.1);
  border-radius:16px;padding:20px;transition:all .3s;
}
.rec-card:hover{border-color:rgba(0,240,200,.3);background:rgba(0,240,200,.03)}
.career-badge{
  display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;
}
.ai-badge{background:rgba(0,240,200,.15);color:#00F0C8;border:1px solid rgba(0,240,200,.3);}
.data-badge{background:rgba(153,255,0,.15);color:#99FF00;border:1px solid rgba(153,255,0,.3);}
.backend-badge{background:rgba(255,153,0,.15);color:#FF9900;border:1px solid rgba(255,153,0,.3);}
.frontend-badge{background:rgba(0,153,255,.15);color:#0099FF;border:1px solid rgba(0,153,255,.3);}
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

const CGPA_OPTIONS = ["7.0+", "7.5+", "8.0+", "8.5+", "9.0+"];
const DOMAIN_OPTIONS = ["Software Development", "Data Science", "Cloud Computing", "Cybersecurity", "DevOps", "UI/UX Design", "Product Management", "AI/ML"];

export default function CareerRecommendationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [preferredDomain, setPreferredDomain] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [savedCareers, setSavedCareers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
    }
  }, [navigate]);

  const generateAIRecommendations = async () => {
    if (!skills.trim()) {
      toast.error("Please enter your skills");
      return;
    }
    if (!interests.trim()) {
      toast.error("Please enter your interests");
      return;
    }
    if (!cgpa) {
      toast.error("Please select your CGPA range");
      return;
    }
    if (!preferredDomain) {
      toast.error("Please select your preferred domain");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s);
      const interestsArray = interests.split(",").map(i => i.trim()).filter(i => i);
      
      console.log("Sending request:", {
        skills: skillsArray,
        interests: interestsArray,
        cgpa: cgpa,
        preferredDomain: preferredDomain,
        userId: userData.id || 1
      });
      
      const response = await axios.post(
        `${API_URL}/career/ai-recommendations`,
        {
          skills: skillsArray,
          interests: interestsArray,
          cgpa: cgpa,
          preferredDomain: preferredDomain,
          userId: userData.id || 1
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Response:", response.data);
      
      if (response.data && response.data.length > 0) {
        setRecommendations(response.data);
        setStep(2);
        toast.success(`Found ${response.data.length} career recommendations!`);
      } else {
        toast.error("No recommendations found. Please try different criteria.");
      }
    } catch (err) {
      console.error("API Error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else if (err.response?.status === 400) {
        toast.error("Invalid request format. Please check your inputs.");
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (err.code === "ECONNABORTED" || err.message === "Network Error") {
        toast.error("Cannot connect to server. Please make sure backend is running on port 8080");
      } else {
        toast.error("Failed to get recommendations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCareer = async (career) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/career/save-career`,
        career,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedCareers(prev => [...prev, career.title]);
      toast.success(`${career.title} saved to your profile!`);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save career");
    }
  };

  const getBadgeClass = (domain) => {
    if (domain === "AI/ML") return "ai-badge";
    if (domain === "Data Science") return "data-badge";
    if (domain === "Software Development") return "backend-badge";
    return "frontend-badge";
  };

  return (
    <div className="cp" style={{ background: BG, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{STYLES}</style>
      <Orbs />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

        <div className="fadeup" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: "rgba(0,240,200,.08)", border: "1px solid rgba(0,240,200,.18)", marginBottom: 22 }}>
            <span className="sdot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F0C8", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "#00F0C8", textTransform: "uppercase" }}>AI-Powered Career Guidance</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, background: "linear-gradient(90deg,#00F0C8,#0099FF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>
            Find Your Perfect Career
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.4)", maxWidth: 600, margin: "0 auto" }}>
            Our AI analyzes your skills, interests, and academic background to suggest the best career paths
          </p>
        </div>

        {step === 1 && (
          <div className="step-in">
            <div className="card" style={{ padding: "40px" }}>
              <div style={{ marginBottom: 24 }}>
                <label className="lbl">Your Skills *</label>
                <input
                  type="text"
                  className="inp"
                  placeholder="e.g., Java, Python, React, SQL, Communication..."
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
                  Enter your technical and soft skills separated by commas
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="lbl">Your Interests *</label>
                <input
                  type="text"
                  className="inp"
                  placeholder="e.g., Web Development, AI, Problem Solving, Design..."
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
                  What are you passionate about? Be specific
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="lbl">CGPA Range *</label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {CGPA_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setCgpa(option)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        background: cgpa === option ? "linear-gradient(135deg,#00F0C8,#0099FF)" : "rgba(255,255,255,.04)",
                        border: cgpa === option ? "none" : "1px solid rgba(0,240,200,.2)",
                        color: cgpa === option ? "#020B18" : "rgba(255,255,255,.6)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all .2s"
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label className="lbl">Preferred Domain *</label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {DOMAIN_OPTIONS.map(domain => (
                    <button
                      key={domain}
                      onClick={() => setPreferredDomain(domain)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        background: preferredDomain === domain ? "linear-gradient(135deg,#00F0C8,#0099FF)" : "rgba(255,255,255,.04)",
                        border: preferredDomain === domain ? "none" : "1px solid rgba(0,240,200,.2)",
                        color: preferredDomain === domain ? "#020B18" : "rgba(255,255,255,.6)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all .2s"
                      }}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <button className="sbtn" onClick={generateAIRecommendations} disabled={loading || !skills || !interests || !cgpa || !preferredDomain}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    AI Analyzing your profile...
                  </span>
                ) : (
                  "Get AI Career Recommendations →"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && recommendations.length > 0 && (
          <div className="fadeup2">
            <button onClick={() => setStep(1)} className="sbtn-outline" style={{ marginBottom: 24 }}>
              ← Back to edit profile
            </button>

            <div className="card" style={{ padding: "40px" }}>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,.92)", marginBottom: 8 }}>
                  Your AI-Powered Career Matches 🎯
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
                  Based on your skills, interests, {cgpa} CGPA, and {preferredDomain} domain preference
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
                {recommendations.map((career, idx) => (
                  <div key={idx} className="rec-card card-hover">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                          <span className={`career-badge ${getBadgeClass(career.domain)}`}>
                            {career.domain}
                          </span>
                          <span style={{ fontSize: 24 }}>{career.icon}</span>
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,.9)" }}>
                          {career.title}
                        </h3>
                      </div>
                      <div style={{ background: "linear-gradient(135deg,rgba(0,240,200,.15),rgba(0,153,255,.1))", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, color: "#00F0C8" }}>
                        {career.matchScore}% Match
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 16, lineHeight: 1.6 }}>
                      {career.description}
                    </p>

                    <div style={{ marginBottom: 12, padding: "8px 0", borderTop: "1px solid rgba(0,240,200,.1)", borderBottom: "1px solid rgba(0,240,200,.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>💰 {career.salaryRange}</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>📈 Growth: {career.growthRate}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "rgba(0,240,200,.5)", marginBottom: 6 }}>Key Skills Required</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(career.skills || []).slice(0, 4).map((skill, i) => (
                          <span key={i} className="skill-tag" style={{ fontSize: 11, padding: "4px 10px", cursor: "default" }}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "rgba(0,240,200,.5)", marginBottom: 6 }}>Learning Path</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(career.learningPath || []).slice(0, 3).map((step, i) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: "rgba(0,240,200,.08)", color: "rgba(255,255,255,.6)" }}>{step}</span>
                        ))}
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: "rgba(0,240,200,.08)", color: "#00F0C8" }}>+ more</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        onClick={() => handleSaveCareer(career)} 
                        disabled={savedCareers.includes(career.title)} 
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10,
                          background: savedCareers.includes(career.title) ? "rgba(0,240,200,.1)" : "rgba(0,240,200,.08)",
                          border: "1px solid rgba(0,240,200,.2)",
                          color: savedCareers.includes(career.title) ? "#00F0C8" : "rgba(255,255,255,.6)",
                          fontSize: 13, fontWeight: 600, cursor: "pointer"
                        }}
                      >
                        {savedCareers.includes(career.title) ? "✓ Saved" : "📌 Save Career"}
                      </button>
                      <button 
                        onClick={() => navigate(`/career-path/${career.id || idx}`, { state: { career } })} 
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10,
                          background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                          border: "none", color: "#020B18", fontSize: 13, fontWeight: 700, cursor: "pointer"
                        }}
                      >
                        🚀 View Path
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 24, justifyContent: "center" }}>
              <button onClick={() => navigate("/dashboard")} className="sbtn" style={{ width: "auto", padding: "12px 28px" }}>
                Go to Dashboard
              </button>
              <button onClick={generateAIRecommendations} className="sbtn-outline">🔄 Get New Recommendations</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}