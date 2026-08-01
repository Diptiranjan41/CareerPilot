import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';  
import HomePage from './pages/Home';
import LoginPage from './Auth/Login';
import SignupPage from './Auth/Signup';
import ForgotPasswordPage from './Auth/ForgotPassword';
import OAuthRedirectHandler from './Auth/OAuthRedirectHandler';
import DashboardPage from './pages/Dashboard';
import CareerRecommendationPage from './Career/Carrer Recommendations';
import PathDetailPage from './Career/PathDetailPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ProfilePage from './pages/Profile';
// Import MockTest components
import MockTestPage from './MockTest/MockTest';
import ResultPage from './MockTest/Result';
import CertificatePage from './MockTest/Certificate';
import PreviousMockTestPage from './MockTest/PreviousMockTest';
// Import Leaderboard component
import LeaderboardPage from './pages/Leaderboard';
// Import ResumeBuilder component
import ResumeBuilder from './ResumeBuilder/ResumeBuilder';
// Import MockInterview component
import MockInterview from './MockInterview/MockInterview';
// Import HRInterview component
import HRInterview from './MockInterview/HRInterview';
import './App.css';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/oauth2/redirect" element={<OAuthRedirectHandler />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/career-recommendations" element={<CareerRecommendationPage />} />
                        <Route path="/career-path/:id" element={<PathDetailPage />} />
                        <Route path="/saved-jobs" element={<SavedJobsPage />} />
                        {/* Mock Test Routes */}
                        <Route path="/mock-test" element={<MockTestPage />} />
                        <Route path="/mock-test/results" element={<ResultPage />} />
                        <Route path="/mock-test/certificate" element={<CertificatePage />} />
                        <Route path="/mock-test/history" element={<PreviousMockTestPage />} />
                        {/* Leaderboard Route */}
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        {/* Resume Builder Route */}
                        <Route path="/resume-builder" element={<ResumeBuilder />} />
                        {/* Mock Interview Route */}
                        <Route path="/mock-interview" element={<MockInterview />} />
                        {/* HR Interview Route */}
                        <Route path="/hr-interview" element={<HRInterview />} />
                    </Routes>
                </main>
                <Footer />
                <Toaster position="top-right" />
            </div>
        </Router>
    );
}

export default App;