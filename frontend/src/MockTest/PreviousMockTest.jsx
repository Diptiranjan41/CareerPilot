import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8080/api";
const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";

const DIFF_COLORS = {
    EASY:   { bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.3)",  text: "#22c55e" },
    MEDIUM: { bg: "rgba(251,191,36,.15)", border: "rgba(251,191,36,.3)", text: "#fbbf24" },
    HARD:   { bg: "rgba(239,68,68,.15)",  border: "rgba(239,68,68,.3)",  text: "#ef4444" },
};

function getScoreColor(pct) {
    if (pct >= 80) return "#00F0C8";
    if (pct >= 60) return "#fbbf24";
    return "#ef4444";
}
function getScoreLabel(pct) {
    if (pct >= 90) return "Excellent";
    if (pct >= 75) return "Good";
    if (pct >= 60) return "Average";
    return "Needs Work";
}
function formatDuration(seconds) {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}
function formatDate(dt) {
    if (!dt) return "";
    return new Date(dt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ── Robust deduplication ──────────────────────────────────────────────────────
// Primary key: id. Fallback composite key: completedAt + score + totalQuestions
// This catches cases where the same attempt is returned with different IDs.
function deduplicateTests(arr) {
    const seenIds        = new Set();
    const seenComposite  = new Set();
    return arr.filter(item => {
        // --- by id ---
        if (item.id) {
            if (seenIds.has(item.id)) return false;
            seenIds.add(item.id);
        }
        // --- by composite fingerprint (catches duplicate records with different ids) ---
        const fingerprint = [
            item.completedAt ?? "",
            item.score       ?? "",
            item.totalQuestions ?? "",
            item.category    ?? "",
            item.topic       ?? "",
        ].join("|");
        if (seenComposite.has(fingerprint)) return false;
        seenComposite.add(fingerprint);
        return true;
    });
}

function ScoreRing({ pct }) {
    const r = 28, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
    const color = getScoreColor(pct);
    return (
        <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
            <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dasharray 1s ease" }}
            />
            <text x="36" y="40" textAnchor="middle" fill={color} fontSize="13" fontWeight="800" fontFamily="monospace">
                {Math.round(pct)}%
            </text>
        </svg>
    );
}

function StatBadge({ label, value, color }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "10px 14px", borderRadius: "10px",
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)",
            minWidth: "64px"
        }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: color || "#fff" }}>{value}</span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,.4)", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</span>
        </div>
    );
}

