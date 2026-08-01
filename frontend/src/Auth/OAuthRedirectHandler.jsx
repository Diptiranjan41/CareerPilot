// src/Auth/OAuthRedirectHandler.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OAuthRedirectHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('OAuthRedirectHandler loaded');
        
        const handleOAuthResponse = () => {
            try {
                // ✅ Method 1: Get token from URL parameters (backend redirect method)
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                const id = urlParams.get('id');
                const email = urlParams.get('email');
                const fullName = urlParams.get('fullName');
                const role = urlParams.get('role');
                
                console.log('URL params:', { token: !!token, id, email, fullName, role });
                
                if (token) {
                    // Save to localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify({
                        id: id,
                        email: email,
                        fullName: fullName,
                        role: role
                    }));
                    
                    toast.success(`Welcome ${fullName || 'User'}!`);
                    navigate('/dashboard');
                    return;
                }
                
                // ✅ Method 2: Fallback - Check if there's JSON in the page body
                const bodyText = document.body.innerText || document.body.textContent;
                console.log('Response body:', bodyText);
                
                // Remove extension noise if present
                let cleanedText = bodyText;
                if (bodyText.includes('enable_copy.js')) {
                    const lines = bodyText.split('\n');
                    for (const line of lines) {
                        if (line.trim().startsWith('{') && line.includes('"token"')) {
                            cleanedText = line;
                            break;
                        }
                    }
                }
                
                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    const response = JSON.parse(jsonMatch[0]);
                    console.log('Parsed response:', response);
                    
                    if (response.token) {
                        localStorage.setItem('token', response.token);
                        localStorage.setItem('user', JSON.stringify({
                            id: response.id,
                            email: response.email,
                            fullName: response.fullName,
                            role: response.role
                        }));
                        
                        toast.success(`Welcome ${response.fullName || 'User'}!`);
                        navigate('/dashboard');
                        return;
                    }
                }
                
                // ✅ Method 3: Check if already logged in
                const existingToken = localStorage.getItem('token');
                if (existingToken) {
                    console.log('Already logged in, redirecting to dashboard');
                    navigate('/dashboard');
                    return;
                }
                
                console.error('No token found in response');
                toast.error('Login failed. Please try again.');
                navigate('/login');
                
            } catch (error) {
                console.error('OAuth callback error:', error);
                toast.error('Authentication failed');
                navigate('/login');
            }
        };

        // Execute after a small delay to ensure page is loaded
        setTimeout(handleOAuthResponse, 100);
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #020B18 0%, #051528 30%, #0A2240 55%)',
            color: 'white',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '3px solid rgba(0,240,200,0.3)',
                borderTop: '3px solid #00F0C8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p>Completing Google login...</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>Please wait...</p>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default OAuthRedirectHandler;