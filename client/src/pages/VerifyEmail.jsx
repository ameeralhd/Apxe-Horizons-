import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import LandingLayout from '../components/LandingLayout';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Activating your account...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Token is missing.');
            return;
        }

        const verifyToken = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Connection error. Please try again later.');
            }
        };

        verifyToken();
    }, [token]);

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
                    borderRadius: '24px',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    border: '1px solid #F1F5F9'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: status === 'error' ? '#FEF2F2' : '#F0FDFA',
                        color: status === 'error' ? '#EF4444' : '#2DD4BF',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px'
                    }}>
                        {status === 'verifying' && <Loader2 size={40} className="animate-spin" />}
                        {status === 'success' && <CheckCircle size={40} />}
                        {status === 'error' && <XCircle size={40} />}
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '16px' }}>
                        {status === 'verifying' ? 'Verifying Account' :
                            status === 'success' ? 'Account Verified!' : 'Verification Failed'}
                    </h1>

                    <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '32px' }}>
                        {message}
                    </p>

                    {status !== 'verifying' && (
                        <Link
                            to="/login"
                            className="btn"
                            style={{
                                width: '100%',
                                background: status === 'error' ? '#1E293B' : '#2DD4BF',
                                color: status === 'error' ? 'white' : '#1E293B',
                                fontWeight: 800,
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {status === 'success' ? (
                                <>Go to Login <ArrowRight size={18} /></>
                            ) : 'Back to Login'}
                        </Link>
                    )}
                </div>
            </div>
        </LandingLayout>
    );
}
