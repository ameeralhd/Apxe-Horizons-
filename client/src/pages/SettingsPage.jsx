import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    User,
    Mail,
    Lock,
    Phone,
    Camera,
    Shield,
    Bell,
    Globe,
    LogOut,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        let user = {};
        try {
            if (storedUser && storedUser !== 'undefined') {
                user = JSON.parse(storedUser);
            }
        } catch (e) {
            user = {};
        }
        const names = (user.name || '').split(' ');
        setFormData(prev => ({
            ...prev,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || ''
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    password: formData.password || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            localStorage.setItem('user', JSON.stringify(data.user));
            setMessage('Account information updated successfully.');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Info', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> }
    ];

    return (
        <Layout>
            <section className="section" style={{ background: 'var(--color-bg-alt)', minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>

                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Account Settings</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Manage your profile, security settings, and preferences.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-8)' }}>

                        {/* Sidebar Navigation */}
                        <aside>
                            <div className="card" style={{ padding: 'var(--space-2)' }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            padding: 'var(--space-3) var(--space-4)',
                                            background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                                            color: activeTab === tab.id ? 'white' : 'var(--color-text)',
                                            borderRadius: 'var(--radius-md)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: activeTab === tab.id ? 600 : 400,
                                            textAlign: 'left'
                                        }}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                                <hr style={{ margin: 'var(--space-2) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                                <button
                                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: 'transparent',
                                        color: '#dc2626',
                                        borderRadius: 'var(--radius-md)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main>
                            {activeTab === 'profile' && (
                                <div className="card animate-fade-in" style={{ padding: 'var(--space-8)' }}>

                                    {/* Profile Header with Photo */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                background: 'var(--color-bg-alt)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--color-primary)',
                                                border: '2px solid var(--color-border)'
                                            }}>
                                                <User size={48} />
                                            </div>
                                            <button style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                border: '2px solid white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}>
                                                <Camera size={16} />
                                            </button>
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '4px' }}>{formData.firstName} {formData.lastName}</h2>
                                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Profile picture must be at least 400x400px</p>
                                        </div>
                                    </div>

                                    {message && (
                                        <div style={{
                                            background: '#f0fdf4', color: '#166534', padding: 'var(--space-4)',
                                            borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', border: '1px solid #bbf7d0'
                                        }}>
                                            <CheckCircle2 size={20} /> {message}
                                        </div>
                                    )}

                                    {error && (
                                        <div style={{
                                            background: '#fef2f2', color: '#991b1b', padding: 'var(--space-4)',
                                            borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', border: '1px solid #fecaca'
                                        }}>
                                            <AlertCircle size={20} /> {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                            <div>
                                                <label className="label">First Name</label>
                                                <input
                                                    className="input"
                                                    value={formData.firstName}
                                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Last Name</label>
                                                <input
                                                    className="input"
                                                    value={formData.lastName}
                                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">Email Address</label>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                                <input
                                                    className="input"
                                                    style={{ paddingLeft: '36px', background: 'var(--color-bg-alt)', cursor: 'not-allowed' }}
                                                    value={formData.email}
                                                    disabled
                                                />
                                            </div>
                                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Email cannot be changed online. Contact support for assistance.</p>
                                        </div>

                                        <div>
                                            <label className="label">Phone Number</label>
                                            <div style={{ position: 'relative' }}>
                                                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                                <input
                                                    className="input"
                                                    style={{ paddingLeft: '36px' }}
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: 'fit-content', paddingLeft: 'var(--space-8)', paddingRight: 'var(--space-8)' }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="card animate-fade-in" style={{ padding: 'var(--space-8)' }}>
                                    <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Update Password</h2>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                                        <div>
                                            <label className="label">New Password</label>
                                            <input
                                                type="password"
                                                className="input"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Min 8 characters"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="input"
                                                value={formData.confirmPassword}
                                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="card animate-fade-in" style={{ padding: 'var(--space-8)' }}>
                                    <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Email Notifications</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <NotificationToggle label="Session Reminders" desc="Receive emails about upcoming consultations." defaultChecked />
                                        <NotificationToggle label="Verification Updates" desc="Get notified when document status changes." defaultChecked />
                                        <NotificationToggle label="System Announcements" desc="Important updates from Apex Horizons." />
                                    </div>
                                </div>
                            )}

                        </main>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

function NotificationToggle({ label, desc, defaultChecked }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ fontWeight: 600, marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
            <input type="checkbox" defaultChecked={defaultChecked} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>
    );
}
