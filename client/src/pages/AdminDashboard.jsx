import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    ShieldCheck, TrendingUp, Users, Clock, AlertCircle,
    FileText, CheckCircle, X, Search, Calendar,
    File, DollarSign, User
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(false);

    // Mock data for display based on screenshot
    const stats = [
        { id: 'students', label: 'Total Students', value: '1', sub: '+1 this month', color: '#DBEAFE', icon: <Users size={18} color="#2563EB" /> },
        { id: 'pending', label: 'Pending Documents', value: '0', sub: 'Awaiting review', color: '#FEF3C7', icon: <FileText size={18} color="#B45309" /> },
        { id: 'verified', label: 'Verified Documents', value: '0', sub: '0 rejected', color: '#DCFCE7', icon: <CheckCircle size={18} color="#059669" /> },
        { id: 'upcoming', label: 'Upcoming Consultations', value: '0', sub: 'Scheduled sessions', color: '#F3E8FF', icon: <Calendar size={18} color="#7E22CE" /> }
    ];

    if (loading) return <Layout><div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>Loading Command Center...</div></Layout>;

    return (
        <Layout>
            <div className="container" style={{ padding: 'var(--space-10) 0' }}>
                <div style={{ marginBottom: 'var(--space-10)' }}>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: '#1e293b', marginBottom: 'var(--space-2)' }}>Admin Command Center</h1>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: '#1e293b' }}>Dashboard Overview</h2>
                    <p className="text-muted">Welcome to your command center</p>
                </div>

                {/* Stats Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
                    {stats.map(stat => (
                        <AdminStatCard
                            key={stat.id}
                            label={stat.label}
                            value={stat.value}
                            sub={stat.sub}
                            color={stat.color}
                            icon={stat.icon}
                        />
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: 'var(--space-10)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Quick Actions</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-8)' }}>
                        <QuickActionCard icon={<File size={32} />} label="Review Documents" sub="0 pending" link="/admin/verifications" />
                        <QuickActionCard icon={<Users size={32} />} label="View Applicants" sub="Manage students" link="/admin/users" />
                        <QuickActionCard icon={<Calendar size={32} />} label="Manage Consultants" sub="Update availability" link="/admin/consultants" />
                        <QuickActionCard icon={<DollarSign size={32} />} label="Revenue Analytics" sub="View sales data" link="/admin/revenue" />
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Recent Activity</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <ActivityItem icon={<User size={16} />} title="New student registered" time="2 hours ago" />
                        <ActivityItem icon={<FileText size={16} />} title="Document uploaded" time="5 hours ago" />
                        <ActivityItem icon={<Calendar size={16} />} title="Consultation booked" time="1 day ago" />
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function AdminStatCard({ label, value, sub, color, icon }) {
    return (
        <div style={{ padding: 'var(--space-4)', background: color, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ marginBottom: '4px' }}>{icon}</div>
            <p style={{ fontSize: 'var(--text-sm)', color: '#475569', fontWeight: 500 }}>{label}</p>
            <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#1e293b', margin: 0 }}>{value}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: '#64748b' }}>{sub}</p>
        </div>
    );
}

function QuickActionCard({ icon, label, sub, link }) {
    return (
        <Link to={link} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ color: '#1e293b' }}>{icon}</div>
            <div>
                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: '#1e293b', margin: 0 }}>{label}</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: '#64748b' }}>{sub}</p>
            </div>
        </Link>
    );
}

function ActivityItem({ icon, title, time }) {
    return (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ color: '#64748b', marginTop: '4px' }}>{icon}</div>
            <div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: '#64748b' }}>{time}</p>
            </div>
        </div>
    );
}
