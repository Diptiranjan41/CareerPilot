import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function VerifyCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      verifyCertificate();
    } else {
      setError("Invalid certificate link");
      setLoading(false);
    }
  }, [id]);

  const verifyCertificate = async () => {
    try {
      const response = await axios.get(`${API_URL}/certificates/verify/${id}`);
      setCertificate(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.response?.data?.message || "Certificate not found or invalid");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ color: "white", fontSize: "20px" }}>Verifying certificate...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>❌</div>
          <h2 style={{ color: "#f44336", marginBottom: "10px" }}>Invalid Certificate</h2>
          <p style={{ color: "#666" }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: "20px",
              padding: "10px 30px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "50px",
        maxWidth: "600px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>✅</div>
        <h1 style={{ color: "#4caf50", marginBottom: "20px" }}>Valid Certificate!</h1>
        
        <div style={{ textAlign: "left", marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <p style={{ margin: "10px 0" }}>
            <strong>Certificate Holder:</strong> {certificate?.userName}
          </p>
          <p style={{ margin: "10px 0" }}>
            <strong>Test:</strong> {certificate?.category}
          </p>
          <p style={{ margin: "10px 0" }}>
            <strong>Score:</strong> {certificate?.score}/{certificate?.totalQuestions} ({certificate?.percentage}%)
          </p>
          <p style={{ margin: "10px 0" }}>
            <strong>Issue Date:</strong> {new Date(certificate?.issueDate).toLocaleDateString()}
          </p>
          <p style={{ margin: "10px 0" }}>
            <strong>Certificate ID:</strong> {certificate?.certificateId}
          </p>
        </div>

        <div style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "10px"
        }}>
          <p style={{ color: "#666", margin: 0 }}>
            This certificate is officially issued by <strong>CareerPilot AI</strong>
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: "30px",
            padding: "12px 30px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Go to CareerPilot AI
        </button>
      </div>
    </div>
  );
}