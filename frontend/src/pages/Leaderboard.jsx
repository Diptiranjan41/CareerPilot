import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Axios with token helper
const getToken = () => localStorage.getItem("token");
const authAxios = {
  get: (url, config = {}) => {
    const t = getToken();
    return axios.get(url, {
      ...config,
      headers: { ...(config.headers || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    });
  },
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeFrame, setTimeFrame] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    highestScore: 0,
    averageScore: 0
  });

  const categories = [
    { id: "all", name: "All Categories", icon: "🏆" },
    { id: "aptitude", name: "Aptitude", icon: "🧠" },
    { id: "reasoning", name: "Reasoning", icon: "🔍" },
    { id: "verbal", name: "Verbal Ability", icon: "📖" },
    { id: "technical", name: "Technical", icon: "💻" },
    { id: "coding", name: "Coding", icon: "⚡" }
  ];

  const timeFrames = [
    { id: "all", name: "All Time", icon: "📅" },
    { id: "week", name: "This Week", icon: "📊" },
    { id: "month", name: "This Month", icon: "📈" },
    { id: "year", name: "This Year", icon: "🎯" }
  ];

  useEffect(() => {
    fetchCurrentUser();
    fetchLeaderboard();
  }, [selectedCategory, timeFrame, currentPage]);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAxios.get(`${API_URL}/auth/current-user`);
      if (response.data && response.data.user) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        category: selectedCategory,
        timeFrame: timeFrame,
        page: currentPage,
        limit: 20 // 20 students per page
      });
      
      const response = await authAxios.get(`${API_URL}/leaderboard?${params}`);
      
      if (response.data.success) {
        const data = response.data.data?.global || [];
        setLeaderboardData(data);
        setUserRank(response.data.userRank);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.totalCount || 0) / 20));
        
        if (data.length > 0) {
          const totalScore = data.reduce((sum, item) => sum + (item.percentage || 0), 0);
          setStats({
            totalParticipants: response.data.totalCount || data.length,
            highestScore: Math.max(...data.map(item => item.percentage || 0)),
            averageScore: Math.round(totalScore / data.length)
          });
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to view leaderboard");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch(rank) {
      case 1: return { icon: "👑", color: "#FFD700", bg: "linear-gradient(135deg, #FFD700, #FFA500)" };
      case 2: return { icon: "🥈", color: "#C0C0C0", bg: "linear-gradient(135deg, #C0C0C0, #A8A8A8)" };
      case 3: return { icon: "🥉", color: "#CD7F32", bg: "linear-gradient(135deg, #CD7F32, #B8860B)" };
      default: return { icon: "📌", color: "#00F0C8", bg: "linear-gradient(135deg, #00F0C8, #0099FF)" };
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("data:image")) {
      return imagePath;
    }
    return `${API_URL.replace("/api", "")}${imagePath}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020B18 0%, #0A2240 50%, #130A2E 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, border: "3px solid #00F0C8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: "#00F0C8", fontSize: 16 }}>Loading leaderboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remainingRankings = leaderboardData.slice(3);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020B18 0%, #0A2240 50%, #130A2E 100%)",
      padding: "40px 24px"
    }}>
      <style>{`
        .glass-card {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 240, 200, 0.15);
        }
        .hover-glow:hover {
          background: rgba(0, 240, 200, 0.05);
          transition: all 0.3s ease;
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="glass-card" style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: "50px",
            marginBottom: 20
          }}>
            <span style={{ fontSize: 14, color: "#00F0C8", fontWeight: 600 }}>🏆 COMPETITION LEADERBOARD</span>
          </div>
          <h1 style={{
            fontSize: 56,
            fontWeight: 800,
            background: "linear-gradient(135deg, #00F0C8, #0099FF, #A855F7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12
          }}>
            Global Rankings
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>
            Top performers from around the world
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 48
        }}>
          <div className="glass-card" style={{
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#00F0C8" }}>{stats.totalParticipants}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Total Participants</div>
          </div>
          <div className="glass-card" style={{
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#FFD700" }}>{stats.highestScore}%</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Highest Score</div>
          </div>
          <div className="glass-card" style={{
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#00F0C8" }}>{stats.averageScore}%</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Average Score</div>
          </div>
        </div>

        {/* Top 3 Podium with Profile Images */}
        {topThree.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: 30,
            marginBottom: 60,
            flexWrap: "wrap"
          }}>
            {/* 2nd Place */}
            {topThree[1] && (
              <div style={{ textAlign: "center", order: 1 }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C0C0C0, #E8E8E8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  position: "relative",
                  overflow: "hidden",
                  border: "3px solid #C0C0C0"
                }}>
                  {topThree[1].profileImage ? (
                    <img 
                      src={getFullImageUrl(topThree[1].profileImage)} 
                      alt={topThree[1].name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: getRandomColor(topThree[1].name),
                      fontSize: 42,
                      fontWeight: "bold",
                      color: "#FFF"
                    }}>
                      {getInitials(topThree[1].name)}
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    background: "#C0C0C0",
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#020B18",
                    border: "2px solid #FFF"
                  }}>
                    2
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>{topThree[1].name}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#C0C0C0" }}>{topThree[1].percentage}%</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>2nd Place</div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div style={{ textAlign: "center", order: 2, transform: "translateY(-30px)" }}>
                <div style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  boxShadow: "0 15px 40px rgba(255,215,0,0.3)",
                  position: "relative",
                  overflow: "hidden",
                  border: "3px solid #FFD700"
                }}>
                  {topThree[0].profileImage ? (
                    <img 
                      src={getFullImageUrl(topThree[0].profileImage)} 
                      alt={topThree[0].name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: getRandomColor(topThree[0].name),
                      fontSize: 52,
                      fontWeight: "bold",
                      color: "#FFF"
                    }}>
                      {getInitials(topThree[0].name)}
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    background: "#FFD700",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#020B18",
                    border: "2px solid #FFF"
                  }}>
                    1
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF", marginBottom: 4 }}>{topThree[0].name}</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#FFD700" }}>{topThree[0].percentage}%</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>1st Place</div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div style={{ textAlign: "center", order: 3 }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #CD7F32, #E8A84C)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  position: "relative",
                  overflow: "hidden",
                  border: "3px solid #CD7F32"
                }}>
                  {topThree[2].profileImage ? (
                    <img 
                      src={getFullImageUrl(topThree[2].profileImage)} 
                      alt={topThree[2].name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: getRandomColor(topThree[2].name),
                      fontSize: 42,
                      fontWeight: "bold",
                      color: "#FFF"
                    }}>
                      {getInitials(topThree[2].name)}
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    background: "#CD7F32",
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#020B18",
                    border: "2px solid #FFF"
                  }}>
                    3
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>{topThree[2].name}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#CD7F32" }}>{topThree[2].percentage}%</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>3rd Place</div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 32,
          padding: "16px 20px",
          borderRadius: "16px"
        }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "8px 18px",
                  background: selectedCategory === cat.id ? "linear-gradient(135deg, #00F0C8, #0099FF)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "25px",
                  color: selectedCategory === cat.id ? "#020B18" : "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {timeFrames.map(tf => (
              <button
                key={tf.id}
                onClick={() => {
                  setTimeFrame(tf.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "8px 18px",
                  background: timeFrame === tf.id ? "rgba(0,240,200,0.2)" : "transparent",
                  border: timeFrame === tf.id ? "1px solid #00F0C8" : "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "25px",
                  color: timeFrame === tf.id ? "#00F0C8" : "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                {tf.icon} {tf.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboardData.length === 0 ? (
          <div className="glass-card" style={{
            borderRadius: "20px",
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <h3 style={{ color: "#FFF", marginBottom: 8, fontSize: 24 }}>No Data Available</h3>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>
              {selectedCategory !== "all" 
                ? `No results found for ${categories.find(c => c.id === selectedCategory)?.name} category.`
                : "Take a mock test to get on the leaderboard!"}
            </p>
          </div>
        ) : (
          <>
            <div className="glass-card" style={{
              borderRadius: "20px",
              overflow: "hidden",
              overflowX: "auto"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                <thead>
                  <tr style={{
                    borderBottom: "1px solid rgba(0,240,200,0.1)",
                    background: "rgba(0,240,200,0.05)"
                  }}>
                    <th style={{ padding: "18px 20px", textAlign: "left", color: "#00F0C8", fontSize: 13, fontWeight: 600 }}>RANK</th>
                    <th style={{ padding: "18px 20px", textAlign: "left", color: "#00F0C8", fontSize: 13, fontWeight: 600 }}>STUDENT</th>
                    <th style={{ padding: "18px 20px", textAlign: "center", color: "#00F0C8", fontSize: 13, fontWeight: 600 }}>CATEGORY</th>
                    <th style={{ padding: "18px 20px", textAlign: "center", color: "#00F0C8", fontSize: 13, fontWeight: 600 }}>SCORE</th>
                    <th style={{ padding: "18px 20px", textAlign: "center", color: "#00F0C8", fontSize: 13, fontWeight: 600 }}>PERCENTAGE</th>
                    <th style={{ padding: "18px 20px", textAlign: "center", color: "#00F0C8", fontSize: 13, fontWeight: 600 }}>BADGE</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show all rankings including top 3 in table */}
                  {leaderboardData.map((entry, index) => {
                    const rankBadge = getRankBadge(entry.rank);
                    return (
                      <tr
                        key={index}
                        className="hover-glow"
                        style={{
                          borderBottom: index === leaderboardData.length - 1 ? "none" : "1px solid rgba(0,240,200,0.05)",
                          background: entry.isCurrentUser ? "rgba(0,240,200,0.1)" : "transparent",
                          transition: "background 0.2s"
                        }}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: rankBadge.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: entry.rank <= 3 ? 18 : 14,
                            color: entry.rank <= 3 ? "#020B18" : "#FFF"
                          }}>
                            {entry.rank}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              overflow: "hidden",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                              border: `2px solid ${entry.rank === 1 ? "#FFD700" : entry.rank === 2 ? "#C0C0C0" : entry.rank === 3 ? "#CD7F32" : "#00F0C8"}`
                            }}>
                              {entry.profileImage ? (
                                <img 
                                  src={getFullImageUrl(entry.profileImage)} 
                                  alt={entry.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    const parent = e.target.parentElement;
                                    parent.style.display = "flex";
                                    parent.style.alignItems = "center";
                                    parent.style.justifyContent = "center";
                                    parent.style.background = getRandomColor(entry.name);
                                    parent.style.fontSize = "18px";
                                    parent.style.fontWeight = "bold";
                                    parent.style.color = "#FFF";
                                    parent.textContent = getInitials(entry.name);
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: 18,
                                  color: "#FFF",
                                  background: getRandomColor(entry.name)
                                }}>
                                  {getInitials(entry.name)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#FFF", fontSize: 16 }}>{entry.name}</div>
                              {entry.isCurrentUser && (
                                <div style={{ fontSize: 11, color: "#00F0C8", marginTop: 2 }}>Current User</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            background: "rgba(0,240,200,0.1)",
                            color: "#00F0C8",
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {entry.category || "General"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                          {entry.score || 0}
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <div style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: entry.percentage >= 90 ? "rgba(255,215,0,0.2)" : "rgba(0,240,200,0.1)",
                            fontWeight: 700,
                            color: entry.percentage >= 90 ? "#FFD700" : "#00F0C8"
                          }}>
                            {entry.percentage || 0}%
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center", fontSize: 28 }}>
                          {rankBadge.icon}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                marginTop: 32,
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    background: currentPage === 1 ? "rgba(255,255,255,0.05)" : "rgba(0,240,200,0.1)",
                    border: "1px solid rgba(0,240,200,0.3)",
                    borderRadius: "8px",
                    color: currentPage === 1 ? "rgba(255,255,255,0.3)" : "#00F0C8",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                >
                  ← Previous
                </button>
                
                <div style={{ display: "flex", gap: 8 }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "8px",
                          background: currentPage === pageNum ? "linear-gradient(135deg, #00F0C8, #0099FF)" : "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(0,240,200,0.2)",
                          color: currentPage === pageNum ? "#020B18" : "#FFF",
                          cursor: "pointer",
                          fontWeight: currentPage === pageNum ? 700 : 400,
                          transition: "all 0.2s"
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    background: currentPage === totalPages ? "rgba(255,255,255,0.05)" : "rgba(0,240,200,0.1)",
                    border: "1px solid rgba(0,240,200,0.3)",
                    borderRadius: "8px",
                    color: currentPage === totalPages ? "rgba(255,255,255,0.3)" : "#00F0C8",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* User Rank Card */}
        {userRank && userRank.rank && (
          <div className="glass-card" style={{
            marginTop: 32,
            padding: "24px 32px",
            borderRadius: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #00F0C8",
                boxShadow: "0 2px 10px rgba(0,240,200,0.2)"
              }}>
                {currentUser?.avatar ? (
                  <img 
                    src={getFullImageUrl(currentUser.avatar)} 
                    alt={currentUser.fullName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const parent = e.target.parentElement;
                      parent.style.display = "flex";
                      parent.style.alignItems = "center";
                      parent.style.justifyContent = "center";
                      parent.style.background = "linear-gradient(135deg, #00F0C8, #0099FF)";
                      parent.style.fontSize = "32px";
                      parent.textContent = "🎯";
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #00F0C8, #0099FF)",
                    fontSize: 32
                  }}>
                    🎯
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Your Global Rank</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#00F0C8" }}>#{userRank.rank}</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Your Score</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#FFF" }}>{userRank.score || 0} points</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Your Percentage</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#00F0C8" }}>{userRank.percentage || 0}%</div>
            </div>
            <button
              onClick={() => navigate('/mock-test')}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #00F0C8, #0099FF)",
                border: "none",
                borderRadius: "12px",
                color: "#020B18",
                fontWeight: 700,
                cursor: "pointer",
                transition: "transform 0.2s",
                fontSize: 14
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Improve Your Rank 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}