import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// ── Auth helper ────────────────────────────────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Grade helpers ──────────────────────────────────────────────────────────────
const getGrade = (pct) => {
  if (pct >= 90) return { label: "S", title: "Outstanding",  color: "#BF953F" };
  if (pct >= 80) return { label: "A", title: "Excellent",    color: "#22c55e" };
  if (pct >= 70) return { label: "B", title: "Very Good",    color: "#3b82f6" };
  if (pct >= 60) return { label: "C", title: "Good",         color: "#a78bfa" };
  return           { label: "D", title: "Satisfactory",  color: "#f59e0b" };
};

// ── Gold gradient used everywhere ─────────────────────────────────────────────
const GOLD = "linear-gradient(135deg,#BF953F 0%,#FCF6BA 25%,#B38728 50%,#FBF5B7 75%,#AA771C 100%)";
const DARK = "linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 50%,#262626 100%)";

// ─────────────────────────────────────────────────────────────────────────────
export default function Certificate() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const certRef   = useRef(null);

  const [user,        setUser]        = useState(null);
  const [certData,    setCertData]    = useState(null);   // saved certificate row
  const [testData,    setTestData]    = useState(null);   // original test data
  const [qrUrl,       setQrUrl]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error,       setError]       = useState(null);

  // Grab whatever was passed from PreviousMockTests → navigate("/certificate", { state })
  const state = location.state || {};

  // ── On mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!state || Object.keys(state).length === 0) {
      toast.error("No certificate data found");
      navigate("/mock-test");
      return;
    }
    init(token);
  }, []);

  // ── Main initialisation ─────────────────────────────────────────────────────
  const init = async (token) => {
    try {
      setLoading(true);

      // 1. Fetch current user
      const userRes = await axios.get(`${API_URL}/auth/current-user`, {
        headers: authHeaders(),
      });
      const u = userRes.data?.user || userRes.data;
      if (!u) { navigate("/login"); return; }
      setUser(u);

      // 2. If testId present, re-fetch the original test result for fresh data
      let freshTest = { ...state };
      if (state.testId) {
        try {
          const testRes = await axios.get(
            `${API_URL}/mocktest/result/${state.testId}`,
            { headers: authHeaders() }
          );
          // Merge: API data takes precedence, fall back to route state
          freshTest = { ...state, ...(testRes.data || {}) };
        } catch {
          // If endpoint doesn't exist, silently fall back to route state
        }
      }
      setTestData(freshTest);

      // 3. Save / fetch certificate record
      const pct   = freshTest.percentage ?? 0;
      const grade = getGrade(pct);

      const payload = {
        userId:         u.id,
        userName:       u.fullName || u.username || u.name,
        userEmail:      u.email,
        category:       freshTest.category       || "Mock Test",
        topic:          freshTest.topic          || freshTest.category || "General",
        difficulty:     freshTest.difficulty     || "MEDIUM",
        score:          freshTest.score          ?? 0,
        totalQuestions: freshTest.totalQuestions ?? 0,
        percentage:     pct,
        grade:          grade.label,
        gradeTitle:     grade.title,
        testId:         freshTest.testId         || `TEST_${Date.now()}`,
        completedAt:    freshTest.completedAt    || new Date().toISOString(),
      };

      const certRes = await axios.post(
        `${API_URL}/certificates/save`,
        payload,
        { headers: authHeaders() }
      );

      const saved = certRes.data?.data || certRes.data;
      setCertData({ ...payload, ...saved });

      // 4. Generate QR for verification
      if (saved?.certificateId) {
        const verifyUrl = `${window.location.origin}/verify-certificate/${saved.certificateId}`;
        try {
          const QRCode = await import("qrcode");
          const url = await QRCode.default.toDataURL(verifyUrl, {
            width: 90, margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" },
          });
          setQrUrl(url);
        } catch { /* QR optional */ }
      }

      toast.success("Certificate ready!");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to generate certificate";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── PDF download ─────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    const tid = toast.loading("Generating PDF…");
    try {
      const el = certRef.current;
      const prev = { width: el.style.width, height: el.style.height };
      el.style.width  = "1122px";  // exact A4 landscape at 96dpi
      el.style.height = "794px";

      const canvas = await html2canvas(el, {
        scale: 2.5,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        allowTaint: false,
        logging: false,
        windowWidth:  1122,
        windowHeight: 794,
      });

      el.style.width  = prev.width;
      el.style.height = prev.height;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);

      const name = (certData?.userName || user?.fullName || "Certificate")
        .replace(/\s+/g, "_");
      pdf.save(`CareerPilot_Certificate_${name}.pdf`);
      toast.success("Downloaded!", { id: tid });
    } catch (e) {
      console.error(e);
      toast.error("Download failed. Try again.", { id: tid });
    } finally {
      setDownloading(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const pct       = testData?.percentage ?? state?.percentage ?? 0;
  const grade     = getGrade(pct);
  const year      = new Date().getFullYear();
  const userName  = certData?.userName || user?.fullName || user?.username || "Valued Participant";
  const certTitle = testData?.title || testData?.topic || testData?.category || "Mock Test";
  const certId    = certData?.certificateId ? `#${certData.certificateId}` : "";
  const dateStr   = testData?.completedAt
    ? new Date(testData.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        <div style={{ fontSize: "48px" }}>🎓</div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "1px" }}>
          Preparing Your Certificate…
        </div>
        <div style={{ width: "50px", height: "50px", border: "3px solid #BF953F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ fontSize: "48px" }}>❌</div>
        <div style={{ fontSize: "16px", color: "#ef4444", fontWeight: "600" }}>{error}</div>
        <button onClick={() => navigate("/mock-test")} style={{ padding: "10px 26px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
          Back to Tests
        </button>
      </div>
    );
  }

  // ── Certificate render ───────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)",
      padding: "40px 20px",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Segoe UI', sans-serif",
    }}>

      {/* Page title */}
      <div style={{ marginBottom: "28px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          🎓 Achievement Certificate
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(255,255,255,.35)" }}>
          {certId && `Certificate ${certId} · `}Issued {dateStr}
        </p>
      </div>

      {/* ══════════════════ CERTIFICATE FRAME ══════════════════ */}
      <div
        ref={certRef}
        style={{
          width: "1000px",
          height: "707px",
          background: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          padding: "28px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Outer gold border */}
        <div style={{ position: "absolute", inset: "14px", border: "2px solid transparent", borderImage: `${GOLD} 1`, pointerEvents: "none" }} />
        {/* Inner thin border */}
        <div style={{ position: "absolute", inset: "20px", border: "0.5px solid rgba(191,149,63,0.3)", pointerEvents: "none" }} />

        {/* ── Top-left dark wing ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "380px", height: "175px", overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-55px", left: "-55px", width: "420px", height: "115px", background: DARK, transform: "rotate(-25deg)", boxShadow: "0 6px 20px rgba(0,0,0,0.45)" }} />
          <div style={{ position: "absolute", top: "58px", left: "-25px", width: "360px", height: "8px", background: GOLD, transform: "rotate(-25deg)" }} />
          <div style={{ position: "absolute", top: "71px", left: "-25px", width: "300px", height: "3px", background: GOLD, transform: "rotate(-25deg)", opacity: 0.6 }} />
        </div>

        {/* ── Bottom-right dark wing ── */}
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "380px", height: "175px", overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", bottom: "-55px", right: "-55px", width: "420px", height: "115px", background: DARK, transform: "rotate(-25deg)", boxShadow: "0 -6px 20px rgba(0,0,0,0.45)" }} />
          <div style={{ position: "absolute", bottom: "58px", right: "-25px", width: "360px", height: "8px", background: GOLD, transform: "rotate(-25deg)" }} />
          <div style={{ position: "absolute", bottom: "71px", right: "-25px", width: "300px", height: "3px", background: GOLD, transform: "rotate(-25deg)", opacity: 0.6 }} />
        </div>

        {/* ── Grade badge (top-left corner, above wing) ── */}
        <div style={{
          position: "absolute", top: "22px", left: "26px", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: GOLD,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 12px rgba(170,119,28,0.4)",
            border: "2px solid #fff",
          }}>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#4A3200" }}>{grade.label}</span>
          </div>
          <span style={{ fontSize: "9px", fontWeight: "800", color: "#fff", letterSpacing: "0.5px", marginTop: "3px", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
            {grade.title.toUpperCase()}
          </span>
        </div>

        {/* ── Top-right ribbon badge ── */}
        <div style={{
          position: "absolute", top: 0, right: "65px", width: "105px", height: "130px",
          background: DARK, boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          padding: "10px 6px", boxSizing: "border-box",
          display: "flex", flexDirection: "column", alignItems: "center",
          color: "#fff", borderLeft: "1px solid #444", borderRight: "1px solid #444",
          zIndex: 10,
        }}>
          <span style={{ fontSize: "18px", marginBottom: "6px" }}>⚙️</span>
          <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", textAlign: "center", color: "#F7F7F7", lineHeight: "1.4" }}>
            Industry<br />Ready<br /><span style={{ color: "#D4AF37" }}>Skills</span>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, borderLeft: "52.5px solid transparent", borderRight: "52.5px solid transparent", borderBottom: "14px solid #fff" }} />
        </div>

        {/* ══ INNER CONTENT ══════════════════════════════════════ */}
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "20px 90px 10px",
          boxSizing: "border-box",
        }}>

          {/* Org logo mark */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", marginBottom: "6px" }}>
            {[16, 28, 40, 28, 35, 18].map((h, i) => (
              <div key={i} style={{ width: i === 3 ? "14px" : i === 4 ? "14px" : "9px", height: `${h}px`, background: GOLD, marginLeft: i === 2 ? "4px" : "0" }} />
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Cinzel', 'Times New Roman', serif",
            fontSize: "52px", fontWeight: "800", color: "#111",
            letterSpacing: "6px", margin: "0 0 3px", textTransform: "uppercase",
          }}>
            Certificate
          </h1>

          {/* Subtitle divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
            <div style={{ height: "1.5px", width: "70px", background: GOLD }} />
            <div style={{ width: "5px", height: "5px", transform: "rotate(45deg)", background: "#B38728" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#555", letterSpacing: "3.5px", textTransform: "uppercase" }}>
              of Achievement — {certTitle}
            </span>
            <div style={{ width: "5px", height: "5px", transform: "rotate(45deg)", background: "#B38728" }} />
            <div style={{ height: "1.5px", width: "70px", background: GOLD }} />
          </div>

          {/* Presented-to ribbon */}
          <div style={{
            position: "relative", background: "#111",
            padding: "7px 44px", borderRadius: "2px", marginBottom: "18px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
          }}>
            <span style={{ color: "#E5E7EB", fontSize: "10px", fontWeight: "600", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              This Certificate is Proudly Presented To
            </span>
            <div style={{ position: "absolute", left: "-9px", top: "4px", borderTop: "14px solid #222", borderBottom: "14px solid #222", borderLeft: "9px solid transparent" }} />
            <div style={{ position: "absolute", right: "-9px", top: "4px", borderTop: "14px solid #222", borderBottom: "14px solid #222", borderRight: "9px solid transparent" }} />
          </div>

          {/* Recipient name */}
          <div style={{
            width: "65%", borderBottom: "2px solid transparent",
            borderImage: `${GOLD} 1`, textAlign: "center",
            marginBottom: "16px", paddingBottom: "4px",
          }}>
            <span style={{ fontFamily: "'Pinyon Script','Georgia',cursive,serif", fontSize: "40px", color: "#111", fontWeight: "600" }}>
              {userName}
            </span>
          </div>

          {/* Body text */}
          <p style={{
            fontSize: "12.5px", color: "#444", lineHeight: "1.75",
            maxWidth: "600px", textAlign: "center", margin: "0 0 18px",
            fontStyle: "italic", fontFamily: "'Georgia', serif",
          }}>
            for successfully completing the&nbsp;
            <strong style={{ color: "#A27924" }}>{certTitle}</strong>
            &nbsp;mock test and demonstrating exceptional analytical,
            technical and problem-solving skills.<br />
            <span style={{ color: "#666", fontWeight: "500" }}>
              Score: {testData?.score ?? state?.score ?? 0}/{testData?.totalQuestions ?? state?.totalQuestions ?? 0}
              &nbsp;·&nbsp;{pct}%&nbsp;·&nbsp;Grade {grade.label} — {grade.title}
            </span>
          </p>

          {/* Meta badges */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px", marginBottom: "6px" }}>
            {[
              { icon: "📅", label: "YEAR",         value: year },
              { icon: "📂", label: "CATEGORY",     value: testData?.category || state?.category || "Mock Test" },
              { icon: "🏢", label: "ORGANISATION",  value: "CareerPilot" },
              { icon: "👤", label: "ISSUED BY",     value: "Diptiranjan Mahapatra" },
            ].map((m, i, arr) => (
              <>
                <div key={m.label} style={{ textAlign: "center" }}>
                  <span style={{ display: "block", fontSize: "16px" }}>{m.icon}</span>
                  <span style={{ display: "block", fontSize: "9px", fontWeight: "700", color: "#888", letterSpacing: "1px", margin: "3px 0" }}>{m.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#111" }}>{m.value}</span>
                </div>
                {i < arr.length - 1 && <div style={{ height: "32px", width: "1px", background: "#e5e7eb" }} />}
              </>
            ))}
          </div>

          {/* ── Footer: signatures + stamp ── */}
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "8px" }}>

            {/* Left signatory */}
            <div style={{ width: "200px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Mrs Saint Delafield','Edwardian Script ITC',cursive", fontSize: "26px", color: "#2d3748", minHeight: "32px" }}>
                Diptiranjan Mahapatra
              </div>
              <div style={{ height: "1px", background: "linear-gradient(to right,transparent,#888,transparent)", margin: "4px 0" }} />
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#222" }}>Diptiranjan Mahapatra</div>
              <div style={{ fontSize: "8.5px", color: "#777", letterSpacing: "0.5px", textTransform: "uppercase", marginTop: "2px" }}>Founder, CareerPilot</div>
            </div>

            {/* Center gold stamp */}
            <div style={{
              width: "82px", height: "82px", background: GOLD, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(170,119,28,0.4)",
              border: "2px dashed #fff", outline: "3px solid #BF953F",
            }}>
              <div style={{ textAlign: "center", color: "#4A3200", padding: "4px" }}>
                <div style={{ fontSize: "7px", fontWeight: "800", letterSpacing: "0.5px" }}>EXCELLENCE</div>
                <div style={{ fontSize: "6px", margin: "2px 0", opacity: 0.8 }}>IN PRACTICE</div>
                <div style={{ fontSize: "9px" }}>★★★</div>
              </div>
            </div>

            {/* Right: QR or signatory */}
            <div style={{ width: "200px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {qrUrl ? (
                <>
                  <div style={{ padding: "3px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "4px" }}>
                    <img src={qrUrl} alt="Verify" style={{ width: "46px", height: "46px", display: "block" }} />
                  </div>
                  <div style={{ height: "1px", width: "100%", background: "linear-gradient(to right,transparent,#888,transparent)", marginBottom: "4px" }} />
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#222" }}>CareerPilot Team</div>
                  <div style={{ fontSize: "8px", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginTop: "2px" }}>Scan to Verify</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "'Mrs Saint Delafield','Edwardian Script ITC',cursive", fontSize: "26px", color: "#2d3748", minHeight: "32px" }}>
                    CareerPilot Team
                  </div>
                  <div style={{ height: "1px", width: "100%", background: "linear-gradient(to right,transparent,#888,transparent)", margin: "4px 0" }} />
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#222" }}>CareerPilot Team</div>
                  <div style={{ fontSize: "8.5px", color: "#777", letterSpacing: "0.5px", textTransform: "uppercase", marginTop: "2px" }}>Authorized Signatory</div>
                </>
              )}
            </div>
          </div>

          {/* Certificate ID footer strip */}
          {certId && (
            <div style={{ marginTop: "6px", textAlign: "center" }}>
              <span style={{ fontSize: "8px", color: "#bbb", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Certificate ID: {certId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ marginTop: "32px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>

        {/* Download */}
        <button
          onClick={downloadPDF}
          disabled={downloading}
          style={{
            padding: "13px 34px",
            background: downloading
              ? "rgba(255,255,255,.1)"
              : "linear-gradient(135deg,#BF953F 0%,#FCF6BA 40%,#B38728 100%)",
            border: "none", borderRadius: "10px",
            color: downloading ? "rgba(255,255,255,.4)" : "#3A2500",
            fontSize: "13px", fontWeight: "800", letterSpacing: "0.8px",
            cursor: downloading ? "not-allowed" : "pointer",
            boxShadow: downloading ? "none" : "0 4px 18px rgba(191,149,63,0.45)",
            transition: "all .2s",
            display: "flex", alignItems: "center", gap: "8px",
          }}
          onMouseEnter={e => { if (!downloading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(191,149,63,0.55)"; } }}
          onMouseLeave={e => { if (!downloading) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(191,149,63,0.45)"; } }}
        >
          {downloading ? <>⏳ Generating PDF…</> : <>📥 Download Certificate</>}
        </button>

        {/* Share / copy link */}
        {certData?.certificateId && (
          <button
            onClick={() => {
              const url = `${window.location.origin}/verify-certificate/${certData.certificateId}`;
              navigator.clipboard.writeText(url).then(() => toast.success("Verification link copied!"));
            }}
            style={{
              padding: "13px 28px", borderRadius: "10px",
              background: "rgba(0,240,200,.1)", border: "1px solid rgba(0,240,200,.3)",
              color: "#00F0C8", fontSize: "13px", fontWeight: "700",
              cursor: "pointer", transition: "all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,240,200,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,240,200,.1)"; }}
          >
            🔗 Copy Verify Link
          </button>
        )}

        {/* Back */}
        <button
          onClick={() => navigate("/mock-test")}
          style={{
            padding: "13px 28px", borderRadius: "10px",
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)",
            color: "rgba(255,255,255,.7)", fontSize: "13px", fontWeight: "700",
            cursor: "pointer", transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
        >
          🎯 Take New Test
        </button>

        {/* View history */}
        <button
          onClick={() => navigate("/mock-test/previous")}
          style={{
            padding: "13px 28px", borderRadius: "10px",
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)",
            color: "rgba(255,255,255,.7)", fontSize: "13px", fontWeight: "700",
            cursor: "pointer", transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
        >
          📋 View All Tests
        </button>
      </div>

    </div>
  );
}