import { useState } from 'react';
import { KeyRound, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingLayout from '../components/LandingLayout';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsSubmitting(false);
        }
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
                    maxWidth: '440px',
                    width: '100%',
                    background: 'white',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.05)',
                    border: '1px solid #F1F5F9'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#F0FDFA',
                            color: '#2DD4BF',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <KeyRound size={32} />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>
                            Forgot Password?
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>

                            {error && (
                                <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: '#2DD4BF',
                                    color: '#1E293B',
                                    fontWeight: 800,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                {isSubmitting ? 'Sending...' : (
                                    <>
                                        Send Reset Link <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#F0FDFA', color: '#115E59', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, marginBottom: '8px' }}>
                                    <CheckCircle size={20} /> Link Sent
                                </div>
                                <p style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.8 }}>
                                    Check your email for the reset link. It might take a minute to arrive.
                                </p>
                            </div>
                        </div>
                    )}

                    <Link to="/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#64748B',
                        fontSize: '14px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        marginTop: '32px'
                    }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </LandingLayout>
    );
}
