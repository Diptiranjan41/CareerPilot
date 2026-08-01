import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const saveToken = (token) => localStorage.setItem("token", token);
const clearToken = () => localStorage.removeItem("token");

// ─── Axios default header (runs once on module load) ─────────────────────────
const token = getToken();
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// ─── Helper: always attach latest token to every request ─────────────────────
const authAxios = {
  get: (url, config = {}) => {
    const t = getToken();
    return axios.get(url, {
      ...config,
      headers: { ...(config.headers || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    });
  },
  post: (url, data = {}, config = {}) => {
    const t = getToken();
    return axios.post(url, data, {
      ...config,
      headers: { ...(config.headers || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    });
  },
};

const NAV_LINKS = [
  {
    label: "Product",
    path: "/product",
    children: [
      { label: "Resume Builder", path: "/resume-builder", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z", desc: "AI-powered resumes" },
      { label: "Job Matching", path: "/job-matching", icon: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z", desc: "Smart role discovery" },
      { label: "Interview Prep", path: "/mock-interview", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 4v-4z", desc: "AI mock interviews with voice" },
      { label: "Salary Insights", path: "/salary-insights", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", desc: "Negotiation intel" },
    ],
  },
  {
    label: "Resources",
    path: "/resources",
    children: [
      { label: "Blog", path: "/blog", icon: "M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 1 2-2V9a2 2 0 0 1-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", desc: "Career insights" },
      { label: "Career Guides", path: "/career-guides", icon: "M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0 8V9m0 0L9 7", desc: "Deep dives" },
      { label: "Templates", path: "/templates", icon: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zM16 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6z", desc: "Ready-to-use" },
      { label: "Mock Test", path: "/mock-test", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4", desc: "Practice with AI-powered tests" },
      { label: "Community", path: "/community", icon: "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z", desc: "40K+ members" },
    ],
  },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
];

export default function CareerPilotNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuTimeoutRef = useRef(null);
  const profileTimeoutRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for login event (dispatch this from your Login page after successful login)
  useEffect(() => {
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (isLoggedIn) fetchUserProfile();
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, [isLoggedIn]);

  // ─── FIXED: send JWT token in Authorization header ──────────────────────────
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const t = getToken();

      // No token in storage → not logged in, skip API call
      if (!t) {
        setIsLoggedIn(false);
        setUser(null);
        setAvatarUrl(null);
        return;
      }

      const response = await authAxios.get(`${API_URL}/auth/check`);

      if (response.data.authenticated) {
        setIsLoggedIn(true);
        await fetchUserProfile();
      } else {
        clearToken();
        setIsLoggedIn(false);
        setUser(null);
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // 401 = token expired/invalid → clear it
      if (error?.response?.status === 401) clearToken();
      setIsLoggedIn(false);
      setUser(null);
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await authAxios.get(`${API_URL}/profile`);
      setUser(response.data);

      if (response.data.avatar) {
        if (response.data.avatar.startsWith("data:image") || response.data.avatar.startsWith("http")) {
          setAvatarUrl(response.data.avatar);
        } else {
          setAvatarUrl(`${API_URL.replace("/api", "")}${response.data.avatar}`);
        }
      } else if (response.data.googleAvatar) {
        setAvatarUrl(response.data.googleAvatar);
      } else if (response.data.picture) {
        setAvatarUrl(response.data.picture);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setAvatarUrl(null);
    }
  };

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      setMobileOpen(false);
      setMobileExpanded(null);
      setOpenMenu(null);
      setProfileOpen(false);
    }
  };

  // ─── FIXED: send token in logout header ────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authAxios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear token and state regardless of API response
      clearToken();
      delete axios.defaults.headers.common["Authorization"];
      setIsLoggedIn(false);
      setUser(null);
      setAvatarUrl(null);
      setProfileOpen(false);
      navigate("/");
    }
  };

  const isActivePath = (path) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const getUserInitials = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const handleMenuEnter = (menuLabel) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setOpenMenu(menuLabel);
  };
  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setOpenMenu(null), 200);
  };
  const handleProfileEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileOpen(true);
  };
  const handleProfileLeave = () => {
    profileTimeoutRef.current = setTimeout(() => setProfileOpen(false), 200);
  };

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && location.pathname === "/profile") {
      const timer = setTimeout(() => fetchUserProfile(), 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <nav style={{
        background: "rgba(2,11,24,.95)",
        borderBottom: "1px solid rgba(0,240,200,.08)",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(0,240,200,.2)", borderTopColor: "#00F0C8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </nav>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .cp-nav * { box-sizing: border-box; }
        .cp-nav { font-family: 'Cabinet Grotesk', sans-serif; }

        @keyframes navFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(8px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseDot {
          0%,100% { box-shadow: 0 0 6px rgba(0,240,200,.8); }
          50%      { box-shadow: 0 0 14px rgba(0,240,200,1), 0 0 28px rgba(0,240,200,.4); }
        }

        .cp-nav-wrap { animation: navFadeIn .5s ease both; }

        .cp-nav-link {
          position: relative; display: flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 10px; font-size: 13.5px; font-weight: 600;
          color: rgba(255,255,255,.55); cursor: pointer; transition: color .2s, background .2s;
          text-decoration: none; border: none; background: transparent; white-space: nowrap; font-family: inherit;
        }
        .cp-nav-link:hover, .cp-nav-link.active { color: #00F0C8; background: rgba(0,240,200,.08); }
        .cp-nav-link .cp-chevron { transition: transform .2s; }
        .cp-nav-link.active .cp-chevron { transform: rotate(180deg); }

        .cp-dropdown {
          position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%);
          min-width: 280px; background: linear-gradient(145deg, #051528, #0A2240);
          border: 1px solid rgba(0,240,200,.18); border-radius: 18px; padding: 8px;
          box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(0,240,200,.05), inset 0 1px 0 rgba(0,240,200,.12);
          animation: dropIn .2s ease both; backdrop-filter: blur(24px); z-index: 100;
        }

        .cp-drop-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px;
          cursor: pointer; transition: background .18s; text-decoration: none; width: 100%;
          text-align: left; background: transparent; border: none;
        }
        .cp-drop-item:hover { background: rgba(0,240,200,.08); }
        .cp-drop-item:hover .cp-drop-icon { background: linear-gradient(135deg, rgba(0,240,200,.25), rgba(0,153,255,.18)); border-color: rgba(0,240,200,.4); color: #00F0C8; }
        .cp-drop-icon {
          width: 36px; height: 36px; flex-shrink: 0; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,240,200,.07); border: 1px solid rgba(0,240,200,.15);
          color: rgba(0,240,200,.6); transition: all .18s;
        }

        .cp-cta-btn {
          display: flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 11px;
          font-size: 13.5px; font-weight: 700; font-family: inherit; border: none; cursor: pointer;
          transition: box-shadow .22s, transform .15s; white-space: nowrap;
        }
        .cp-cta-ghost { background: rgba(0,240,200,.07); border: 1px solid rgba(0,240,200,.2); color: rgba(255,255,255,.7); }
        .cp-cta-ghost:hover { background: rgba(0,240,200,.13); border-color: rgba(0,240,200,.4); color: #00F0C8; }
        .cp-cta-primary { background: linear-gradient(135deg, #00F0C8, #0099FF) !important; color: #020B18 !important; box-shadow: 0 0 22px rgba(0,240,200,.35); }
        .cp-cta-primary:hover { box-shadow: 0 0 38px rgba(0,240,200,.55), 0 0 70px rgba(0,153,255,.25) !important; transform: translateY(-1px); }

        .sdot { animation: pulseDot 2s ease-in-out infinite; }

        .profile-menu {
          position: absolute; top: 100%; right: 0; min-width: 240px;
          background: linear-gradient(145deg, #051528, #0A2240);
          border: 1px solid rgba(0,240,200,.18); border-radius: 16px; padding: 8px;
          box-shadow: 0 24px 60px rgba(0,0,0,.6); backdrop-filter: blur(24px);
          z-index: 200; animation: dropIn .2s ease both;
        }
        .profile-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px;
          cursor: pointer; transition: background .18s; width: 100%; border: none; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 500; color: rgba(255,255,255,.7);
        }
        .profile-item:hover { background: rgba(0,240,200,.08); color: #00F0C8; }
        .profile-divider { height: 1px; background: rgba(0,240,200,.1); margin: 6px 0; }

        .cp-mobile-menu { animation: dropIn .25s ease both; }
        .cp-mob-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,.6); cursor: pointer; transition: all .18s;
          border: none; background: transparent; font-family: inherit; width: 100%; text-align: left; text-decoration: none;
        }
        .cp-mob-link:hover, .cp-mob-link.active { background: rgba(0,240,200,.08); color: #00F0C8; }
        .cp-ham span { display: block; width: 20px; height: 2px; background: rgba(255,255,255,.6); border-radius: 2px; transition: all .25s; }
        .cp-ham.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: #00F0C8; }
        .cp-ham.open span:nth-child(2) { opacity: 0; }
        .cp-ham.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: #00F0C8; }

        @media (max-width: 768px) { .cp-desktop-nav { display: none !important; } .cp-mobile-trigger { display: flex !important; } }
        @media (min-width: 769px) { .cp-mobile-trigger { display: none !important; } .cp-mobile-menu-wrap { display: none !important; } }
      `}</style>

      <nav className="cp-nav cp-nav-wrap" style={{ position: "relative", width: "100%", zIndex: 999 }}>

        {/* Bar */}
        <div style={{
          background: scrolled ? "rgba(2,11,24,.92)" : "linear-gradient(180deg, rgba(2,11,24,.98) 0%, rgba(5,21,40,.95) 100%)",
          backdropFilter: "blur(24px)",
          borderBottom: scrolled ? "1px solid rgba(0,240,200,.15)" : "1px solid rgba(0,240,200,.08)",
          boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(0,240,200,.04)" : "none",
          transition: "all .3s ease",
          padding: "0 24px",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(0,240,200,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,200,.025) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, maxWidth: 1200, margin: "0 auto" }}>

            {/* Logo */}
            <button onClick={() => handleNavigation("/")} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#00F0C8,#0099FF)", boxShadow: "0 0 22px rgba(0,240,200,.45), inset 0 1px 0 rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#020B18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px", background: "linear-gradient(90deg,#00F0C8,#0099FF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>CareerPilot</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(0,240,200,.45)", lineHeight: 1, marginTop: 1 }}>AI Career Intelligence</div>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="cp-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {NAV_LINKS.map((item) =>
                item.children ? (
                  <div key={item.label} style={{ position: "relative" }} onMouseEnter={() => handleMenuEnter(item.label)} onMouseLeave={handleMenuLeave}>
                    <button className={`cp-nav-link ${openMenu === item.label ? "active" : ""} ${isActivePath(item.path) ? "active" : ""}`} onClick={() => item.path && handleNavigation(item.path)}>
                      {item.label}
                      <svg className="cp-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {openMenu === item.label && (
                      <div className="cp-dropdown" onMouseEnter={() => handleMenuEnter(item.label)} onMouseLeave={handleMenuLeave}>
                        {item.children.map((child) => (
                          <button key={child.label} className="cp-drop-item" onClick={() => handleNavigation(child.path)}>
                            <div className="cp-drop-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={child.icon}/></svg>
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.85)", marginBottom: 2 }}>{child.label}</div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>{child.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button key={item.label} className={`cp-nav-link ${isActivePath(item.path) ? "active" : ""}`} onClick={() => handleNavigation(item.path)}>{item.label}</button>
                )
              )}
            </div>

            {/* Desktop CTA */}
            <div className="cp-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "rgba(0,240,200,.06)", border: "1px solid rgba(0,240,200,.14)", marginRight: 4 }}>
                <div className="sdot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F0C8", boxShadow: "0 0 6px rgba(0,240,200,.9)", flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.4)", letterSpacing: ".3px" }}>Live</span>
              </div>

              {isLoggedIn ? (
                <div style={{ position: "relative" }} onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                  <button className="cp-cta-btn cp-cta-ghost" onClick={() => setProfileOpen(!profileOpen)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid #00F0C8" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          const div = document.createElement("div");
                          div.style.cssText = "width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00F0C8,#0099FF);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#020B18";
                          div.textContent = getUserInitials();
                          e.target.parentElement?.insertBefore(div, e.target);
                          e.target.remove();
                        }}
                      />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #00F0C8, #0099FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#020B18" }}>
                        {getUserInitials()}
                      </div>
                    )}
                    <span>{user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "User"}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </button>

                  {profileOpen && (
                    <div className="profile-menu" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                      <div className="profile-item" style={{ opacity: 0.7, cursor: "default" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "#00F0C8" }}>{user?.fullName || user?.name || user?.email}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{user?.email}</div>
                        </div>
                      </div>
                      <div className="profile-divider" />
                      <button className="profile-item" onClick={() => { handleNavigation("/dashboard"); setProfileOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Dashboard
                      </button>
                      <button className="profile-item" onClick={() => { handleNavigation("/profile"); setProfileOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                      </button>
                      <button className="profile-item" onClick={() => { handleNavigation("/settings"); setProfileOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Settings
                      </button>
                      <div className="profile-divider" />
                      <button className="profile-item" onClick={handleLogout} style={{ color: "#ef4444" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="cp-cta-btn cp-cta-ghost" onClick={() => handleNavigation("/login")}>Sign in</button>
                  <button className="cp-cta-btn cp-cta-primary" onClick={() => handleNavigation("/signup")}>Get started →</button>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button
              className={`cp-ham cp-mobile-trigger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: "none", flexDirection: "column", gap: 5, padding: 8, borderRadius: 10, border: "none", cursor: "pointer", background: mobileOpen ? "rgba(0,240,200,.1)" : "transparent", transition: "background .2s" }}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="cp-mobile-menu-wrap" style={{ display: mobileOpen ? "block" : "none" }}>
          <div className="cp-mobile-menu" style={{ background: "linear-gradient(145deg,#020B18,#051528)", borderBottom: "1px solid rgba(0,240,200,.12)", padding: "12px 16px 20px", boxShadow: "0 20px 50px rgba(0,0,0,.6)", maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
            {NAV_LINKS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button className={`cp-mob-link ${mobileExpanded === item.label ? "active" : ""}`} onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}>
                    {item.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: mobileExpanded === item.label ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div style={{ maxHeight: mobileExpanded === item.label ? 500 : 0, overflow: "hidden", transition: "max-height .3s ease" }}>
                    {item.children.map((child) => (
                      <button key={child.label} className="cp-drop-item" onClick={() => handleNavigation(child.path)} style={{ marginLeft: 8, marginBottom: 2, width: "calc(100% - 16px)" }}>
                        <div className="cp-drop-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={child.icon}/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>{child.label}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{child.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button key={item.label} className={`cp-mob-link ${isActivePath(item.path) ? "active" : ""}`} onClick={() => handleNavigation(item.path)}>{item.label}</button>
              )
            )}

            {/* Mobile CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,240,200,.08)" }}>
              {isLoggedIn ? (
                <>
                  <div style={{ padding: "12px 16px", background: "rgba(0,240,200,.05)", borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, color: "#00F0C8" }}>{user?.fullName || user?.name || user?.email}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{user?.email}</div>
                  </div>
                  <button className="cp-cta-btn cp-cta-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleNavigation("/dashboard"); setMobileOpen(false); }}>Dashboard</button>
                  <button className="cp-cta-btn cp-cta-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleNavigation("/profile"); setMobileOpen(false); }}>Profile</button>
                  <button className="cp-cta-btn cp-cta-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleNavigation("/mock-test"); setMobileOpen(false); }}>Mock Test</button>
                  <button className="cp-cta-btn cp-cta-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleNavigation("/mock-interview"); setMobileOpen(false); }}>Mock Interview</button>
                  <button className="cp-cta-btn" style={{ width: "100%", justifyContent: "center", background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#ef4444" }} onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <button className="cp-cta-btn cp-cta-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleNavigation("/login")}>Sign in</button>
                  <button className="cp-cta-btn cp-cta-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleNavigation("/signup")}>Get started →</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}