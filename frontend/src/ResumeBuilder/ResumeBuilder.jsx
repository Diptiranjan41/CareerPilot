import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/resumes';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Exo+2:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rb-root {
    min-height: 100vh;
    background: #020B18;
    color: #fff;
    font-family: 'Exo 2', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .rb-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0,240,200,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168,85,247,0.05) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 60% 10%, rgba(0,153,255,0.04) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .rb-grid-bg {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,240,200,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,200,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
  }

  .rb-content { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 24px; }

  .rb-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px; padding: 20px 28px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(0,240,200,0.15);
    border-radius: 16px; backdrop-filter: blur(20px);
    position: relative; overflow: hidden; flex-wrap: wrap; gap: 12px;
  }
  .rb-header::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #00F0C8, #0099FF, #A855F7, transparent);
  }
  .rb-header-left { display: flex; align-items: center; gap: 16px; }
  .rb-logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #00F0C8, #0099FF);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-size: 20px; box-shadow: 0 0 20px rgba(0,240,200,0.3);
  }
  .rb-title { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; }
  .rb-title span { background: linear-gradient(135deg, #00F0C8, #0099FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .rb-subtitle { font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 1px; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; backdrop-filter: blur(20px);
    transition: border-color 0.3s;
  }
  .glass-card:hover { border-color: rgba(0,240,200,0.2); }

  .rb-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
  @media(max-width: 1024px) { .rb-layout { grid-template-columns: 1fr; } }

  .rb-sidebar { display: flex; flex-direction: column; gap: 16px; }
  .rb-resumes-list { padding: 20px; }
  
  .rb-section-title {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 3px;
    color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .rb-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }

  .rb-resume-item {
    padding: 12px 14px; border-radius: 10px; cursor: pointer;
    border: 1px solid transparent; transition: all 0.2s; margin-bottom: 6px;
    display: flex; align-items: center; gap: 12px;
  }
  .rb-resume-item:hover { background: rgba(0,240,200,0.05); border-color: rgba(0,240,200,0.15); }
  .rb-resume-item.active { background: rgba(0,240,200,0.08); border-color: rgba(0,240,200,0.3); }
  .rb-resume-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); flex-shrink: 0; }
  .rb-resume-item.active .rb-resume-dot { background: #00F0C8; box-shadow: 0 0 8px #00F0C8; }
  .rb-resume-name { font-size: 13px; font-weight: 500; color: #fff; }
  .rb-resume-date { font-size: 11px; color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono', monospace; }

  .rb-nav { padding: 20px; }
  .rb-nav-item {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; border: 1px solid transparent;
    background: transparent; cursor: pointer; transition: all 0.2s; margin-bottom: 4px;
    color: rgba(255,255,255,0.5); font-family: 'Exo 2', sans-serif;
    font-size: 13px; font-weight: 500; text-align: left;
  }
  .rb-nav-item:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); }
  .rb-nav-item.active { background: rgba(0,153,255,0.1); border-color: rgba(0,153,255,0.3); color: #0099FF; }
  .rb-nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
  .rb-nav-check {
    margin-left: auto; width: 16px; height: 16px; border-radius: 50%;
    background: rgba(0,240,200,0.15); border: 1px solid rgba(0,240,200,0.3);
    display: flex; align-items: center; justify-content: center; font-size: 9px;
  }
  .rb-nav-check.filled { background: rgba(0,240,200,0.2); color: #00F0C8; }

  .rb-completion { padding: 20px; }
  .rb-completion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .rb-completion-label { font-size: 12px; color: rgba(255,255,255,0.45); font-family: 'JetBrains Mono', monospace; }
  .rb-completion-pct { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #00F0C8; }
  .rb-progress-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
  .rb-progress-fill { height: 100%; background: linear-gradient(90deg, #00F0C8, #0099FF); border-radius: 999px; transition: width 0.5s ease; box-shadow: 0 0 8px rgba(0,240,200,0.5); }

  .rb-main { display: flex; flex-direction: column; gap: 20px; }
  .rb-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-wrap: wrap; gap: 12px;
  }
  .rb-panel-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
  .rb-panel-sub { font-size: 12px; color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

  .rb-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .btn {
    padding: 9px 18px; border-radius: 9px; font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 1px; cursor: pointer;
    border: 1px solid transparent; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: linear-gradient(135deg, rgba(0,240,200,0.15), rgba(0,153,255,0.15)); border-color: rgba(0,240,200,0.4); color: #00F0C8; }
  .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, rgba(0,240,200,0.25), rgba(0,153,255,0.25)); box-shadow: 0 0 20px rgba(0,240,200,0.2); }
  .btn-amber { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); color: #F59E0B; }
  .btn-amber:hover:not(:disabled) { background: rgba(245,158,11,0.18); box-shadow: 0 0 16px rgba(245,158,11,0.15); }
  .btn-ghost { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
  .btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }

  .rb-section-body { padding: 28px; }
  .rb-field-grid { display: grid; gap: 20px; }
  .rb-field-grid-2 { grid-template-columns: 1fr 1fr; }
  @media(max-width: 640px) { .rb-field-grid-2 { grid-template-columns: 1fr; } }

  .rb-field { display: flex; flex-direction: column; gap: 8px; }
  .rb-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 6px; }
  .rb-label .req { color: #00F0C8; }

  .rb-input, .rb-textarea {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 12px 16px; color: #fff;
    font-family: 'Exo 2', sans-serif; font-size: 14px; transition: all 0.2s; outline: none; resize: vertical; width: 100%;
  }
  .rb-input:focus, .rb-textarea:focus { border-color: rgba(0,240,200,0.4); background: rgba(0,240,200,0.04); box-shadow: 0 0 0 3px rgba(0,240,200,0.06); }

  .rb-preview-wrap { overflow: hidden; }
  .rb-preview-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  
  /* Professional Resume Preview Styles */
  .rb-preview-doc {
    padding: 40px 50px;
    background: #FFFFFF !important;
    margin: 24px auto;
    max-width: 850px;
    border-radius: 4px;
    border: 1px solid #E5E7EB;
    min-height: 1100px;
    color: #000000 !important;
    font-family: 'Times New Roman', 'Inter', serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }

  /* Print styles for PDF export */
  @media print {
    .rb-header, .rb-sidebar, .rb-actions, .rb-nav, .rb-preview-header, .btn, .glass-card {
      display: none !important;
    }
    .rb-preview-doc {
      margin: 0 !important;
      padding: 20px !important;
      box-shadow: none !important;
      border: none !important;
    }
    .rb-content {
      padding: 0 !important;
    }
  }

  .resume-header {
    text-align: center;
    margin-bottom: 20px;
  }
  .resume-name {
    font-size: 28px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 4px;
  }
  .resume-title {
    font-size: 14px;
    font-weight: 600;
    color: #4B5563;
    margin-bottom: 8px;
  }
  .resume-contact {
    font-size: 11px;
    color: #1F2937;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .resume-contact a {
    color: #1F2937;
    text-decoration: none;
  }
  .resume-section {
    margin-bottom: 16px;
  }
  .resume-section-title {
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #000000;
    margin-bottom: 8px;
    border-bottom: 2px solid #000000;
    padding-bottom: 4px;
  }
  .resume-subsection {
    margin-bottom: 12px;
  }
  .resume-subtitle {
    font-weight: 700;
    font-size: 14px;
    color: #000000;
    margin-bottom: 4px;
  }
  .resume-date {
    font-size: 12px;
    color: #6B7280;
    float: right;
  }
  .resume-list {
    margin: 0;
    padding-left: 20px;
  }
  .resume-list li {
    font-size: 12px;
    line-height: 1.5;
    color: #000000;
    margin-bottom: 4px;
  }
  .resume-text {
    font-size: 12px;
    line-height: 1.5;
    color: #000000;
    text-align: justify;
  }
  .clearfix::after {
    content: "";
    clear: both;
    display: table;
  }
`;

const SECTIONS = [
  { id: 'personal', name: 'Personal Info', icon: '◉' },
  { id: 'summary', name: 'Summary', icon: '≡' },
  { id: 'experience', name: 'Experience', icon: '◈' },
  { id: 'education', name: 'Education', icon: '◆' },
  { id: 'skills', name: 'Skills', icon: '⬡' },
  { id: 'projects', name: 'Projects', icon: '◎' },
  { id: 'certifications', name: 'Certifications', icon: '◇' },
  { id: 'achievements', name: 'Achievements', icon: '★' },
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  githubUrl: '',
  summary: '',
  workExperience: '',
  education: '',
  skills: '',
  projects: '',
  certifications: '',
  achievements: '',
};

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => { fetchResumes(); }, []);

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_BASE_URL, authHeaders());
      setResumes(data);
      if (data.length > 0) {
        setCurrentResume(data[0]);
        loadToForm(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      if (currentResume?.id) {
        await axios.put(`${API_BASE_URL}/${currentResume.id}`, formData, authHeaders());
        showToast('Resume saved successfully');
      } else {
        await axios.post(API_BASE_URL, formData, authHeaders());
        showToast('New resume created successfully');
      }
      await fetchResumes();
    } catch (e) {
      console.error(e);
      showToast('Error saving resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const downloadAsPDF = () => {
    if (!previewRef.current) return;
    
    setDownloading(true);
    try {
      // Get the HTML content of the preview
      const printContent = previewRef.current.cloneNode(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${formData.fullName || 'Resume'} - Resume</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', 'Inter', serif;
              padding: 40px;
              background: white;
            }
            .resume-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .resume-name {
              font-size: 28px;
              font-weight: 700;
              color: #000000;
              margin-bottom: 4px;
            }
            .resume-title {
              font-size: 14px;
              font-weight: 600;
              color: #4B5563;
              margin-bottom: 8px;
            }
            .resume-contact {
              font-size: 11px;
              color: #1F2937;
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 12px;
            }
            .resume-section {
              margin-bottom: 16px;
            }
            .resume-section-title {
              font-size: 16px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #000000;
              margin-bottom: 8px;
              border-bottom: 2px solid #000000;
              padding-bottom: 4px;
            }
            .resume-subsection {
              margin-bottom: 12px;
            }
            .resume-subtitle {
              font-weight: 700;
              font-size: 14px;
              color: #000000;
              margin-bottom: 4px;
            }
            .resume-date {
              font-size: 12px;
              color: #6B7280;
              float: right;
            }
            .resume-list {
              margin: 0;
              padding-left: 20px;
            }
            .resume-list li {
              font-size: 12px;
              line-height: 1.5;
              color: #000000;
              margin-bottom: 4px;
            }
            .resume-text {
              font-size: 12px;
              line-height: 1.5;
              color: #000000;
              text-align: justify;
            }
            .clearfix::after {
              content: "";
              clear: both;
              display: table;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      showToast('PDF generated! Use browser print to save as PDF.', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Error generating PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const loadToForm = (resume) => {
    setFormData({
      fullName: resume.fullName || '',
      email: resume.email || '',
      phone: resume.phone || '',
      linkedinUrl: resume.linkedinUrl || '',
      githubUrl: resume.githubUrl || '',
      summary: resume.summary || '',
      workExperience: resume.workExperience || '',
      education: resume.education || '',
      skills: resume.skills || '',
      projects: resume.projects || '',
      certifications: resume.certifications || '',
      achievements: resume.achievements || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const completionPct = () => {
    const fields = ['fullName', 'email', 'summary', 'skills', 'projects'];
    const filled = fields.filter(f => formData[f]?.trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  const sectionFilled = (id) => {
    const map = {
      personal: ['fullName', 'email'], summary: ['summary'],
      experience: ['workExperience'], education: ['education'], skills: ['skills'],
      projects: ['projects'], certifications: ['certifications'], achievements: ['achievements']
    };
    return (map[id] || []).some(f => formData[f]?.trim());
  };

  const renderForm = () => {
    const field = (label, name, type = 'input', rows = 4, placeholder = '', hint = '', req = false) => (
      <div className="rb-field" key={name}>
        <label className="rb-label">{label}{req && <span className="req">*</span>}</label>
        {type === 'input'
          ? <input className="rb-input" name={name} value={formData[name] || ''} onChange={handleChange} placeholder={placeholder} />
          : <textarea className="rb-textarea" name={name} value={formData[name] || ''} onChange={handleChange} rows={rows} placeholder={placeholder} />
        }
        {hint && <div className="rb-field-hint">{hint}</div>}
      </div>
    );

    switch (activeSection) {
      case 'personal': return (
        <div className="rb-field-grid rb-field-grid-2">
          {field('Full Name', 'fullName', 'input', 0, 'Enter your full name', '', true)}
          {field('Email Address', 'email', 'input', 0, 'you@example.com', '', true)}
          {field('Phone Number', 'phone', 'input', 0, '+91 XXXXXXXXXX', '')}
          {field('LinkedIn URL', 'linkedinUrl', 'input', 0, 'https://linkedin.com/in/yourprofile', '')}
          {field('GitHub URL', 'githubUrl', 'input', 0, 'https://github.com/yourusername', '')}
        </div>
      );
      case 'summary': return <div className="rb-field-grid">{field('Professional Summary', 'summary', 'textarea', 6, 'Write a brief summary of your professional background...', 'Highlight your key strengths and career objectives')}</div>;
      case 'experience': return <div className="rb-field-grid">{field('Work Experience', 'workExperience', 'textarea', 10, 'Company Name | Position | Duration\n• Responsibility/achievement 1\n• Responsibility/achievement 2\n\nCompany Name | Position | Duration\n• Responsibility/achievement 1', 'List your professional experience in reverse chronological order. Use • for bullet points. Separate different jobs with blank lines.')}</div>;
      case 'education': return <div className="rb-field-grid">{field('Education', 'education', 'textarea', 6, 'Degree | Institution | Year | CGPA/Percentage\n• Relevant coursework 1\n• Relevant coursework 2', 'Include your highest degree first. Use • for bullet points.')}</div>;
      case 'skills': return <div className="rb-field-grid">{field('Skills', 'skills', 'textarea', 6, '• Programming Languages: Java, Python, JavaScript\n• Web Development: React, Node.js\n• Databases: MySQL, MongoDB\n• Tools: Git, VS Code', 'List technical and soft skills. Use • for each category.')}</div>;
      case 'projects': return <div className="rb-field-grid">{field('Projects', 'projects', 'textarea', 12, 'Project Name | Tech Stack | Start Date -- End Date\n• Key feature 1\n• Key feature 2\n\nProject Name | Tech Stack | Start Date -- End Date\n• Key feature 1\n• Key feature 2', 'Describe 2-3 key projects. Use | to separate title, tech stack, and dates. Use • for bullet points. Separate projects with blank lines.')}</div>;
      case 'certifications': return <div className="rb-field-grid">{field('Certifications', 'certifications', 'textarea', 6, '• Certification Name | Issuing Organization | Year\n• Certification Name | Issuing Organization | Year', 'Include relevant professional certifications. Use • for each certification.')}</div>;
      case 'achievements': return <div className="rb-field-grid">{field('Achievements & Activities', 'achievements', 'textarea', 8, '• Achievement 1\n• Achievement 2\n• Extracurricular activity 1', 'Include academic, professional, or extracurricular achievements. Use • for each achievement.')}</div>;
      default: return null;
    }
  };

  const renderPreview = () => {
    const formatBulletPoints = (text) => {
      if (!text) return [];
      const lines = text.split('\n');
      return lines.map((line, i) => {
        if (line.trim()) {
          const bulletText = line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim();
          return <li key={i}>{bulletText}</li>;
        }
        return null;
      }).filter(Boolean);
    };

    const formatProjects = () => {
      if (!formData.projects) return null;
      const projects = formData.projects.split('\n\n');
      return projects.map((project, idx) => {
        const lines = project.split('\n');
        const titleLine = lines[0] || '';
        const dateMatch = titleLine.match(/\|\s*([A-Za-z]+\s+\d{4})\s*--?\s*([A-Za-z]+\s+\d{4})/);
        let projectTitle = titleLine;
        let date = '';
        
        if (dateMatch) {
          projectTitle = titleLine.replace(/\s*\|\s*[A-Za-z]+\s+\d{4}\s*--?\s*[A-Za-z]+\s+\d{4}/, '');
          date = dateMatch[1] + ' -- ' + dateMatch[2];
        }
        
        const bullets = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const bulletText = lines[i].trim().startsWith('•') ? lines[i].trim().substring(1).trim() : lines[i].trim();
            bullets.push(<li key={i}>{bulletText}</li>);
          }
        }
        
        return (
          <div key={idx} className="resume-subsection">
            <div className="clearfix">
              <span className="resume-subtitle">{projectTitle.trim()}</span>
              {date && <span className="resume-date">{date}</span>}
            </div>
            <ul className="resume-list">{bullets}</ul>
          </div>
        );
      });
    };

    const formatSkills = () => {
      if (!formData.skills) return null;
      const lines = formData.skills.split('\n');
      return (
        <ul className="resume-list">
          {lines.map((line, i) => {
            if (line.trim()) {
              const skillText = line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim();
              return <li key={i}>{skillText}</li>;
            }
            return null;
          }).filter(Boolean)}
        </ul>
      );
    };

    return (
      <div ref={previewRef} className="rb-preview-doc">
        <div className="resume-header">
          <div className="resume-name">{formData.fullName || 'YOUR NAME'}</div>
          <div className="resume-title">Aspiring Software Engineer</div>
          <div className="resume-contact">
            {formData.email && <span>{formData.email}</span>}
            {formData.email && formData.phone && <span>|</span>}
            {formData.phone && <span>{formData.phone}</span>}
            {(formData.email || formData.phone) && (formData.linkedinUrl || formData.githubUrl) && <span>|</span>}
            {formData.linkedinUrl && <span>LinkedIn</span>}
            {formData.linkedinUrl && formData.githubUrl && <span>|</span>}
            {formData.githubUrl && <span>GitHub</span>}
          </div>
        </div>

        {formData.summary && (
          <div className="resume-section">
            <div className="resume-section-title">Summary</div>
            <div className="resume-text">{formData.summary}</div>
          </div>
        )}

        {formData.skills && (
          <div className="resume-section">
            <div className="resume-section-title">Skills</div>
            {formatSkills()}
          </div>
        )}

        {formData.projects && (
          <div className="resume-section">
            <div className="resume-section-title">Projects</div>
            {formatProjects()}
          </div>
        )}

        {formData.workExperience && (
          <div className="resume-section">
            <div className="resume-section-title">Experience</div>
            {formData.workExperience.split('\n\n').map((exp, idx) => {
              const lines = exp.split('\n');
              const title = lines[0];
              const bullets = [];
              for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                  const bulletText = lines[i].trim().startsWith('•') ? lines[i].trim().substring(1).trim() : lines[i].trim();
                  bullets.push(<li key={i}>{bulletText}</li>);
                }
              }
              return (
                <div key={idx} className="resume-subsection">
                  <div className="resume-subtitle">{title}</div>
                  <ul className="resume-list">{bullets}</ul>
                </div>
              );
            })}
          </div>
        )}

        {formData.education && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            <div className="resume-text">{formData.education}</div>
          </div>
        )}

        {formData.certifications && (
          <div className="resume-section">
            <div className="resume-section-title">Certifications & Achievements</div>
            <ul className="resume-list">
              {formData.certifications.split('\n').map((cert, i) => {
                if (cert.trim()) {
                  const certText = cert.trim().startsWith('•') ? cert.trim().substring(1).trim() : cert.trim();
                  return <li key={i}>{certText}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        )}

        {formData.achievements && (
          <div className="resume-section">
            <div className="resume-section-title">Extracurricular Activities</div>
            <ul className="resume-list">
              {formData.achievements.split('\n').map((ach, i) => {
                if (ach.trim()) {
                  const achText = ach.trim().startsWith('•') ? ach.trim().substring(1).trim() : ach.trim();
                  return <li key={i}>{achText}</li>;
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className="rb-root">
        <div className="rb-grid-bg" />

        {toast && (
          <div className={`rb-toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.msg}
          </div>
        )}

        <div className="rb-content">
          <div className="rb-header">
            <div className="rb-header-left">
              <div className="rb-logo-icon">📄</div>
              <div>
                <div className="rb-title">CAREER<span>PILOT</span></div>
                <div className="rb-subtitle">[ PDF RESUME BUILDER ]</div>
              </div>
            </div>
            <div className="rb-actions">
              <button className="btn btn-primary" onClick={saveResume} disabled={saving}>
                {saving ? 'SAVING...' : '💾 SAVE RESUME'}
              </button>
              <button className="btn btn-amber" onClick={downloadAsPDF} disabled={downloading}>
                {downloading ? 'GENERATING...' : '📄 DOWNLOAD PDF'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? '✕ CLOSE PREVIEW' : '👁️ PREVIEW'}
              </button>
            </div>
          </div>

          {!showPreview ? (
            <div className="rb-layout">
              <aside className="rb-sidebar">
                <div className="glass-card rb-resumes-list">
                  <div className="rb-section-title">MY RESUMES</div>
                  {resumes.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      No resumes yet.<br />Create your first resume!
                    </div>
                  ) : (
                    resumes.map(r => (
                      <div key={r.id} className={`rb-resume-item${currentResume?.id === r.id ? ' active' : ''}`} onClick={() => { setCurrentResume(r); loadToForm(r); }}>
                        <div className="rb-resume-dot" />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div className="rb-resume-name">{r.fullName || 'Untitled Resume'}</div>
                          <div className="rb-resume-date">{new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <nav className="glass-card rb-nav">
                  <div className="rb-section-title">SECTIONS</div>
                  {SECTIONS.map(s => (
                    <button key={s.id} className={`rb-nav-item${activeSection === s.id ? ' active' : ''}`} onClick={() => setActiveSection(s.id)}>
                      <span className="rb-nav-icon">{s.icon}</span>
                      {s.name}
                      <div className={`rb-nav-check${sectionFilled(s.id) ? ' filled' : ''}`}>
                        {sectionFilled(s.id) ? '✓' : ''}
                      </div>
                    </button>
                  ))}
                </nav>

                <div className="glass-card rb-completion">
                  <div className="rb-completion-header">
                    <span className="rb-completion-label">COMPLETION</span>
                    <span className="rb-completion-pct">{completionPct()}%</span>
                  </div>
                  <div className="rb-progress-track"><div className="rb-progress-fill" style={{ width: `${completionPct()}%` }} /></div>
                </div>
              </aside>

              <main className="glass-card rb-main">
                <div className="rb-section-breadcrumb">EDITING / <span>{activeSection.toUpperCase()}</span></div>
                <div className="rb-section-body">{renderForm()}</div>
              </main>
            </div>
          ) : (
            <div className="glass-card rb-preview-wrap">
              <div className="rb-preview-header">
                <div>
                  <div className="rb-panel-title">Resume Preview</div>
                  <div className="rb-panel-sub">Professional PDF format preview</div>
                </div>
                <button className="btn btn-ghost" onClick={() => setShowPreview(false)}>✕ Back to Edit</button>
              </div>
              {renderPreview()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}