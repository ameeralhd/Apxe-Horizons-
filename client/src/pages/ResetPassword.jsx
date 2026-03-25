import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import LandingLayout from '../components/LandingLayout';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Token is missing.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Server connection error');
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
                            <ShieldCheck size={32} />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>
                            Reset Password
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>
                            Create a secure new password for your account.
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
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
                                disabled={isSubmitting || !token}
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
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (
                                    <>
                                        Save Password <Save size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#F0FDFA', color: '#115E59', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, marginBottom: '8px' }}>
                                    <CheckCircle size={20} /> Success!
                                </div>
                                <p style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.8 }}>
                                    Your password has been reset. Redirecting to login...
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
