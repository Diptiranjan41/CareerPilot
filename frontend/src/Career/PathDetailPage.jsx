// src/Career/PathDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BG = "linear-gradient(145deg,#020B18 0%,#051528 30%,#0A2240 55%,#0D1F3C 75%,#130A2E 100%)";
const CARD = "linear-gradient(145deg,rgba(0,240,200,.06),rgba(0,153,255,.03))";
const API_URL = "http://localhost:8080/api";

export default function PathDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [careerPath, setCareerPath] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    
    // Try to get career from location state first
    if (location.state?.career) {
      console.log("Career from location state:", location.state.career);
      const pathData = transformToPathFormat(location.state.career);
      setCareerPath(pathData);
      setLoading(false);
      return;
    }
    
    // Fallback: Fetch from backend API
    fetchCareerFromBackend(id);
  }, [id, navigate, location]);

  const fetchCareerFromBackend = async (careerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/career/path/${careerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCareerPath(response.data);
    } catch (err) {
      console.error("Error fetching career:", err);
      toast.error("Failed to load career path");
      navigate("/career-recommendations");
    } finally {
      setLoading(false);
    }
  };

  const transformToPathFormat = (career) => {
    return {
      id: career.id,
      title: career.title,
      description: career.description,
      domain: career.domain,
      salaryRange: career.salaryRange,
      growthRate: career.growthRate,
      matchScore: career.matchScore,
      skills: career.skills || [],
      learningPath: career.learningPath || [],
      timeline: "4-8 months",
      certifications: getCertificationsForDomain(career.domain),
      jobRoles: [`Junior ${career.title}`, career.title, `Senior ${career.title}`],
      milestones: generateMilestones(career)
    };
  };

  const generateMilestones = (career) => {
    if (career.learningPath && career.learningPath.length > 0) {
      return career.learningPath.map((step, index) => ({
        id: index + 1,
        title: step,
        description: `Complete ${step} with hands-on projects`,
        completed: false,
        estimatedTime: "2-3 months"
      }));
    }
    
    return [
      { id: 1, title: `Foundation in ${career.domain}`, description: `Learn core concepts`, completed: false, estimatedTime: "2-3 months" },
      { id: 2, title: `Master ${career.domain} Skills`, description: `Develop expertise`, completed: false, estimatedTime: "3-4 months" },
      { id: 3, title: "Build Projects", description: "Create portfolio", completed: false, estimatedTime: "2-3 months" },
      { id: 4, title: "Get Certified", description: "Earn certifications", completed: false, estimatedTime: "1-2 months" },
      { id: 5, title: "Job Preparation", description: "Start applying", completed: false, estimatedTime: "1-2 months" }
    ];
  };

  const getCertificationsForDomain = (domain) => {
    const certs = {
      "AI/ML": ["TensorFlow Developer Certificate", "AWS Machine Learning Specialty"],
      "Data Science": ["Microsoft Certified: Data Scientist", "Google Data Analytics"],
      "Software Development": ["AWS Developer Associate", "Oracle Java Certification"],
      "Cloud Computing": ["AWS Solutions Architect", "Google Cloud Engineer"],
      "Cybersecurity": ["CompTIA Security+", "CEH"],
      "DevOps": ["AWS DevOps Engineer", "Kubernetes Administrator"],
      "UI/UX Design": ["Google UX Design Certificate", "Adobe XD Certification"],
      "Product Management": ["Certified Product Manager", "Agile Certified Product Manager"]
    };
    return certs[domain] || [`Certified ${domain} Professional`];
  };

  const handleMarkComplete = async (milestoneId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/career/milestone/complete`,
        { careerId: careerPath.id, milestoneId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCareerPath(prev => ({
        ...prev,
        milestones: prev.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: true } : m
        )
      }));
      
      toast.success("Milestone completed! 🎉");
    } catch (err) {
      console.error("Failed to update milestone:", err);
      // Update locally even if backend fails
      setCareerPath(prev => ({
        ...prev,
        milestones: prev.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: true } : m
        )
      }));
      toast.success("Milestone marked locally!");
    }
  };

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(0,240,200,.2)", borderTopColor: "#00F0C8", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p>Loading career path...</p>
        </div>
      </div>
    );
  }

  if (!careerPath) return null;

  return (
    <div style={{ background: BG, minHeight: "100vh", padding: "40px 24px", color: "white" }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <button onClick={() => navigate("/career-recommendations")} style={{ marginBottom: 24, padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(0,240,200,.3)", background: "transparent", color: "rgba(0,240,200,.8)", cursor: "pointer" }}>
          ← Back to Recommendations
        </button>
        
        <div style={{ background: CARD, border: "1px solid rgba(0,240,200,.13)", borderRadius: 22, padding: 40, backdropFilter: "blur(24px)" }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "rgba(0,240,200,.15)", color: "#00F0C8", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
              {careerPath.domain}
            </span>
            <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 16 }}>{careerPath.title}</h1>
            <p style={{ color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>{careerPath.description}</p>
            
            <div style={{ display: "flex", gap: 20, marginTop: 20, padding: "16px 0", borderTop: "1px solid rgba(0,240,200,.1)", borderBottom: "1px solid rgba(0,240,200,.1)" }}>
              <div><div style={{ fontSize: 11, color: "rgba(0,240,200,.6)" }}>💰 Salary</div><div style={{ fontSize: 14, fontWeight: 600 }}>{careerPath.salaryRange}</div></div>
              <div><div style={{ fontSize: 11, color: "rgba(0,240,200,.6)" }}>📈 Growth</div><div style={{ fontSize: 14, fontWeight: 600 }}>{careerPath.growthRate}</div></div>
              <div><div style={{ fontSize: 11, color: "rgba(0,240,200,.6)" }}>⏱️ Timeline</div><div style={{ fontSize: 14, fontWeight: 600 }}>{careerPath.timeline}</div></div>
              <div><div style={{ fontSize: 11, color: "rgba(0,240,200,.6)" }}>🎯 Match</div><div style={{ fontSize: 14, fontWeight: 600, color: "#00F0C8" }}>{careerPath.matchScore}%</div></div>
            </div>
          </div>

          {/* Skills */}
          {careerPath.skills && careerPath.skills.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#00F0C8" }}>🎯 Key Skills</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {careerPath.skills.map((skill, i) => (
                  <span key={i} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(0,240,200,.08)", border: "1px solid rgba(0,240,200,.2)", fontSize: 13 }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#00F0C8" }}>📚 Learning Milestones</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {careerPath.milestones.map((milestone) => (
                <div key={milestone.id} style={{ padding: 20, background: "rgba(255,255,255,.03)", borderRadius: 12, border: `1px solid ${milestone.completed ? "rgba(0,240,200,.3)" : "rgba(0,240,200,.1)"}` }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div onClick={() => !milestone.completed && handleMarkComplete(milestone.id)} style={{ width: 28, height: 28, borderRadius: "50%", background: milestone.completed ? "#00F0C8" : "rgba(0,240,200,.1)", border: `2px solid ${milestone.completed ? "#00F0C8" : "rgba(0,240,200,.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: milestone.completed ? "default" : "pointer", flexShrink: 0 }}>
                      {milestone.completed && "✓"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, textDecoration: milestone.completed ? "line-through" : "none", opacity: milestone.completed ? 0.7 : 1 }}>{milestone.title}</h3>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)" }}>{milestone.description}</p>
                      <div style={{ marginTop: 8, fontSize: 12, color: "rgba(0,240,200,.6)" }}>⏱️ {milestone.estimatedTime}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {careerPath.certifications && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#00F0C8" }}>🎓 Recommended Certifications</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {careerPath.certifications.map((cert, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,.03)", borderRadius: 10, border: "1px solid rgba(0,240,200,.1)" }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{cert}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}