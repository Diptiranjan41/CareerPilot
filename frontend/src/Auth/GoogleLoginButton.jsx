// src/components/GoogleLoginButton.jsx
import React from 'react';

const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
        // ✅ CORRECT ENDPOINT - Not /api/auth/google
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <button 
            onClick={handleGoogleLogin}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px 20px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = 'none';
            }}
        >
            <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                style={{ width: '20px', height: '20px' }}
            />
            Continue with Google
        </button>
    );
};

export default GoogleLoginButton;