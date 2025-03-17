import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CloningDetection from './pages/CloningDetection';
import PhishingAnalyzer from './pages/PhishingAnalyzer';
import SEORanking from './pages/SEORanking';
import ReportPage from './pages/ReportPage';
import Auth from './pages/Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import SSLMismatch from './pages/SSLMismatch';
import './App.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <Router>
            <Routes>
                {/* Authentication Routes */}
                {!user ? (
                    <>
                        <Route path="/" element={<Auth />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                ) : (
                    <>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute user={user}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cloning-detection"
                            element={
                                <ProtectedRoute user={user}>
                                    <CloningDetection />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/phishing-analyzer"
                            element={
                                <ProtectedRoute user={user}>
                                    <PhishingAnalyzer />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/seo-ranking"
                            element={
                                <ProtectedRoute user={user}>
                                    <SEORanking />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/report-page"
                            element={
                                <ProtectedRoute user={user}>
                                    <ReportPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ssl-mismatch-checker"
                            element={
                                <ProtectedRoute user={user}>
                                    <SSLMismatch />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                )}
            </Routes>
        </Router>
    );
};

export default App;
