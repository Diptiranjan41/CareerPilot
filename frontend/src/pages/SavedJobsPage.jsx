// src/pages/SavedJobsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const CARD = "linear-gradient(145deg,rgba(0,240,200,.06),rgba(0,153,255,.03))";
const API_URL = "http://localhost:8080/api";

export default function SavedJobsPage() {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }
        fetchSavedJobs();
    }, [navigate]);

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/career/saved-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedJobs(response.data);
            console.log("Saved jobs:", response.data);
        } catch (err) {
            console.error("Error fetching saved jobs:", err);
            toast.error("Failed to load saved jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveJob = async (careerId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/career/saved-jobs/${careerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedJobs(savedJobs.filter(job => job.id !== careerId));
            toast.success("Job removed from saved list");
        } catch (err) {
            console.error("Error removing job:", err);
            toast.error("Failed to remove job");
        }
    };

    const handleViewPath = (career) => {
        navigate(`/career-path/${career.id}`, { state: { career } });
    };

    const getFilteredJobs = () => {
        if (filter === "all") return savedJobs;
        return savedJobs.filter(job => job.domain === filter);
    };

    const domains = [...new Set(savedJobs.map(job => job.domain))];

    return (
        <div style={{ background: BG, minHeight: "100vh", padding: "40px 24px", color: "white" }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .job-card {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>

            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <Link to="/dashboard" style={{ color: "rgba(0,240,200,.8)", textDecoration: "none", fontSize: "14px", display: "inline-block", marginBottom: "12px" }}>
                            ← Back to Dashboard
                        </Link>
                        <h1 style={{ fontSize: "36px", fontWeight: "900", background: "linear-gradient(90deg,#00F0C8,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Saved Jobs
                        </h1>
                        <p style={{ color: "rgba(255,255,255,.4)", marginTop: "8px" }}>
                            {savedJobs.length} saved career {savedJobs.length !== 1 ? 'paths' : 'path'}
                        </p>
                    </div>
                    <button
                        onClick={fetchSavedJobs}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "10px",
                            background: "rgba(0,240,200,.1)",
                            border: "1px solid rgba(0,240,200,.3)",
                            color: "#00F0C8",
                            cursor: "pointer",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Filter Buttons */}
                {domains.length > 0 && (
                    <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
                        <button
                            onClick={() => setFilter("all")}
                            style={{
                                padding: "8px 20px",
                                borderRadius: "20px",
                                background: filter === "all" ? "linear-gradient(135deg,#00F0C8,#0099FF)" : "rgba(255,255,255,.05)",
                                border: filter === "all" ? "none" : "1px solid rgba(0,240,200,.2)",
                                color: filter === "all" ? "#020B18" : "rgba(255,255,255,.7)",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "13px"
                            }}
                        >
                            All ({savedJobs.length})
                        </button>
                        {domains.map(domain => (
                            <button
                                key={domain}
                                onClick={() => setFilter(domain)}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: "20px",
                                    background: filter === domain ? "linear-gradient(135deg,#00F0C8,#0099FF)" : "rgba(255,255,255,.05)",
                                    border: filter === domain ? "none" : "1px solid rgba(0,240,200,.2)",
                                    color: filter === domain ? "#020B18" : "rgba(255,255,255,.7)",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "13px"
                                }}
                            >
                                {domain} ({savedJobs.filter(j => j.domain === domain).length})
                            </button>
                        ))}
                    </div>
                )}

                {/* Saved Jobs List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px" }}>
                        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(0,240,200,.2)", borderTopColor: "#00F0C8", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
                        <p>Loading saved jobs...</p>
                    </div>
                ) : getFilteredJobs().length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px",
                        background: "rgba(255,255,255,.03)",
                        borderRadius: "20px",
                        border: "1px solid rgba(0,240,200,.1)"
                    }}>
                        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📭</div>
                        <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>No saved jobs yet</h3>
                        <p style={{ color: "rgba(255,255,255,.5)", marginBottom: "24px" }}>
                            Save career recommendations to see them here
                        </p>
                        <Link to="/career-recommendations" style={{
                            padding: "12px 24px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                            color: "#020B18",
                            textDecoration: "none",
                            fontWeight: "600",
                            display: "inline-block"
                        }}>
                            Explore Careers →
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "20px" }}>
                        {getFilteredJobs().map((job, index) => (
                            <div key={job.id} className="job-card" style={{
                                background: CARD,
                                border: "1px solid rgba(0,240,200,.13)",
                                borderRadius: "16px",
                                padding: "24px",
                                transition: "all .3s",
                                animationDelay: `${index * 0.05}s`
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        <div style={{ fontSize: "48px" }}>{job.icon || getIconForDomain(job.domain)}</div>
                                        <div>
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                                                <span style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "20px",
                                                    background: "rgba(0,240,200,.15)",
                                                    color: "#00F0C8",
                                                    fontSize: "11px",
                                                    fontWeight: "600"
                                                }}>
                                                    {job.domain}
                                                </span>
                                                <span style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "20px",
                                                    background: "rgba(153,255,0,.15)",
                                                    color: "#99FF00",
                                                    fontSize: "11px",
                                                    fontWeight: "600"
                                                }}>
                                                    {job.matchScore || 85}% Match
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>{job.title}</h3>
                                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: "13px", maxWidth: "500px" }}>
                                                {job.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button
                                            onClick={() => handleViewPath(job)}
                                            style={{
                                                padding: "10px 20px",
                                                borderRadius: "10px",
                                                background: "linear-gradient(135deg,#00F0C8,#0099FF)",
                                                border: "none",
                                                color: "#020B18",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                fontSize: "13px"
                                            }}
                                        >
                                            View Path →
                                        </button>
                                        <button
                                            onClick={() => handleRemoveJob(job.id)}
                                            style={{
                                                padding: "10px 20px",
                                                borderRadius: "10px",
                                                background: "rgba(239,68,68,.15)",
                                                border: "1px solid rgba(239,68,68,.3)",
                                                color: "#ef4444",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                fontSize: "13px"
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Skills Section */}
                                {job.skills && job.skills.length > 0 && (
                                    <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(0,240,200,.1)" }}>
                                        <div style={{ fontSize: "12px", color: "rgba(0,240,200,.6)", marginBottom: "8px" }}>Key Skills</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {job.skills.slice(0, 6).map((skill, i) => (
                                                <span key={i} style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "16px",
                                                    background: "rgba(0,240,200,.08)",
                                                    fontSize: "11px",
                                                    color: "rgba(0,240,200,.8)"
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills.length > 6 && (
                                                <span style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "16px",
                                                    background: "rgba(255,255,255,.05)",
                                                    fontSize: "11px",
                                                    color: "rgba(255,255,255,.5)"
                                                }}>
                                                    +{job.skills.length - 6} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Salary & Growth */}
                                <div style={{ marginTop: "16px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,.4)" }}>💰 Salary Range</div>
                                        <div style={{ fontSize: "14px", fontWeight: "600" }}>{job.salaryRange || "Competitive"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,.4)" }}>📈 Growth Rate</div>
                                        <div style={{ fontSize: "14px", fontWeight: "600" }}>{job.growthRate || "High Demand"}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function getIconForDomain(domain) {
    const icons = {
        "AI/ML": "🤖",
        "Data Science": "📊",
        "Software Development": "💻",
        "Cloud Computing": "☁️",
        "Cybersecurity": "🔒",
        "DevOps": "🚀",
        "UI/UX Design": "🎨",
        "Product Management": "📱"
    };
    return icons[domain] || "💼";
}