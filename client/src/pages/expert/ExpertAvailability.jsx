import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Save,
    ArrowLeft,
    CheckCircle,
    LayoutDashboard,
    DollarSign,
    Users,
    LogOut,
    Plus,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExpertAvailability() {
    const navigate = useNavigate();
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/consultants/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // If it's a JSON field, use it directly or defaults
                setAvailability(data.availability || {});
            }
            setLoading(false);
        } catch (error) {
            console.error('Fetch error:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/expert/availability', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ availability })
            });

            if (res.ok) {
                setNotification({ text: "Schedule updated successfully!", type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day) => {
        setAvailability(prev => {
            const next = { ...prev };
            if (next[day]) delete next[day];
            else next[day] = ["09:00", "17:00"];
            return next;
        });
    };

    const updateTime = (day, type, value) => {
        setAvailability(prev => ({
            ...prev,
            [day]: type === 'start' ? [value, prev[day][1]] : [prev[day][0], value]
        }));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <div className="status-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2DD4BF' }}></div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', background: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#2DD4BF', borderRadius: '8px' }}></div>
                    <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em' }}>EXPERT HUB</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/expert/dashboard')} />
                    <SidebarLink icon={<Calendar size={20} />} label="Schedule" active />
                    <SidebarLink icon={<DollarSign size={20} />} label="Earnings" />
                    <SidebarLink icon={<Users size={20} />} label="Student Profiles" />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <button
                            onClick={() => navigate('/expert/dashboard')}
                            style={{ background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}
                        >
                            <ArrowLeft size={16} /> BACK TO DASHBOARD
                        </button>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Schedule Manager</h1>
                    </div>
                    {notification && (
                        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, animation: 'slideDown 0.3s ease-out' }}>
                            <CheckCircle size={18} /> {notification.text}
                        </div>
                    )}
                </header>

                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '48px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', padding: '24px', background: '#F0FDFA', borderRadius: '24px', border: '1px solid #CCFBF1' }}>
                        <Clock color="#2DD4BF" size={32} />
                        <div>
                            <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>Weekly Work Hours</h3>
                            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>Set your availability window for each day. Students will see these hours when booking.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {days.map(day => {
                            const active = !!availability[day];
                            return (
                                <div key={day} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '24px', borderRadius: '24px', border: active ? '2px solid #2DD4BF' : '1px solid #E2E8F0',
                                    background: active ? 'white' : '#F8FAFC', transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <button
                                            onClick={() => toggleDay(day)}
                                            style={{
                                                width: '48px', height: '24px', borderRadius: '12px',
                                                background: active ? '#2DD4BF' : '#CBD5E1',
                                                position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '27px' : '3px', transition: 'all 0.2s' }}></div>
                                        </button>
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: active ? '#0F172A' : '#94A3B8', minWidth: '120px' }}>{day}</span>
                                    </div>

                                    {active ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <input
                                                type="time"
                                                value={availability[day][0]}
                                                onChange={(e) => updateTime(day, 'start', e.target.value)}
                                                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, color: '#1E293B', outline: 'none' }}
                                            />
                                            <span style={{ fontWeight: 800, color: '#94A3B8' }}>TO</span>
                                            <input
                                                type="time"
                                                value={availability[day][1]}
                                                onChange={(e) => updateTime(day, 'end', e.target.value)}
                                                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, color: '#1E293B', outline: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ color: '#94A3B8', fontWeight: 700, fontStyle: 'italic', fontSize: '14px' }}>OFFLINE</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            disabled={saving}
                            onClick={handleSave}
                            style={{
                                padding: '16px 40px', borderRadius: '16px', background: '#2DD4BF', color: '#1E293B',
                                border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '16px', display: 'flex',
                                alignItems: 'center', gap: '12px', boxShadow: '0 4px 14px rgba(45, 212, 191, 0.4)',
                                transition: 'all 0.2s', opacity: saving ? 0.7 : 1
                            }}
                        >
                            <Save size={20} /> {saving ? "SAVING..." : "SAVE SCHEDULE"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                background: active ? '#2DD4BF' : 'transparent',
                color: active ? '#1E293B' : '#94A3B8',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s'
            }}
        >
            {icon} {label}
        </button>
    );
}
