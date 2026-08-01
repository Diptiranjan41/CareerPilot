import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const API_URL = "http://localhost:8080/api";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [recentTests, setRecentTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testsLoading, setTestsLoading] = useState(true);
    const [showAllJobs, setShowAllJobs] = useState(false);
    const [userStats, setUserStats] = useState({
        testsTaken: 0,
        avgScore: 0,
        bestScore: 0,
        rank: null
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (!token) { navigate("/login"); return; }
        if (userData) setUser(JSON.parse(userData));
        fetchSavedJobs();
        fetchUserStats();
        fetchRecentTests();
    }, [navigate]);

    const fetchSavedJobs = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/career/saved-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedJobs(response.data);
        } catch (err) {
            console.error("Error fetching saved jobs:", err);
            setSavedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/mocktest/user/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = response.data;
            setUserStats({ testsTaken: d.totalTests ?? 0, avgScore: d.avgScore ?? 0, bestScore: d.bestScore ?? 0, rank: d.rank ?? null });
        } catch (err) {
            console.error("Error fetching user stats:", err);
        }
    };

    const fetchRecentTests = async () => {
        try {
            const token = localStorage.getItem("token");
            // Backend endpoint: GET /api/mocktest/history — returns List<MockTestResponse> directly
            const response = await axios.get(`${API_URL}/mocktest/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns array directly, not wrapped in {success, data}
            setRecentTests(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching recent tests:", err);
            setRecentTests([]);
        } finally {
            setTestsLoading(false);
        }
    };

    const handleRemoveJob = async (careerId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/career/saved-jobs/${careerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedJobs(prev => prev.filter(job => job.id !== careerId));
            toast.success("Job removed from saved list");
        } catch (err) {
            console.error("Error removing job:", err);
            toast.error("Failed to remove job");
        }
    };

    const handleViewPath = (career) => {
        navigate(`/career-path/${career.id}`, { state: { career } });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully!");
        navigate("/login");
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "#00F0C8";
        if (score >= 60) return "#FBBF24";
        return "#EF4444";
    };

    const displayedJobs = showAllJobs ? savedJobs : savedJobs.slice(0, 2);

    return (
        <div style={{ minHeight: "100vh", background: BG, padding: "36px 24px", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: "700", background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                            Welcome back, {user?.fullName || user?.name || "User"}! 👋
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => navigate('/leaderboard')} style={btnStyle("#00F0C8", "rgba(0,240,200,.15)", "rgba(0,240,200,.3)")}>
                            🏆 Leaderboard
                        </button>
                        <button onClick={handleLogout} style={btnStyle("#ef4444", "rgba(239,68,68,.2)", "rgba(239,68,68,.3)")}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                    {[
                        { label: "Tests Taken", value: userStats.testsTaken, suffix: "" },
                        { label: "Avg Score", value: userStats.avgScore, suffix: "%" },
                        { label: "Best Score", value: userStats.bestScore, suffix: "%" },
                        ...(userStats.rank ? [{ label: "Global Rank", value: `#${userStats.rank}`, suffix: "" }] : [])
                    ].map((stat, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,.05)", borderRadius: "14px", padding: "20px 18px", border: "1px solid rgba(0,240,200,.15)", textAlign: "center" }}>
                            <div style={{ fontSize: "30px", fontWeight: "800", color: "#00F0C8", lineHeight: 1 }}>
                                {stat.value}{stat.suffix}
                            </div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.45)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "22px" }}>

                    {/* Career Recommendations */}
                    <Link to="/career-recommendations" style={cardLinkStyle()}>
                        <div style={{ fontSize: "38px", marginBottom: "12px" }}>🎯</div>
                        <h3 style={cardTitleStyle()}>Career Recommendations</h3>
                        <p style={cardDescStyle()}>Get AI-powered career suggestions based on your skills and interests</p>
                        <div style={{ marginTop: "16px" }}>
                            <span style={pillStyle()}>Explore Careers →</span>
                        </div>
                    </Link>

                    {/* Mock Test */}
                    <Link to="/mock-test" style={cardLinkStyle()}>
                        <div style={{ fontSize: "38px", marginBottom: "12px" }}>📝</div>
                        <h3 style={cardTitleStyle()}>Mock Tests</h3>
                        <p style={cardDescStyle()}>Practice with AI-powered mock tests and improve your score</p>
                        <div style={{ marginTop: "16px" }}>
                            <span style={pillStyle()}>Start Test →</span>
                        </div>
                    </Link>

                    {/* Previous Mock Test Results */}
                   {/* Previous Mock Test Results */}
