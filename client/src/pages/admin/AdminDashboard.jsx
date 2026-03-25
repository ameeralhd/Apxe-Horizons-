import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileCheck, Calendar, TrendingUp, DollarSign, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import '../../admin-enhanced.css';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState({
        totalStudents: 0,
        pendingDocuments: 0,
        verifiedDocuments: 0,
        rejectedDocuments: 0,
        upcomingAppointments: 0,
        newStudents: 0,
        consultationsToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setAnalytics(data);
            } else {
                throw new Error(data.message || 'Failed to fetch analytics');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div className="admin-error-container" style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#E11D48', marginBottom: '16px' }}>Error Loading Dashboard</h3>
                <p style={{ color: '#64748B', marginBottom: '24px' }}>{error}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="btn"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-slate)' }}
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Students',
            value: analytics?.totalStudents || 0,
            growth: `+${analytics?.newStudents || 0} this month`,
            isPositive: true,
            icon: <Users size={28} />,
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
            label: 'Pending Documents',
            value: analytics?.pendingDocuments || 0,
            growth: 'Awaiting review',
            isNeutral: true,
            icon: <FileCheck size={28} />,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
            label: 'Verified Documents',
            value: analytics?.verifiedDocuments || 0,
            growth: `${analytics?.rejectedDocuments || 0} rejected`,
            isPositive: true,
            icon: <TrendingUp size={28} />,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            label: 'Upcoming Consultations',
            value: analytics?.upcomingAppointments || 0,
            growth: 'Scheduled sessions',
            isNeutral: true,
            icon: <Calendar size={28} />,
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.1)'
        }
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome to your command center</p>
            </div>

            {/* Stats Grid - 4 Columns */}
            <div className="stats-grid-4">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card-enhanced">
                        <div className="stat-card-header">
                            <div className="stat-icon-enhanced" style={{ background: stat.bgColor, color: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <p className="stat-label-enhanced">{stat.label}</p>
                            <h3 className="stat-value-enhanced">{stat.value}</h3>
                            <p className={`stat-growth ${stat.isPositive ? 'positive' : stat.isNeutral ? 'neutral' : 'negative'}`}>
                                {stat.isPositive && <ArrowUp size={14} />}
                                {stat.growth}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Split Layout: Quick Actions (70%) + Recent Activity (30%) */}
            <div className="dashboard-split">
                {/* Quick Actions - Left 70% */}
                <div className="dashboard-left">
                    <div className="admin-card">
                        <h3 className="section-title">Quick Actions</h3>
                        <div className="quick-actions-tiles">
                            <Link to="/admin/verification" className="action-tile">
                                <div className="action-tile-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                    <FileCheck size={32} />
                                </div>
                                <h4>Review Documents</h4>
                                <p className="action-tile-count">{analytics?.pendingDocuments || 0} pending</p>
                            </Link>
                            <Link to="/admin/applicants" className="action-tile">
                                <div className="action-tile-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <Users size={32} />
                                </div>
                                <h4>View Applicants</h4>
                                <p className="action-tile-count">Manage students</p>
                            </Link>
                            <Link to="/admin/consultants" className="action-tile">
                                <div className="action-tile-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                    <Calendar size={32} />
                                </div>
                                <h4>Manage Consultants</h4>
                                <p className="action-tile-count">Update availability</p>
                            </Link>
                            <Link to="/admin/resource-templates" className="action-tile">
                                <div className="action-tile-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    <DollarSign size={32} />
                                </div>
                                <h4>Resource Hub</h4>
                                <p className="action-tile-count">Manage templates</p>
                            </Link>
                            <Link to="/admin/reviews" className="action-tile">
                                <div className="action-tile-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24' }}>
                                    <MessageSquare size={32} />
                                </div>
                                <h4>Moderate Reviews</h4>
                                <p className="action-tile-count">Approve testimonials</p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity - Right 30% */}
                <div className="dashboard-right">
                    <div className="admin-card">
                        <h3 className="section-title">Recent Activity</h3>
                        <div className="activity-timeline">
                            <div className="activity-item-timeline">
                                <div className="activity-dot new"></div>
                                <div className="activity-content-timeline">
                                    <p className="activity-text"><strong>New student registered</strong></p>
                                    <p className="activity-timestamp">2 hours ago</p>
                                </div>
                            </div>
                            <div className="activity-item-timeline">
                                <div className="activity-dot upload"></div>
                                <div className="activity-content-timeline">
                                    <p className="activity-text"><strong>Document uploaded</strong></p>
                                    <p className="activity-timestamp">5 hours ago</p>
                                </div>
                            </div>
                            <div className="activity-item-timeline">
                                <div className="activity-dot booking"></div>
                                <div className="activity-content-timeline">
                                    <p className="activity-text"><strong>Consultation booked</strong></p>
                                    <p className="activity-timestamp">1 day ago</p>
                                </div>
                            </div>
                            <div className="activity-item-timeline">
                                <div className="activity-dot verified"></div>
                                <div className="activity-content-timeline">
                                    <p className="activity-text"><strong>Document verified</strong></p>
                                    <p className="activity-timestamp">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
