import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, Chrome, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isBackHovered, setIsBackHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [registrationSuccess, setRegistrationSuccess] = useState(location.state?.registrationSuccess || false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password
                })
            });
            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                console.error("JSON parse error:", jsonErr);
                throw new Error("Server returned an invalid response. Please check your connection or contact support.");
            }
            
            if (!res.ok) {
                throw new Error(data.message || "An error occurred during login.");
            }

            if (formData.rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else if (data.user.role === 'consultant') {
                navigate('/consultant/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setErrors({ global: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        setLoading(true);
        setErrors({});
        try {
            const res = await fetch(getApiUrl('/api/auth/google'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: tokenResponse.access_token })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Google login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setErrors({ global: err.message });
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (error) => setErrors({ global: 'Google Sign-In failed' })
    });

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'row',
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Left Side: Brand Visuals (Hidden on Mobile) */}
            <div style={{
                flex: 1,
                position: 'relative',
                background: 'var(--color-slate)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-12)',
                color: 'white',
                overflow: 'hidden'
            }} className="hide-on-mobile">
                {/* Background Image Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("/images/hero_concept.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.3,
                    zIndex: 1
                }}></div>

                {/* Content Overlay */}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '440px' }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: 'var(--space-12)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 800,
                        textDecoration: 'none'
                    }}>
                        <span style={{ color: 'var(--color-primary)' }}>Apex</span> Horizons
                    </Link>

                    {/* Dummy Background Nav to clean up typography */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', opacity: 0.6 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Home</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Services</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Global Study</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Contact</span>
                    </div>

                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, marginBottom: 'var(--space-6)', color: 'white', lineHeight: 1.2 }}>
                        Your Global Academic Journey Starts Here.
                    </h2>
                    <p style={{ fontSize: 'var(--text-lg)', opacity: 0.8, lineHeight: 1.6 }}>
                        Access elite guidance for scholarships, careers, and international applications with trust and clarity.
                    </p>

                    <div style={{ marginTop: 'var(--space-16)', display: 'flex', gap: 'var(--space-8)' }}>
                        <div>
                            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>5k+</p>
                            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Stories</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>98%</p>
                            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'var(--space-8)',
                background: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <div className="animate-fade-in">
                        <Link
                            to="/"
                            onMouseEnter={() => setIsBackHovered(true)}
                            onMouseLeave={() => setIsBackHovered(false)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                color: 'var(--color-text-dim)',
                                marginBottom: 'var(--space-8)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 600,
                                transition: 'all 0.3s',
                                transform: isBackHovered ? 'translateX(-3px)' : 'translateX(0)'
                            }}
                        >
                            <ArrowLeft size={16} /> Back to Home
                        </Link>

                        <div style={{ marginBottom: 'var(--space-8)' }}>
                            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--color-slate)', marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
                            {new URLSearchParams(window.location.search).get('expired') === 'true' && (
                                <div style={{ background: '#FFF7ED', color: '#C2410C', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', fontWeight: 600, border: '1px solid #FFEDD5' }}>
                                    Your session has expired. Please sign in again.
                                </div>
                            )}
                            <p style={{ color: 'var(--color-text-body)', fontSize: 'var(--text-md)' }}>
                                Sign in to your professional portal.
                            </p>
                        </div>

                        {registrationSuccess && (
                            <div style={{
                                background: '#F0FDFA',
                                color: '#0D9488',
                                padding: 'var(--space-4)',
                                borderRadius: '12px',
                                fontSize: 'var(--text-md)',
                                marginBottom: 'var(--space-6)',
                                border: '1px solid #CCFBF1',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <CheckCircle2 size={20} /> Successfuly registered! You can now log in.
                            </div>
                        )}

                        {errors.global && (
                            <div style={{
                                background: '#FFF1F2',
                                color: '#E11D48',
                                padding: 'var(--space-4)',
                                borderRadius: '12px',
                                fontSize: 'var(--text-sm)',
                                marginBottom: 'var(--space-6)',
                                border: '1px solid #FFE4E6',
                                fontWeight: 500
                            }}>
                                {errors.global}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type="email"
                                        className="input"
                                        style={{
                                            paddingLeft: '44px',
                                            height: '52px',
                                            borderRadius: '12px',
                                            border: errors.email ? '1px solid #E11D48' : '1px solid #E2E8F0',
                                            background: '#F8FAFC'
                                        }}
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                {errors.email && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.email}</p>}
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Password</label>
                                    <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-secondary)', fontWeight: 600 }}>Forgot password?</Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input"
                                        style={{
                                            paddingLeft: '44px',
                                            paddingRight: '44px',
                                            height: '52px',
                                            borderRadius: '12px',
                                            border: errors.password ? '1px solid #E11D48' : '1px solid #E2E8F0',
                                            background: '#F8FAFC'
                                        }}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-dim)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.password}</p>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    style={{ width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
                                />
                                <label htmlFor="rememberMe" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-dim)', cursor: 'pointer' }}>
                                    Remember me on this device
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn"
                                style={{
                                    marginTop: 'var(--space-2)',
                                    width: '100%',
                                    height: '52px',
                                    background: 'var(--color-primary)',
                                    color: 'var(--color-slate)',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: 'var(--text-md)',
                                    boxShadow: '0 8px 20px rgba(45, 212, 191, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                                disabled={loading}
                            >
                                {loading ? <><div className="spinner"></div> Signing in...</> : <>Sign In to Account <LogIn size={18} /></>}
                            </button>
                        </form>

                        <div style={{ margin: 'var(--space-6) 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '52px',
                                background: 'white',
                                color: '#1E293B',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: 'var(--text-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.background = '#F8FAFC')}
                            onMouseLeave={(e) => !loading && (e.target.style.background = 'white')}
                        >
                            {loading ? <div className="spinner"></div> : <Chrome size={18} />}
                            Sign in with Google
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 'var(--space-10)', fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)' }}>
                            Don't have an account yet? {' '}
                            <Link to="/register" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>Create an account</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Styles (Inline/Global) */}
            <style>
                {`
                    @media (max-width: 768px) {
                        .hide-on-mobile { display: none !important; }
                    }
                    .spinner {
                        width: 18px;
                        height: 18px;
                        border: 2px solid rgba(0,0,0,0.1);
                        border-top-color: #1E293B;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
}
