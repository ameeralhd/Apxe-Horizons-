import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    DollarSign,
    Users,
    Star,
    Bell,
    LogOut,
    ChevronRight,
    ExternalLink,
    Video,
    User,
    Clock,
    TrendingUp,
    FileText,
    CheckCircle,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiConfig';

export default function ExpertDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New booking received for Tomorrow", type: 'booking' },
        { id: 2, text: "Your latest review is live", type: 'review' }
    ]);
    const [showStudentModal, setShowStudentModal] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsRes, sessionsRes] = await Promise.all([
                fetch(getApiUrl('/api/expert/stats'), { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(getApiUrl('/api/expert/sessions'), { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (statsRes.ok && sessionsRes.ok) {
                const statsData = await statsRes.json();
                const sessionsData = await sessionsRes.json();
                setStats(statsData);
                setSessions(sessionsData);
            }
            setLoading(false);
        } catch (error) {
            console.error('Data fecth error:', error);
            setLoading(false);
        }
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
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <SidebarLink icon={<Calendar size={20} />} label="Schedule" onClick={() => navigate('/expert/availability')} />
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
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Expert Command Center</h1>
                        <p style={{ color: '#64748B', marginTop: '4px' }}>Welcome back, {JSON.parse(localStorage.getItem('user'))?.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell color="#64748B" />
                            <div style={{ position: 'absolute', top: -4, right: -4, width: '12px', height: '12px', background: '#2DD4BF', borderRadius: '50%', border: '2px solid white' }}></div>
                        </div>
                    </div>
                </header>

                {/* Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

                    {/* Left Column: Earnings & Upcoming */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Earnings Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <StatCard
                                label="Monthly Revenue"
                                value={`$${stats?.revenue?.monthly || '0.00'}`}
                                icon={<DollarSign color="#2DD4BF" />}
                                trend="+12.5%"
                            />
                            <StatCard
                                label="Pending Payouts"
                                value={`$${stats?.revenue?.pending || '0.00'}`}
                                icon={<Clock color="#F59E0B" />}
                                trend="Processing"
                            />
                        </div>

                        {/* Earnings Growth Chart (Simple SVG) */}
                        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Earnings Growth</h3>
                                <TrendingUp size={18} color="#2DD4BF" />
                            </div>
                            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                                <svg viewBox="0 0 1000 200" style={{ width: '100%', height: '100%' }}>
                                    <path
                                        d="M0,180 Q100,160 200,150 T400,120 T600,90 T800,60 T1000,20"
                                        fill="none"
                                        stroke="#2DD4BF"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="path-animate"
                                    />
                                    <path
                                        d="M0,180 Q100,160 200,150 T400,120 T600,90 T800,60 T1000,20 V200 H0 Z"
                                        fill="url(#gradient)"
                                        opacity="0.1"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2DD4BF" />
                                            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>
                                    <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews (Compact) */}
                        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ margin: '0 0 24px 0', fontWeight: 800 }}>Recent Feedback</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {stats?.recentReviews?.length > 0 ? stats.recentReviews.map(r => (
                                    <div key={r.id} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1E293B' }}>
                                            {r.User?.name?.[0]}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? "#F59E0B" : "none"} color="#F59E0B" />)}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{r.comment}"</p>
                                        </div>
                                    </div>
                                )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>No recent reviews found.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sessions & Performance */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Rating Card */}
                        <div style={{ background: '#1E293B', padding: '32px', borderRadius: '24px', color: 'white', textAlign: 'center' }}>
                            <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Professional Rating</p>
                            <div style={{ fontSize: '48px', fontWeight: 900, margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                {stats?.stats?.averageRating || '5.0'}
                                <Star size={40} fill="#FBBF24" color="#FBBF24" />
                            </div>
                            <p style={{ color: '#2DD4BF', fontWeight: 600 }}>{stats?.stats?.reviewCount || 0} Verified Reviews</p>
                        </div>

                        {/* Upcoming Sessions List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Upcoming</h3>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2DD4BF' }}>SEE CALENDAR</span>
                            </div>

                            {sessions.filter(s => s.status === 'confirmed' || s.status === 'paid').map(s => (
                                <SessionCard
                                    key={s.id}
                                    session={s}
                                    onViewStudent={() => setShowStudentModal(s)}
                                />
                            ))}

                            {sessions.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                                    <p style={{ color: '#94A3B8', fontSize: '14px' }}>No upcoming sessions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Preview Modal */}
            {showStudentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', animation: 'modalEntry 0.3s ease-out' }}>
                        <div style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#F8FAFC' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Student Insight</h2>
                                <p style={{ color: '#64748B', margin: '4px 0 0 0' }}>Review documents before the meeting</p>
                            </div>
                            <button onClick={() => setShowStudentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '24px', background: '#2DD4BF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 900 }}>
                                    {showStudentModal.User?.name?.[0]}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{showStudentModal.User?.name}</h4>
                                    <p style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px' }}>
                                        <FileText size={16} /> Verification: {showStudentModal.User?.verificationStatus || 0}% Complete
                                    </p>
                                </div>
                            </div>

                            <h5 style={{ fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>Session Documents</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {showStudentModal.documentPath ? (
                                    <a
                                        href={`/api/documents/view/${showStudentModal.id}`} // Adjust to your actual viewer API
                                        target="_blank"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F0FDFA', border: '1px solid #5EEAD4', borderRadius: '16px', color: '#0D9488', textDecoration: 'none', fontWeight: 700 }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileText size={20} /> Application Brief.pdf
                                        </div>
                                        <ExternalLink size={18} />
                                    </a>
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0', color: '#94A3B8', fontSize: '14px' }}>
                                        No documents attached for this session.
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '32px', padding: '24px', background: '#EFF6FF', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
                                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800, color: '#1E40AF' }}>Notes for Expert</h5>
                                <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px', lineHeight: 1.5 }}>
                                    {showStudentModal.notes || "No special instructions provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

function StatCard({ label, value, icon, trend }) {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{ fontSize: '12px', fontWeight: 800, color: trend.includes('+') ? '#10B981' : '#64748B', padding: '4px 8px', background: trend.includes('+') ? '#D1FAE5' : '#F1F5F9', borderRadius: '20px', height: 'fit-content' }}>
                        {trend}
                    </span>
                )}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>{label}</div>
        </div>
    );
}

function SessionCard({ session, onViewStudent }) {
    const isNow = () => {
        // Mock join activation: within 5 mins of start
        const sessionDate = new Date(`${session.date}T${session.time}`);
        const now = new Date();
        const diff = (sessionDate - now) / (1000 * 60);
        return diff <= 5 && diff >= -60;
    };

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: '6px', fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>
                        {session.Service?.title || 'General'}
                    </div>
                    {isNow() && <div className="status-pulse" style={{ width: '8px', height: '8px', background: '#2DD4BF', borderRadius: '50%' }}></div>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{new Date(session.date).toLocaleDateString()}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#1E293B' }}>
                    {session.User?.name?.[0]}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>{session.User?.name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{session.time.substring(0, 5)} PM</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                    onClick={onViewStudent}
                    style={{ padding: '12px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <User size={14} /> Profile
                </button>
                <button
                    disabled={!isNow() && !session.meetingLink}
                    onClick={() => session.meetingLink && window.open(session.meetingLink)}
                    style={{
                        padding: '12px', borderRadius: '12px',
                        background: isNow() || session.meetingLink ? '#2DD4BF' : '#F1F5F9',
                        color: isNow() || session.meetingLink ? '#1E293B' : '#94A3B8',
                        border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    <Video size={14} /> Join Now
                </button>
            </div>
        </div>
    );
}

