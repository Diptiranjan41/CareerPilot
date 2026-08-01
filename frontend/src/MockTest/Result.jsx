import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
axios.defaults.withCredentials = true;

// ── Brand tokens (same as before, keeping for brevity) ───────────────────
const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const CARD = "linear-gradient(145deg,rgba(0,240,200,.06),rgba(0,153,255,.03))";
const BORDER = "1px solid rgba(0,240,200,.13)";
const SHADOW = "inset 0 1px 0 rgba(0,240,200,.1),0 8px 48px rgba(0,0,0,.5)";
const ACCENT = "#00F0C8";
const ACCENT2 = "#0099FF";
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
.orb1{animation:orbFloat 9s ease-in-out infinite}
.orb2{animation:orbFloat 12s ease-in-out infinite 3s}
.orb3{animation:orbFloat 8s ease-in-out infinite 6s}
.sdot{animation:pulseDot 2s ease-in-out infinite}
.fadeup{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) forwards}
.fadeup2{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .1s forwards;opacity:0}
.card{background:${CARD};border:${BORDER};border-radius:22px;backdrop-filter:blur(24px);box-shadow:${SHADOW}}
.card-sm{background:linear-gradient(145deg,rgba(0,240,200,.05),rgba(0,153,255,.02));border:1px solid rgba(0,240,200,.11);border-radius:16px;backdrop-filter:blur(16px)}
.lbl{font-size:11px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:rgba(0,240,200,.65);display:block;margin-bottom:7px}
.sbtn{
  width:100%;padding:14px;border:none;border-radius:12px;
  background:linear-gradient(135deg,#00F0C8,#0099FF);
  color:#020B18;font-family:'Cabinet Grotesk',sans-serif;
  font-size:15px;font-weight:800;cursor:pointer;
  transition:all .25s;box-shadow:0 0 28px rgba(0,240,200,.35);
}
.sbtn:hover:not(:disabled){box-shadow:0 0 52px rgba(0,240,200,.65);transform:translateY(-2px)}
.sbtn:disabled{opacity:.55;cursor:not-allowed}
.sbtn-outline{
  width:100%;padding:12px;border:1px solid rgba(0,240,200,.22);border-radius:12px;
  background:rgba(0,240,200,.05);color:${ACCENT};font-size:14px;font-weight:700;cursor:pointer;
}
.sbtn-outline:hover{background:rgba(0,240,200,.1);border-color:rgba(0,240,200,.4)}
.divline{flex:1;height:1px;background:rgba(0,240,200,.1)}
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

function DiffBadge({ d }) {
  const l = (d || "").toLowerCase();
  const cfg = l === "easy" ? { bg: "rgba(34,197,94,.12)", col: "#4ade80" } : l === "hard" ? { bg: "rgba(239,68,68,.12)", col: "#f87171" } : { bg: "rgba(251,191,36,.12)", col: "#fbbf24" };
  return <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.col }}>{d}</span>;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    questions,
    answers,
    score,
    percentage,
    category,
    difficulty,
    topic,
    totalQuestions,
  } = location.state || {};

  useEffect(() => {
    if (!location.state || !questions) {
      toast.error("No test data found. Please take a test first.");
      navigate('/mock-test');
      return;
    }
    
    // First fetch user, then save result
    fetchCurrentUserAndSave();
  }, []);

  const fetchCurrentUserAndSave = async () => {
    try {
      // Fetch current user from backend
      const response = await axios.get(`${API_URL}/auth/current-user`, {
        withCredentials: true
      });
      
      if (response.data && response.data.user) {
        setCurrentUser(response.data.user);
        // Save result after getting user
        await saveResultToBackend(response.data.user);
      } else {
        console.error("No user data received");
        toast.error("Could not fetch user information");
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      toast.error("Please log in again to save your results");
    }
  };

  const saveResultToBackend = async (user) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // Ensure answers is an array
      const answersArray = Array.isArray(answers) ? answers : [];
      
      // Convert answers array to Map format
      const answersMap = {};
      answersArray.forEach((answer, index) => {
        answersMap[index] = answer || "";
      });

      // Ensure questions is an array
      const questionsArray = Array.isArray(questions) ? questions : [];

      // Format questions for backend
      const formattedQuestions = questionsArray.map((q, idx) => ({
        id: idx,
        question: q.question,
        correct_answer: q.correct_answer,
        explanation: q.explanation || "No explanation available",
        difficulty: q.difficulty || "Medium",
        options: q.options || []
      }));

      // FIRST: Save to mock test results
      const mockTestResultData = {
        title: `${category || "Mock"} ${difficulty || "Test"} - ${new Date().toLocaleDateString()}`,
        category: category || "General",
        difficulty: difficulty || "Mixed",
        topic: topic || "All Topics",
        totalQuestions: totalQuestions || 0,
        score: score || 0,
        correctAnswers: score || 0,
        duration: 0,
        answers: answersMap,
        questions: formattedQuestions
      };

      console.log("Saving mock test result...");
      await axios.post(`${API_URL}/mocktest/results/save`, mockTestResultData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      // SECOND: Save certificate
      const certificateData = {
        userId: user?.id,
        userName: user?.fullName || user?.username || "Student",
        userEmail: user?.email,
        category: category || "General",
        score: score || 0,
        totalQuestions: totalQuestions || 0,
        percentage: percentage || 0,
        testId: `TEST_${Date.now()}`,
        rankPosition: null
      };

      console.log("Saving certificate with data:", certificateData);
      
      const certificateResponse = await axios.post(`${API_URL}/certificates/save`, certificateData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("Certificate saved:", certificateResponse.data);
      toast.success("Result and certificate saved successfully!");
      
    } catch (error) {
      console.error("Failed to save result:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        toast.error(`Failed to save: ${error.response.data.message || "Unknown error"}`);
      } else if (error.request) {
        console.error("No response from server");
        toast.error("Server not responding. Please try again later.");
      } else {
        console.error("Error message:", error.message);
      }
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewCertificate = () => {
    navigate('/mock-test/certificate', {
      state: {
        score,
        percentage,
        category,
        difficulty,
        totalQuestions,
        correctAnswers: score,
        date: new Date().toISOString(),
        userName: currentUser?.fullName || currentUser?.username || "Student"
      }
    });
  };

  const grade = percentage >= 80
    ? { label: "🏆 EXCELLENT", color: "#4ade80" }
    : percentage >= 60
      ? { label: "👍 GOOD JOB", color: "#fbbf24" }
      : { label: "📚 KEEP PRACTICING", color: "#f87171" };

  if (!location.state || !questions) return null;

  const answersArray = Array.isArray(answers) ? answers : [];

  return (
    <div className="cp" style={{ background: BG, minHeight: "100vh", position: "relative", overflow: "auto", padding: "44px 20px" }}>
      <style>{STYLES}</style>
      <Orbs />

      <div style={{ position: "relative", zIndex: 10, maxWidth: "900px", margin: "0 auto" }}>
        <div className="card fadeup" style={{ padding: "40px 36px", textAlign: "center", marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, marginBottom: 20 }}>
            <span className="sdot" style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: ACCENT, textTransform: "uppercase" }}>Test Complete</span>
          </div>

          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 4, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {percentage}<span style={{ fontSize: "40%", WebkitTextFillColor: "rgba(255,255,255,.4)" }}>%</span>
          </div>

          <div style={{ fontSize: 14, color: grade.color, fontWeight: 700, marginBottom: 6 }}>{grade.label}</div>
          <div style={{ fontSize: 13, color: T3, marginBottom: 28 }}>{score} correct out of {totalQuestions} questions</div>

          <div style={{ height: 6, background: "rgba(0,240,200,.08)", borderRadius: 99, overflow: "hidden", maxWidth: 320, margin: "0 auto 32px" }}>
            <div style={{ height: "100%", width: `${percentage}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, borderRadius: 99, transition: "width .8s ease" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
            {[
              { val: score, label: "Correct", col: "#4ade80" },
              { val: totalQuestions - score, label: "Wrong", col: "#f87171" },
              { val: totalQuestions, label: "Total", col: T2 },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.col }}>{s.val}</div>
                <div style={{ fontSize: 10, color: T3, textTransform: "uppercase", letterSpacing: ".7px", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button className="sbtn" onClick={handleViewCertificate} style={{ marginBottom: "15px" }} disabled={isSaving}>
            🎓 View & Download Certificate
          </button>
          
          {isSaving && (
            <div style={{ fontSize: 12, color: ACCENT, marginTop: 10 }}>
              Saving your result...
            </div>
          )}
        </div>

        <div className="fadeup2">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="lbl" style={{ margin: 0 }}>📝 Question Review</span>
            <div className="divline" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, maxHeight: "500px", overflowY: "auto" }}>
            {questions?.map((q, i) => {
              const userAnswer = answersArray[i];
              const correct = userAnswer === q.correct_answer;
              return (
                <div key={i} className="card-sm" style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", background: correct ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)", color: correct ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                      {correct ? "✓" : "✗"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, color: T1, margin: "0 0 8px", lineHeight: 1.55, fontWeight: 500 }}>{q.question}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: correct ? "rgba(74,222,128,.7)" : "rgba(248,113,113,.7)" }}>
                          Your answer: {userAnswer || <em style={{ color: T4 }}>skipped</em>}
                        </span>
                        {!correct && <span style={{ fontSize: 12, color: ACCENT }}>· Correct: {q.correct_answer}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: T3, margin: 0, lineHeight: 1.55 }}>{q.explanation}</p>
                    </div>
                    <DiffBadge d={q.difficulty} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="sbtn-outline" style={{ flex: 1 }} onClick={() => navigate('/mock-test')}>
              🔄 New Test
            </button>
            <button className="sbtn" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
              📊 Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}