<div style={cardStyle()}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
            <div style={{ fontSize: "30px" }}>📊</div>
            <h3 style={{ ...cardTitleStyle(), marginTop: "8px" }}>Previous Mock Tests</h3>
        </div>
        <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(0,240,200,.1)", color: "#00F0C8" }}>
            {recentTests.length} taken
        </span>
    </div>

    {testsLoading ? (
        <p style={{ color: "rgba(255,255,255,.3)", fontSize: "13px" }}>Loading...</p>
    ) : recentTests.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,.3)", fontSize: "13px" }}>No tests taken yet. Go to Mock Tests to get started!</p>
    ) : (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentTests.slice(0, 2).map((test, i) => (
                    <div key={test.id || i} style={{
                        padding: "12px",
                        background: "rgba(255,255,255,.03)",
                        borderRadius: "12px",
                        border: "1px solid rgba(0,240,200,.1)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "18px" }}>📝</span>
                                <span style={{ fontWeight: "600", fontSize: "13px" }}>{test.topic || test.category || "Mock Test"}</span>
                            </div>
                            <div style={{ fontSize: "20px", fontWeight: "800", color: getScoreColor(test.score) }}>{test.score}%</div>
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,.35)", marginBottom: "8px" }}>
                            {(test.completedAt || test.createdAt || test.date)
                                ? new Date(test.completedAt || test.createdAt || test.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : ""}
                            {(test.totalQuestions || test.numberOfQuestions)
                                ? ` · ${test.totalQuestions || test.numberOfQuestions}Q`
                                : ""}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => navigate(`/mock-test/history`)} style={{
                                flex: 1, padding: "6px 10px", fontSize: "11px", fontWeight: "600",
                                borderRadius: "8px", background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                                border: "none", color: "#020B18", cursor: "pointer"
                            }}>View Details →</button>
                        </div>
                    </div>
                ))}
            </div>

            {recentTests.length > 2 && (
                <button
                    onClick={() => navigate("/mock-test/history")}
                    style={{
                        width: "100%", marginTop: "12px", padding: "9px",
                        fontSize: "12px", fontWeight: "600",
                        borderRadius: "10px", background: "rgba(0,240,200,.08)",
                        border: "1px solid rgba(0,240,200,.2)", color: "#00F0C8",
                        cursor: "pointer", transition: "all .2s"
                    }}
                    onMouseEnter={e => e.target.style.background = "rgba(0,240,200,.18)"}
                    onMouseLeave={e => e.target.style.background = "rgba(0,240,200,.08)"}
                >
                    View all {recentTests.length} test results →
                </button>
            )}
        </>
    )}
</div>
                    {/* Saved Jobs */}
                    <div style={cardStyle()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <div>
                                <div style={{ fontSize: "30px" }}>💼</div>
                                <h3 style={{ ...cardTitleStyle(), marginTop: "8px" }}>Saved Jobs</h3>
                            </div>
                            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(0,240,200,.1)", color: "#00F0C8" }}>
                                {savedJobs.length} saved
                            </span>
                        </div>

                        {loading ? (
                            <p style={{ color: "rgba(255,255,255,.3)", fontSize: "13px" }}>Loading...</p>
                        ) : savedJobs.length === 0 ? (
                            <p style={{ color: "rgba(255,255,255,.3)", fontSize: "13px" }}>No saved jobs yet. Go to Career Recommendations to save some!</p>
                        ) : (
                            <>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {displayedJobs.map((job) => (
                                        <div key={job.id} style={{
                                            padding: "12px",
                                            background: "rgba(255,255,255,.03)",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(0,240,200,.1)"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ fontSize: "18px" }}>{job.icon || getIconForDomain(job.domain)}</span>
                                                    <span style={{ fontWeight: "600", fontSize: "13px" }}>{job.title}</span>
                                                </div>
                                                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "12px", background: "rgba(0,240,200,.1)", color: "#00F0C8" }}>
                                                    {job.matchScore || 85}% Match
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,.35)", marginBottom: "8px" }}>{job.domain}</div>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button onClick={() => handleViewPath(job)} style={{
                                                    flex: 1, padding: "6px 10px", fontSize: "11px", fontWeight: "600",
                                                    borderRadius: "8px", background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                                                    border: "none", color: "#020B18", cursor: "pointer"
                                                }}>View Path →</button>
                                                <button onClick={() => handleRemoveJob(job.id)} style={{
                                                    padding: "6px 10px", fontSize: "11px", fontWeight: "600",
                                                    borderRadius: "8px", background: "rgba(239,68,68,.2)",
                                                    border: "1px solid rgba(239,68,68,.3)", color: "#ef4444", cursor: "pointer"
                                                }}>Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {savedJobs.length > 2 && (
                                    <button
                                        onClick={() => navigate("/saved-jobs")}
                                        style={{
                                            width: "100%", marginTop: "12px", padding: "9px",
                                            fontSize: "12px", fontWeight: "600",
                                            borderRadius: "10px", background: "rgba(0,240,200,.08)",
                                            border: "1px solid rgba(0,240,200,.2)", color: "#00F0C8",
                                            cursor: "pointer", transition: "all .2s"
                                        }}
                                        onMouseEnter={e => e.target.style.background = "rgba(0,240,200,.18)"}
                                        onMouseLeave={e => e.target.style.background = "rgba(0,240,200,.08)"}
                                    >
                                        View all {savedJobs.length} saved jobs →
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

// Style helpers
const cardStyle = () => ({
    background: "rgba(255,255,255,.05)",
    borderRadius: "16px",
    padding: "22px",
    border: "1px solid rgba(0,240,200,.15)"
});

const cardLinkStyle = () => ({
    ...cardStyle(),
    textDecoration: "none",
    display: "block",
    transition: "transform .25s, border-color .25s",
    cursor: "pointer"
});

const cardTitleStyle = () => ({
    fontSize: "17px",
    fontWeight: "700",
    color: "white",
    margin: 0
});

const cardDescStyle = () => ({
    color: "rgba(255,255,255,.4)",
    fontSize: "13px",
    marginTop: "6px",
    lineHeight: "1.5"
});

const pillStyle = () => ({
    fontSize: "12px",
    padding: "5px 14px",
    borderRadius: "20px",
    background: "rgba(0,240,200,.1)",
    color: "#00F0C8",
    display: "inline-block"
});

const btnStyle = (color, bg, border) => ({
    padding: "9px 18px",
    borderRadius: "10px",
    background: bg,
    border: `1px solid ${border}`,
    color: color,
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px"
});

function getIconForDomain(domain) {
    const icons = {
        "AI/ML": "🤖", "Data Science": "📊", "Software Development": "💻",
        "Cloud Computing": "☁️", "Cybersecurity": "🔒", "DevOps": "🚀",
        "UI/UX Design": "🎨", "Product Management": "📱"
    };
    return icons[domain] || "💼";
}