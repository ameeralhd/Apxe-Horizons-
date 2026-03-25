import { useState } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LandingLayout from '../components/LandingLayout';
import { getApiUrl } from '../utils/apiConfig';

export default function VerificationPending() {
    const location = useLocation();
    const email = location.state?.email || 'your email';
    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        // Simulate API call for resending verification
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResent(true);
        setIsResending(false);
    };

    return (
        <LandingLayout>
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-8)',
                background: '#F8FAFC'
            }}>
                <div style={{
                    maxWidth: '480px',
                    width: '100%',
                    background: 'white',
                    padding: '48px',
                    borderRadius: '32px',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    border: '1px solid #F1F5F9'
                }}>
                    {/* Animated Envelope Icon */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#F0FDFA',
                        color: '#2DD4BF',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px',
                        position: 'relative'
                    }}>
                        <Mail size={40} className={resent ? "" : "animate-bounce"} />
                        {resent && (
                            <div style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: '#2DD4BF',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '4px'
                            }}>
                                <CheckCircle size={16} />
                            </div>
                        )}
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '16px' }}>
                        Check your inbox!
                    </h1>
                    <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '32px' }}>
                        We've sent a magic verification link to <strong style={{ color: '#1E293B' }}>{email}</strong>.
                        Click the link in that email to unlock your Apex Horizons dashboard.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link to="/login" className="btn btn-outline" style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 800,
                            padding: '14px'
                        }}>
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>

                        <button
                            onClick={handleResend}
                            disabled={isResending || resent}
                            className="btn"
                            style={{
                                width: '100%',
                                background: resent ? '#F0FDFA' : '#2DD4BF',
                                color: resent ? '#115E59' : '#1E293B',
                                fontWeight: 800,
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: resent ? '1px solid #2DD4BF44' : 'none'
                            }}
                        >
                            {isResending ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : resent ? (
                                <>Resent Successfully!</>
                            ) : (
                                <>Didn't get it? Resend Email</>
                            )}
                        </button>

                        {/* Developer Bypass */}
                        <button
                            onClick={async () => {
                                if (window.confirm('Developer Mode: Force verify this account?')) {
                                    try {
                                        const res = await fetch(getApiUrl('/api/auth/debug-verify'), {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email })
                                        });
                                        if (res.ok) {
                                            alert('Account verified! You can now log in.');
                                            window.location.href = '/login';
                                        }
                                    } catch (err) {
                                        alert('Verification failed. Use force_verify.js script.');
                                    }
                                }
                            }}
                            style={{
                                marginTop: '12px',
                                fontSize: '12px',
                                color: '#94A3B8',
                                background: 'none',
                                border: '1px dashed #E2E8F0',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            🔧 Developer: Skip Email Verification
                        </button>
                    </div>

                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                            Can't find it? Please check your <strong style={{ color: '#64748B' }}>Spam</strong> folder.
                        </p>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
