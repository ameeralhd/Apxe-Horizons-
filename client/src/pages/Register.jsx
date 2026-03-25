import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { User, Mail, Phone, Lock, UserPlus, ArrowLeft, Check, X, Chrome } from 'lucide-react';
import confetti from 'canvas-confetti';
import { countries } from '../data/countries';
import { getApiUrl } from '../utils/apiConfig';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+1',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const passwordRules = [
        { label: 'Minimum 8 characters', test: (p) => p.length >= 8 },
        { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'Include a number', test: (p) => /\d/.test(p) },
        { label: 'Special character', test: (p) => /[@$!%*?&]/.test(p) },
    ];


    const validatePassword = (pwd) => {
        return passwordRules.every(rule => rule.test(pwd));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email address';
        if (!formData.phone.match(/^\d{7,15}$/)) newErrors.phone = 'Should be 7-15 digits';

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!validatePassword(formData.password)) {
            newErrors.password = 'Password requirements not met';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: `${formData.countryCode} ${formData.phone}`,
                    password: formData.password
                })
            });
            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                console.error("JSON parse error on register:", jsonErr);
                throw new Error("Server returned an invalid response. Please check your connection or contact support.");
            }
            if (!res.ok) throw new Error(data.message);

            setIsSuccess(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2DD4BF', '#1E293B', '#ffffff']
            });
            setTimeout(() => {
                navigate('/login', { state: { email: formData.email, registrationSuccess: true } });
            }, 2000);
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

            if (!res.ok) throw new Error(data.message || 'Google signup failed');

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
            {/* Left Side: Brand Visuals (Consistent with Login) */}
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

                    <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, marginBottom: 'var(--space-8)', color: 'white', lineHeight: 1.1 }}>
                        Start Your Global Future Today.
                    </h2>

                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        padding: '32px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        marginTop: 'var(--space-12)'
                    }}>
                        <p style={{ fontSize: '18px', color: 'white', lineHeight: 1.6, marginBottom: '24px', fontStyle: 'italic' }}>
                            "Joining took 2 minutes, but it changed my entire career path. The level of guidance here is truly elite."
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2DD4BF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1E293B' }}>S</div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Siti Sarah</p>
                                <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>Verified Scholar • Malaysia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'var(--space-8)',
                background: 'white',
                overflowY: 'auto'
            }}>
                <div style={{ width: '100%', maxWidth: '480px', margin: 'var(--space-8) auto' }}>
                    <div className="animate-fade-in">
                        <Link to="/" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            color: 'var(--color-text-dim)',
                            marginBottom: 'var(--space-6)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600
                        }}>
                            <ArrowLeft size={16} /> Back to Home
                        </Link>

                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--color-slate)', marginBottom: 'var(--space-2)' }}>Create Account</h1>
                            <p style={{ color: 'var(--color-text-body)', fontSize: 'var(--text-md)' }}>
                                Be part of the elite international platform.
                            </p>
                        </div>

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

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>First Name</label>
                                    <input
                                        className="input"
                                        style={{ height: '48px', borderRadius: '10px', background: '#F8FAFC', padding: '0 16px', border: errors.firstName ? '1px solid #E11D48' : '1px solid #E2E8F0' }}
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                    {errors.firstName && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Last Name</label>
                                    <input
                                        className="input"
                                        style={{ height: '48px', borderRadius: '10px', background: '#F8FAFC', padding: '0 16px', border: errors.lastName ? '1px solid #E11D48' : '1px solid #E2E8F0' }}
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                    {errors.lastName && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type="email"
                                        className="input"
                                        style={{ paddingLeft: '44px', height: '48px', borderRadius: '10px', background: '#F8FAFC', border: errors.email ? '1px solid #E11D48' : '1px solid #E2E8F0' }}
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                {errors.email && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.email}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Phone Number</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        style={{
                                            width: '130px',
                                            height: '48px',
                                            borderRadius: '10px',
                                            background: '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            padding: '0 8px',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}
                                        value={formData.countryCode}
                                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                    >
                                        {countries.map(c => (
                                            <option key={`${c.code}-${c.dial_code}`} value={c.dial_code}>
                                                {c.name} ({c.dial_code})
                                            </option>
                                        ))}
                                    </select>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                        <input
                                            type="tel"
                                            className="input"
                                            style={{ paddingLeft: '44px', height: '48px', borderRadius: '10px', background: '#F8FAFC', border: errors.phone ? '1px solid #E11D48' : '1px solid #E2E8F0' }}
                                            placeholder="123 456 789"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                {errors.phone && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.phone}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Create Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type="password"
                                        className="input"
                                        style={{ paddingLeft: '44px', height: '48px', borderRadius: '10px', background: '#F8FAFC', border: errors.password ? '1px solid #E11D48' : '1px solid #E2E8F0' }}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onFocus={() => setShowPasswordRules(true)}
                                        required
                                    />
                                    {errors.password && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.password}</p>}
                                </div>

                                {showPasswordRules && (
                                    <div style={{ marginTop: 'var(--space-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', animation: 'slideDown 0.3s ease' }}>
                                        {passwordRules.map((rule, idx) => {
                                            const passed = rule.test(formData.password);
                                            return (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-1)',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: passed ? '#059669' : '#94A3B8'
                                                }}>
                                                    <div style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        borderRadius: '50%',
                                                        background: passed ? '#D1FAE5' : '#F1F5F9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: passed ? '#059669' : '#94A3B8',
                                                        transition: 'all 0.3s'
                                                    }}>
                                                        {passed ? <Check size={10} /> : <X size={10} />}
                                                    </div>
                                                    {rule.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                                    <input
                                        type="password"
                                        className="input"
                                        style={{ paddingLeft: '44px', height: '48px', borderRadius: '10px', background: '#F8FAFC', border: errors.confirmPassword ? '1px solid #E11D48' : '1px solid #E2E8F0' }}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                    {errors.confirmPassword && <p style={{ fontSize: '11px', color: '#E11D48', marginTop: '4px', fontWeight: 600 }}>{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn"
                                style={{
                                    marginTop: 'var(--space-4)',
                                    width: '100%',
                                    height: '52px',
                                    background: isSuccess ? '#059669' : 'var(--color-primary)',
                                    color: isSuccess ? 'white' : 'var(--color-slate)',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: 'var(--text-md)',
                                    boxShadow: isSuccess ? '0 8px 20px rgba(5, 150, 105, 0.25)' : '0 8px 20px rgba(45, 212, 191, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    transition: 'all 0.3s'
                                }}
                                disabled={loading || isSuccess}
                            >
                                {isSuccess ? (
                                    <>Success! Welcome to Apex Horizons <Check size={20} /></>
                                ) : loading ? (
                                    <><div className="spinner"></div> Creating Account...</>
                                ) : (
                                    <>Register Account <UserPlus size={20} /></>
                                )}
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
                            disabled={loading || isSuccess}
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
                                cursor: (loading || isSuccess) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: (loading || isSuccess) ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => !(loading || isSuccess) && (e.target.style.background = '#F8FAFC')}
                            onMouseLeave={(e) => !(loading || isSuccess) && (e.target.style.background = 'white')}
                        >
                            {loading ? <div className="spinner"></div> : <Chrome size={18} />}
                            Sign in with Google
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)' }}>
                            Already have an account? {' '}
                            <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>Login here</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Styles */}
            <style>
                {`
                    @media (max-width: 768px) {
                        .hide-on-mobile { display: none !important; }
                    }
                    .spinner {
                        width: 18px;
                        height: 18px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
}