function TestCard({ test, index }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const pct = test.percentage ?? (test.score && test.totalQuestions
        ? Math.round((test.score / test.totalQuestions) * 100) : 0);
    const diff = (test.difficulty || "MEDIUM").toUpperCase();
    const diffStyle = DIFF_COLORS[diff] || DIFF_COLORS.MEDIUM;
    const rgbScore = pct >= 80 ? "0,240,200" : pct >= 60 ? "251,191,36" : "239,68,68";

    // Navigate to /certificate, passing full test data via route state
    const handleDownloadCertificate = () => {
        navigate("/mock-test/certificate", {
            state: {
                testId:         test.id,
                title:          test.title || test.topic || test.category || "Mock Test",
                category:       test.category || "—",
                topic:          test.topic    || "—",
                difficulty:     test.difficulty || "MEDIUM",
                score:          test.score ?? 0,
                totalQuestions: test.totalQuestions ?? 0,
                percentage:     pct,
                duration:       test.duration ?? null,
                completedAt:    test.completedAt ?? null,
                scoreLabel:     getScoreLabel(pct),
            },
        });
    };

    return (
        <div
            style={{
                background: "rgba(255,255,255,.04)", borderRadius: "16px",
                border: "1px solid rgba(0,240,200,.12)", overflow: "hidden",
                transition: "border-color .25s",
                animation: `fadeUp .4s ease ${index * 0.07}s both`,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,240,200,.35)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,240,200,.12)"}
        >
            {/* ── Card Header ───────────────────────────────────────────────── */}
            <div style={{ padding: "20px 22px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <ScoreRing pct={pct} />

                <div style={{ flex: 1, minWidth: "160px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "5px" }}>
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#fff" }}>
                            {test.title || test.topic || test.category || "Mock Test"}
                        </span>
                        <span style={{
                            fontSize: "10px", padding: "2px 9px", borderRadius: "20px",
                            background: diffStyle.bg, border: `1px solid ${diffStyle.border}`,
                            color: diffStyle.text, fontWeight: "700", textTransform: "uppercase"
                        }}>{diff}</span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                        {test.category && (
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,.4)" }}>📂 {test.category}</span>
                        )}
                        {test.topic && test.topic !== test.category && (
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,.4)" }}>🏷 {test.topic}</span>
                        )}
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,.3)" }}>🕒 {formatDate(test.completedAt)}</span>
                    </div>
                </div>

                {/* Right stats */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <StatBadge label="Score" value={`${test.score ?? 0}/${test.totalQuestions ?? "?"}`} color="#00F0C8" />
                    {test.duration && <StatBadge label="Time" value={formatDuration(test.duration)} color="#a78bfa" />}
                    <div style={{
                        padding: "6px 14px", borderRadius: "20px",
                        background: `rgba(${rgbScore},.12)`,
                        border: `1px solid rgba(${rgbScore},.3)`,
                        color: getScoreColor(pct), fontSize: "11px", fontWeight: "700"
                    }}>
                        {getScoreLabel(pct)}
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            padding: "7px 14px", borderRadius: "10px",
                            background: "rgba(0,240,200,.1)", border: "1px solid rgba(0,240,200,.25)",
                            color: "#00F0C8", fontSize: "12px", fontWeight: "600",
                            cursor: "pointer", transition: "background .2s"
                        }}
                        onMouseEnter={e => e.target.style.background = "rgba(0,240,200,.22)"}
                        onMouseLeave={e => e.target.style.background = "rgba(0,240,200,.1)"}
                    >
                        {expanded ? "Hide ▲" : "Details ▼"}
                    </button>
                </div>
            </div>

            {/* ── Expanded Detail ────────────────────────────────────────────── */}
            {expanded && (
                <div style={{ borderTop: "1px solid rgba(0,240,200,.1)", padding: "18px 22px", background: "rgba(0,0,0,.15)" }}>

                    {/* Score bar */}
                    <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,.5)" }}>Score Breakdown</span>
                            <span style={{ fontSize: "12px", color: getScoreColor(pct), fontWeight: "700" }}>{Math.round(pct)}%</span>
                        </div>
                        <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: `${pct}%`, borderRadius: "99px",
                                background: `linear-gradient(90deg, ${getScoreColor(pct)}, #0099FF)`,
                                transition: "width 1s ease"
                            }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>✅ Correct: {test.score ?? 0}</span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>❌ Wrong: {(test.totalQuestions ?? 0) - (test.score ?? 0)}</span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>Total: {test.totalQuestions ?? "?"}Q</span>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "18px" }}>
                        {[
                            { label: "Category",   value: test.category   || "—" },
                            { label: "Topic",      value: test.topic      || "—" },
                            { label: "Difficulty", value: test.difficulty || "—" },
                            { label: "Duration",   value: test.duration ? formatDuration(test.duration) : "—" },
                            { label: "Test ID",    value: `#${test.id}` },
                            { label: "Completed",  value: test.completedAt ? new Date(test.completedAt).toLocaleDateString("en-IN") : "—" },
                        ].map(({ label, value }) => (
                            <div key={label} style={{
                                padding: "10px 12px", borderRadius: "10px",
                                background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)"
                            }}>
                                <div style={{ fontSize: "10px", color: "rgba(255,255,255,.35)", marginBottom: "3px", textTransform: "uppercase" }}>{label}</div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{value}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Download Certificate Button ─────────────────────────── */}
                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,.06)",
                        paddingTop: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>🏆</span>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>Achievement Certificate</div>
                                <div style={{ fontSize: "11px", color: "rgba(255,255,255,.35)", marginTop: "1px" }}>
                                    {pct >= 60
                                        ? "You're eligible to download your certificate"
                                        : "Score ≥ 60% to unlock your certificate"}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={pct >= 60 ? handleDownloadCertificate : undefined}
                            disabled={pct < 60}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "10px 22px", borderRadius: "12px", cursor: pct >= 60 ? "pointer" : "not-allowed",
                                fontWeight: "700", fontSize: "13px",
                                border: "none",
                                background: pct >= 60
                                    ? "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)"
                                    : "rgba(255,255,255,.08)",
                                color: pct >= 60 ? "#1a0a00" : "rgba(255,255,255,.3)",
                                boxShadow: pct >= 60
                                    ? "0 0 18px rgba(255,215,0,.35), 0 4px 12px rgba(0,0,0,.4)"
                                    : "none",
                                transition: "all .25s",
                                opacity: pct < 60 ? 0.5 : 1,
                            }}
                            onMouseEnter={e => {
                                if (pct >= 60) {
                                    e.currentTarget.style.boxShadow = "0 0 28px rgba(255,215,0,.55), 0 6px 18px rgba(0,0,0,.5)";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (pct >= 60) {
                                    e.currentTarget.style.boxShadow = "0 0 18px rgba(255,215,0,.35), 0 4px 12px rgba(0,0,0,.4)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>🎓</span>
                            Download Certificate
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}

export default function PreviousMockTests() {
    const navigate = useNavigate();
    const [tests, setTests]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);
    const [filter, setFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("date");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        fetchHistory(token);
    }, [navigate]);

    const fetchHistory = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/mocktest/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const raw = Array.isArray(res.data) ? res.data : [];
            // ── Remove duplicates with composite fingerprint ─────────────────
            setTests(deduplicateTests(raw));
        } catch (err) {
            setError("Failed to load test history.");
        } finally {
            setLoading(false);
        }
    };

    const categories = ["ALL", ...new Set(tests.map(t => t.category).filter(Boolean))];

    const filtered = tests
        .filter(t => filter === "ALL" || t.category === filter)
        .sort((a, b) => {
            if (sortBy === "date")       return new Date(b.completedAt) - new Date(a.completedAt);
            if (sortBy === "score")      return (b.percentage ?? 0) - (a.percentage ?? 0);
            if (sortBy === "difficulty") return (a.difficulty || "").localeCompare(b.difficulty || "");
            return 0;
        });

    const avgPct = tests.length
        ? Math.round(tests.reduce((s, t) => s + (t.percentage ?? 0), 0) / tests.length) : 0;
    const best = tests.length
        ? Math.round(Math.max(...tests.map(t => t.percentage ?? 0))) : 0;

    return (
        <div style={{ minHeight: "100vh", background: BG, padding: "36px 24px", color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ maxWidth: "960px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}
                        >← Back to Dashboard</button>
                        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800", background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Previous Mock Tests
                        </h1>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,.35)" }}>
                            Your complete test history &amp; performance
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/mock-test")}
                        style={{
                            padding: "10px 22px", borderRadius: "12px",
                            background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                            border: "none", color: "#020B18", fontWeight: "800",
                            fontSize: "13px", cursor: "pointer"
                        }}
                    >+ New Test</button>
                </div>

                {/* Summary cards */}
                {tests.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                        {[
                            { label: "Total Tests",  value: tests.length,            color: "#00F0C8" },
                            { label: "Avg Score",    value: `${avgPct}%`,             color: getScoreColor(avgPct) },
                            { label: "Best Score",   value: `${best}%`,               color: getScoreColor(best) },
                            { label: "Categories",   value: categories.length - 1,    color: "#a78bfa" },
                        ].map(s => (
                            <div key={s.label} style={{
                                padding: "16px", borderRadius: "14px",
                                background: "rgba(255,255,255,.05)", border: "1px solid rgba(0,240,200,.12)",
                                textAlign: "center"
                            }}>
                                <div style={{ fontSize: "26px", fontWeight: "800", color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: "11px", color: "rgba(255,255,255,.4)", marginTop: "4px", textTransform: "uppercase" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters + Sort */}
                {tests.length > 0 && (
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setFilter(cat)} style={{
                                    padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                                    fontWeight: "600", cursor: "pointer", transition: "all .2s",
                                    background: filter === cat ? "linear-gradient(135deg,#00F0C8,#0099FF)" : "rgba(255,255,255,.06)",
                                    border: filter === cat ? "none" : "1px solid rgba(255,255,255,.1)",
                                    color: filter === cat ? "#020B18" : "rgba(255,255,255,.6)"
                                }}>{cat}</button>
                            ))}
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,.35)" }}>Sort:</span>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                style={{
                                    padding: "6px 10px", borderRadius: "8px", fontSize: "12px",
                                    background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
                                    color: "#fff", cursor: "pointer", outline: "none"
                                }}
                            >
                                <option value="date">Latest First</option>
                                <option value="score">Highest Score</option>
                                <option value="difficulty">Difficulty</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
                        <p style={{ color: "rgba(255,255,255,.3)", fontSize: "14px" }}>Loading your test history...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>❌</div>
                        <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
                    </div>
                ) : tests.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "72px 0" }}>
                        <div style={{ fontSize: "48px", marginBottom: "14px" }}>📝</div>
                        <h3 style={{ color: "rgba(255,255,255,.6)", fontWeight: "600", marginBottom: "8px" }}>No tests yet</h3>
                        <p style={{ color: "rgba(255,255,255,.3)", fontSize: "13px", marginBottom: "20px" }}>Take your first mock test to see results here</p>
                        <button onClick={() => navigate("/mock-test")} style={{
                            padding: "11px 26px", borderRadius: "12px",
                            background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                            border: "none", color: "#020B18", fontWeight: "800",
                            fontSize: "14px", cursor: "pointer"
                        }}>Start Now 🚀</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.3)", fontSize: "14px" }}>
                        No tests found for "{filter}"
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {filtered.map((test, i) => (
                            <TestCard key={`${test.id}-${test.completedAt}`} test={test} index={i} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}