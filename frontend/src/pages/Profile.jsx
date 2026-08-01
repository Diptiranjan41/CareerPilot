import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Configure axios to send credentials with requests
axios.defaults.withCredentials = true;

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: "", email: "", username: "", bio: "", location: "", website: "",
    jobTitle: "", company: "", avatar: "",
    skills: [], experience: [], certifications: [],
    careerGoals: { targetRole: "", targetIndustry: "", expectedSalary: 0, timeline: "", preferredLocation: "", openToRemote: true },
    socialLinks: { twitter: "", github: "", linkedin: "" },
    preferences: { theme: "dark", notifications: true, emailUpdates: true }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState(50);
  const [activeTab, setActiveTab] = useState("profile");
  const [hoveredSkill, setHoveredSkill] = useState(null);

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    try {
      const authCheckResponse = await axios.get(`${API_URL}/auth/check`, {
        withCredentials: true,
        validateStatus: (status) => status < 500
      });
      
      if (authCheckResponse.status === 401 || authCheckResponse.status === 403) {
        toast.error("Please login to view your profile");
        navigate("/login");
        return;
      }
      
      await fetchProfile();
    } catch (err) {
      console.error("Auth check failed:", err);
      toast.error("Authentication failed. Please login again.");
      navigate("/login");
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      
      setProfile(response.data);
      if (response.data.avatar) {
        setAvatarPreview(response.data.avatar);
      }
      
      // Dispatch event for navbar update
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (err.response?.status === 401) {
        toast.error("Please login to continue");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleCareerGoalChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      careerGoals: { ...prev.careerGoals, [field]: value }
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      
      setProfile(prev => ({ ...prev, avatar: response.data.avatarUrl }));
      toast.success("Avatar updated successfully!");
      await fetchProfile();
    } catch (err) {
      console.error("Avatar upload error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 413) {
        toast.error("File too large. Maximum size is 5MB.");
      } else {
        toast.error(err.response?.data?.message || "Failed to upload avatar");
      }
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    }
  };

  const removeAvatar = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      try {
        await axios.delete(`${API_URL}/profile/avatar`, {
          withCredentials: true
        });
        setProfile(prev => ({ ...prev, avatar: "" }));
        setAvatarPreview("");
        toast.success("Profile picture removed");
        await fetchProfile();
      } catch (err) {
        toast.error("Failed to remove profile picture");
      }
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) {
      toast.error("Please enter a skill name");
      return;
    }
    
    try {
      await axios.post(`${API_URL}/profile/skills`, 
        { name: newSkill, proficiencyLevel: skillLevel, yearsOfExperience: 0 },
        { withCredentials: true }
      );
      await fetchProfile();
      setNewSkill("");
      setSkillLevel(50);
      toast.success("Skill added successfully!");
    } catch (err) {
      console.error("Add skill error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to add skill");
      }
    }
  };

  const removeSkill = async (skillName) => {
    try {
      await axios.delete(`${API_URL}/profile/skills/${encodeURIComponent(skillName)}`, {
        withCredentials: true
      });
      await fetchProfile();
      toast.success("Skill removed successfully");
    } catch (err) {
      console.error("Remove skill error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to remove skill");
      }
    }
  };

  const updateSkillLevel = async (skillName, level) => {
    try {
      await axios.put(`${API_URL}/profile/skills/${encodeURIComponent(skillName)}?proficiencyLevel=${level}`, {}, {
        withCredentials: true
      });
      await fetchProfile();
      toast.success("Skill level updated");
    } catch (err) {
      console.error("Update skill error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to update skill level");
      }
    }
  };

  const addExperience = async () => {
    const newExp = {
      title: "New Position",
      company: "Company Name",
      startDate: new Date().toISOString().split('T')[0],
      current: false,
      description: ""
    };
    
    try {
      await axios.post(`${API_URL}/profile/experience`, newExp, {
        withCredentials: true
      });
      await fetchProfile();
      toast.success("Experience added successfully");
    } catch (err) {
      console.error("Add experience error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to add experience");
      }
    }
  };

  const updateExperience = async (expId, updates) => {
    try {
      await axios.put(`${API_URL}/profile/experience/${expId}`, updates, {
        withCredentials: true
      });
      await fetchProfile();
      toast.success("Experience updated");
    } catch (err) {
      console.error("Update experience error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to update experience");
      }
    }
  };

  const deleteExperience = async (expId) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    
    try {
      await axios.delete(`${API_URL}/profile/experience/${expId}`, {
        withCredentials: true
      });
      await fetchProfile();
      toast.success("Experience deleted successfully");
    } catch (err) {
      console.error("Delete experience error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to delete experience");
      }
    }
  };

  const setCareerGoals = async () => {
    try {
      await axios.post(`${API_URL}/profile/career-goals`, profile.careerGoals, {
        withCredentials: true
      });
      toast.success("Career goals updated successfully!");
      await fetchProfile();
    } catch (err) {
      console.error("Set career goals error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to update career goals");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.put(`${API_URL}/profile`, profile, {
        withCredentials: true
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      console.error("Update profile error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (window.confirm("Are you sure? This action cannot be undone! All your data will be permanently deleted.")) {
      try {
        await axios.delete(`${API_URL}/profile`, {
          withCredentials: true
        });
        
        toast.success("Account deleted successfully");
        navigate("/login", { replace: true });
      } catch (err) {
        console.error("Delete account error:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error(err.response?.data?.message || "Failed to delete account");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020B18] via-[#051528] to-[#0A2240] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[rgba(0,240,200,0.2)] border-t-[#00F0C8] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00F0C8] to-[#0099FF] rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-white/60 mt-4 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020B18] via-[#051528] to-[#0A2240] font-['Inter',system-ui,sans-serif]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00F0C8] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0099FF] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#A855F7] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[rgba(0,240,200,0.1)] to-[rgba(0,153,255,0.1)] border border-[rgba(0,240,200,0.2)] backdrop-blur-sm mb-6">
            <div className="w-2 h-2 bg-[#00F0C8] rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-[#00F0C8] tracking-wider">PROFILE DASHBOARD</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#00F0C8] via-[#0099FF] to-[#A855F7] bg-clip-text text-transparent animate-gradient">
              My Profile
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Manage your personal information, skills, and career preferences
          </p>
        </div>

        {/* Glass Morphism Tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {[
            { id: "profile", label: "👤 Personal Info", icon: "👤" },
            { id: "skills", label: "⚡ Skills & Expertise", icon: "⚡" },
            { id: "experience", label: "💼 Work Experience", icon: "💼" },
            { id: "career", label: "🎯 Career Goals", icon: "🎯" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-[#00F0C8] to-[#0099FF] text-[#020B18] shadow-lg shadow-[rgba(0,240,200,0.3)]" 
                  : "glass-card text-white/70 hover:text-white hover:bg-[rgba(0,240,200,0.1)]"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
              {activeTab !== tab.id && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[rgba(0,240,200,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          ))}
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-[#00F0C8] to-[#0099FF] text-[#020B18] hover:shadow-xl hover:shadow-[rgba(0,240,200,0.4)] transition-all duration-300 transform hover:scale-105"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Profile Tab - Modern Glass Design */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit}>
            <div className="glass-card rounded-3xl p-8 md:p-10">
              {/* Avatar Section - Modern */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-[rgba(0,240,200,0.1)]">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00F0C8] to-[#0099FF] rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={avatarPreview || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "User")}&background=00F0C8&color=020B18&bold=true&size=128`}
                    alt="Avatar"
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-[rgba(0,240,200,0.5)] shadow-2xl"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "User")}&background=00F0C8&color=020B18&bold=true&size=128`;
                    }}
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <label className="cursor-pointer text-center">
                        <div className="text-white text-xs font-semibold">Change</div>
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">{profile.fullName || "Your Name"}</h2>
                  <p className="text-white/50">{profile.email}</p>
                  <p className="text-[#00F0C8] text-sm mt-2">{profile.jobTitle || "Add your job title"}</p>
                </div>
                
                {isEditing && profile.avatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-300 text-sm font-semibold"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Form Fields - Modern Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", name: "fullName", type: "text", placeholder: "John Doe" },
                  { label: "Username", name: "username", type: "text", placeholder: "@username" },
                  { label: "Email", name: "email", type: "email", placeholder: "john@example.com" },
                  { label: "Job Title", name: "jobTitle", type: "text", placeholder: "Senior Developer" },
                  { label: "Company", name: "company", type: "text", placeholder: "Tech Corp" },
                  { label: "Location", name: "location", type: "text", placeholder: "New York, NY" },
                  { label: "Website", name: "website", type: "url", placeholder: "https://yourwebsite.com" }
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white/70 uppercase tracking-wide">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={profile[field.name] || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-glass px-5 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00F0C8] disabled:opacity-50 transition-all duration-300"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/70 uppercase tracking-wide">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="4"
                    className="input-glass px-5 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00F0C8] resize-vertical disabled:opacity-50 transition-all duration-300"
                    placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  />
                </div>

                {/* Social Links */}
                <div className="col-span-full mt-4">
                  <label className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3 block">Connect With Me</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { platform: "twitter", icon: "🐦", placeholder: "Twitter URL", color: "#1DA1F2" },
                      { platform: "github", icon: "💻", placeholder: "GitHub URL", color: "#6e5494" },
                      { platform: "linkedin", icon: "🔗", placeholder: "LinkedIn URL", color: "#0077b5" }
                    ].map((social) => (
                      <input
                        key={social.platform}
                        type="url"
                        placeholder={`${social.icon} ${social.placeholder}`}
                        value={profile.socialLinks?.[social.platform] || ""}
                        onChange={(e) => handleSocialChange(social.platform, e.target.value)}
                        disabled={!isEditing}
                        className="input-glass px-5 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00F0C8] disabled:opacity-50 transition-all duration-300"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 mt-10 pt-6 border-t border-[rgba(0,240,200,0.1)]">
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
                    {saving ? "Saving..." : "💾 Save Changes"}
                  </button>
                  <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-6 py-3 rounded-xl font-bold glass-card text-white hover:bg-[rgba(0,240,200,0.1)] transition-all duration-300">
                    Cancel
                  </button>
                  <button type="button" onClick={deleteAccount} className="px-6 py-3 rounded-xl font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-300">
                    🗑️ Delete Account
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Skills Tab - Modern Design */}
        {activeTab === "skills" && (
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Your Skills & Expertise</h3>
              <p className="text-white/50">Showcase your professional capabilities</p>
            </div>
            
            {isEditing && (
              <div className="flex gap-3 flex-wrap mb-8 p-5 rounded-2xl bg-[rgba(0,240,200,0.05)] border border-[rgba(0,240,200,0.1)]">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add new skill..."
                  className="flex-1 min-w-[200px] input-glass px-5 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00F0C8]"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <select value={skillLevel} onChange={(e) => setSkillLevel(parseInt(e.target.value))} className="input-glass px-5 py-3 rounded-xl text-white cursor-pointer">
                  {[0,10,20,30,40,50,60,70,80,90,100].map(l => (
                    <option key={l} value={l}>{l}% Proficiency</option>
                  ))}
                </select>
                <button onClick={addSkill} className="btn-primary px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105">
                  + Add Skill
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile.skills?.map((skill, index) => (
                <div 
                  key={skill.name || index} 
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(0,240,200,0.05)] to-[rgba(0,153,255,0.02)] border border-[rgba(0,240,200,0.1)] p-5 hover:border-[rgba(0,240,200,0.3)] transition-all duration-300"
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00F0C8] to-[#0099FF] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[#00F0C8] font-bold text-lg">{skill.name}</span>
                    {isEditing && (
                      <button onClick={() => removeSkill(skill.name)} className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs hover:bg-red-500/30 transition-all duration-300">
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <div className="bg-[rgba(0,240,200,0.1)] h-2 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-gradient-to-r from-[#00F0C8] to-[#0099FF] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${skill.proficiencyLevel || 0}%` }}
                    />
                  </div>
                  {isEditing && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.proficiencyLevel || 0}
                      onChange={(e) => updateSkillLevel(skill.name, parseInt(e.target.value))}
                      className="w-full mt-3 accent-[#00F0C8]"
                    />
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-white/40">{skill.proficiencyLevel || 0}% Proficiency</span>
                    {hoveredSkill === skill.name && !isEditing && (
                      <span className="text-xs text-[#00F0C8] animate-pulse">Click edit to modify</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {(!profile.skills || profile.skills.length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-white/40">No skills added yet. Click "Add Skill" to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Experience Tab - Modern Timeline Design */}
        {activeTab === "experience" && (
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Work Experience</h3>
              <p className="text-white/50">Your professional journey and achievements</p>
            </div>
            
            {isEditing && (
              <button onClick={addExperience} className="w-full mb-8 btn-secondary py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                + Add New Experience
              </button>
            )}
            
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#00F0C8] via-[#0099FF] to-transparent hidden md:block"></div>
              {profile.experience?.map((exp, idx) => (
                <div key={exp.id} className="relative mb-8 pl-0 md:pl-16">
                  <div className="absolute left-0 top-2 w-4 h-4 bg-[#00F0C8] rounded-full border-4 border-[#020B18] hidden md:block"></div>
                  <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, { ...exp, title: e.target.value })}
                            className="text-xl font-bold bg-transparent border-b border-[rgba(0,240,200,0.2)] px-0 py-1 text-white focus:outline-none focus:border-[#00F0C8] w-full"
                          />
                        ) : (
                          <h4 className="text-xl font-bold text-white">{exp.title}</h4>
                        )}
                        {isEditing ? (
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { ...exp, company: e.target.value })}
                            className="text-white/60 bg-transparent border-b border-[rgba(0,240,200,0.2)] px-0 py-1 mt-1 focus:outline-none focus:border-[#00F0C8] w-full"
                          />
                        ) : (
                          <p className="text-white/60 mt-1">{exp.company}</p>
                        )}
                      </div>
                      {isEditing && (
                        <button onClick={() => deleteExperience(exp.id)} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-500/30 transition-all duration-300">
                          Delete
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center mb-4 text-white/50 text-sm">
                      <input
                        type="date"
                        value={exp.startDate || ""}
                        onChange={(e) => updateExperience(exp.id, { ...exp, startDate: e.target.value })}
                        disabled={!isEditing}
                        className="input-glass px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0C8] disabled:opacity-50"
                      />
                      <span>→</span>
                      {!exp.current && (
                        <input
                          type="date"
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(exp.id, { ...exp, endDate: e.target.value })}
                          disabled={!isEditing}
                          className="input-glass px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0C8] disabled:opacity-50"
                        />
                      )}
                      <label className="flex items-center gap-2 cursor-pointer ml-2">
                        <input
                          type="checkbox"
                          checked={exp.current || false}
                          onChange={(e) => updateExperience(exp.id, { ...exp, current: e.target.checked })}
                          disabled={!isEditing}
                          className="accent-[#00F0C8] w-4 h-4"
                        />
                        <span className="text-white/70">Current Position</span>
                      </label>
                    </div>
                    
                    <textarea
                      value={exp.description || ""}
                      onChange={(e) => updateExperience(exp.id, { ...exp, description: e.target.value })}
                      disabled={!isEditing}
                      rows="3"
                      className="w-full input-glass px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0C8] resize-vertical disabled:opacity-50 mt-2"
                      placeholder="Describe your responsibilities, achievements, and contributions..."
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {(!profile.experience || profile.experience.length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💼</div>
                <p className="text-white/40">No work experience added yet. Click "Add New Experience" to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Career Tab - Modern Goals Design */}
        {activeTab === "career" && (
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Career Goals & Aspirations</h3>
              <p className="text-white/50">Define your professional future</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { label: "🎯 Target Role", field: "targetRole", placeholder: "e.g., Senior Full Stack Developer", type: "text" },
                { label: "🏭 Target Industry", field: "targetIndustry", placeholder: "e.g., FinTech, Healthcare, E-commerce", type: "text" },
                { label: "💰 Expected Salary (USD)", field: "expectedSalary", placeholder: "e.g., 120000", type: "number" },
                { label: "⏰ Timeline", field: "timeline", placeholder: "Select your timeline", type: "select", options: ["", "3 months", "6 months", "1 year", "2+ years"] },
                { label: "📍 Preferred Location", field: "preferredLocation", placeholder: "e.g., Remote, New York, London", type: "text" }
              ].map((field) => (
                <div key={field.field} className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/70 uppercase tracking-wide">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      value={profile.careerGoals?.[field.field] || ""}
                      onChange={(e) => handleCareerGoalChange(field.field, e.target.value)}
                      className="input-glass px-5 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00F0C8] cursor-pointer"
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt || "Select timeline"}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={profile.careerGoals?.[field.field] || ""}
                      onChange={(e) => handleCareerGoalChange(field.field, field.type === "number" ? parseInt(e.target.value) : e.target.value)}
                      className="input-glass px-5 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00F0C8]"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/70 uppercase tracking-wide">🌍 Open to Remote Work</label>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl glass-card">
                  <input
                    type="checkbox"
                    checked={profile.careerGoals?.openToRemote || false}
                    onChange={(e) => handleCareerGoalChange("openToRemote", e.target.checked)}
                    className="accent-[#00F0C8] w-5 h-5"
                  />
                  <span className="text-white">Yes, I'm open to remote work opportunities</span>
                </label>
              </div>

              <button onClick={setCareerGoals} className="w-full btn-primary py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 mt-6">
                Save Career Goals
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(5, 21, 40, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 240, 200, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .input-glass {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 240, 200, 0.2);
          transition: all 0.3s ease;
        }
        
        .input-glass:focus {
          border-color: rgba(0, 240, 200, 0.6);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 20px rgba(0, 240, 200, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #00F0C8, #0099FF);
          color: #020B18;
          box-shadow: 0 4px 15px rgba(0, 240, 200, 0.3);
        }
        
        .btn-primary:hover {
          box-shadow: 0 8px 25px rgba(0, 240, 200, 0.4);
        }
        
        .btn-secondary {
          background: rgba(0, 240, 200, 0.1);
          border: 1px solid rgba(0, 240, 200, 0.3);
          color: #00F0C8;
        }
        
        .btn-secondary:hover {
          background: rgba(0, 240, 200, 0.2);
          border-color: rgba(0, 240, 200, 0.5);
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}