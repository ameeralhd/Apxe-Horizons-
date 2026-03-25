import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, User, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';
import { getApiUrl } from '../utils/apiConfig';

export default function MyBookingsPage() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);

    const fetchBookings = () => {
        const token = localStorage.getItem('token');
        fetch(getApiUrl('/api/appointments'), {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setBookings(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchBookings();

        // Check for "just completed" sessions to auto-trigger review
        const checkInterval = setInterval(() => {
            setBookings(prev => {
                const completedNoReview = prev.find(b =>
                    b.status === 'completed' &&
                    !localStorage.getItem(`review_prompted_${b.id}`)
                );

                if (completedNoReview) {
                    setSelectedReview(completedNoReview);
                    localStorage.setItem(`review_prompted_${completedNoReview.id}`, 'true');
                }
                return prev;
            });
        }, 10000);

        return () => clearInterval(checkInterval);
    }, [navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'green';
            case 'pending': return 'orange';
            case 'completed': return 'blue';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    return (
        <Layout>
            <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: 'var(--space-12) 0' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2DD4BF', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                <Calendar size={14} /> Student Dashboard
                            </div>
                            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1E293B', margin: 0 }}>My Consultations</h1>
                            <p style={{ color: '#64748B', fontWeight: 500, marginTop: '4px' }}>Manage your sessions with global academic experts.</p>
                        </div>
                        <Link to="/consultation" className="btn" style={{ background: '#2DD4BF', color: '#1E293B', padding: '12px 24px', fontWeight: 800, borderRadius: '12px', boxShadow: '0 4px 12px rgba(45, 212, 191, 0.2)' }}>
                            Book New Session
                        </Link>
                    </div>

                    <div className="card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ fontWeight: 600 }}>Syncing your records...</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF', margin: '0 auto 1.5rem' }}>
                                    <Calendar size={40} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
                                <p style={{ color: '#64748B', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Ready to start your journey? Connect with a specialist today to map out your academic future.</p>
                                <Link to="/consultation" className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '12px' }}>Find an Expert</Link>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Expert & Service</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Schedule</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Session Topic</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => (
                                            <tr key={booking.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                                                            {booking.status === 'completed' ? <CheckCircle2 size={24} /> : <User size={24} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '15px' }}>{booking.Service.title}</div>
                                                            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                {booking.ConsultantProfile.User.name}
                                                                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                                                <span style={{ color: '#1E293B', fontWeight: 700 }}>{booking.ConsultantProfile.averageRating || '5.0'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '24px' }}>
                                                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>{booking.date}</div>
                                                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{booking.time}</div>
                                                </td>
                                                <td style={{ padding: '24px' }}>
                                                    <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {booking.topic}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '24px' }}>
                                                    <span style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        background: booking.status === 'paid' ? '#F0FDFA' : booking.status === 'pending' ? '#FFFBEB' : booking.status === 'completed' ? '#EEF2FF' : '#FEF2F2',
                                                        color: booking.status === 'paid' ? '#0D9488' : booking.status === 'pending' ? '#B45309' : booking.status === 'completed' ? '#4F46E5' : '#B91C1C'
                                                    }}>
                                                        {booking.status === 'paid' ? 'Confirmed' : booking.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '24px', textAlign: 'right' }}>
                                                    {booking.status === 'pending' ? (
                                                        <Link to={`/payment/${booking.id}`} className="btn" style={{ background: '#2DD4BF', color: '#1E293B', padding: '8px 16px', fontSize: '12px', fontWeight: 800, borderRadius: '8px' }}>
                                                            Pay & Confirm
                                                        </Link>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                            {(() => {
                                                                const sessionTime = new Date(`${booking.date} ${booking.time}`);
                                                                const now = new Date();
                                                                const diffMinutes = (sessionTime - now) / (1000 * 60);
                                                                const isActive = diffMinutes <= 10 && diffMinutes > -60; // 10 mins before to 60 mins after

                                                                if (isActive && booking.status === 'paid') {
                                                                    return (
                                                                        <a
                                                                            href={booking.meetingLink || 'https://meet.apexhorizons.com/live'}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn pulse-mint"
                                                                            style={{
                                                                                background: '#2DD4BF',
                                                                                color: '#1E293B',
                                                                                padding: '8px 16px',
                                                                                fontSize: '12px',
                                                                                fontWeight: 900,
                                                                                borderRadius: '8px',
                                                                                boxShadow: '0 0 0 0 rgba(45, 212, 191, 0.7)',
                                                                                animation: 'pulse-mint 2s infinite'
                                                                            }}
                                                                        >
                                                                            Join Live Now
                                                                        </a>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                            {booking.status === 'completed' && (
                                                                <button
                                                                    onClick={() => setSelectedReview(booking)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '8px 16px',
                                                                        fontSize: '12px',
                                                                        color: '#F59E0B',
                                                                        background: '#FFFBEB',
                                                                        border: '1px solid #FEF3C7',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        fontWeight: 800,
                                                                        borderRadius: '8px'
                                                                    }}
                                                                >
                                                                    <Star size={14} fill="#F59E0B" /> Leave Review
                                                                </button>
                                                            )}
                                                            <Link to="/" className="btn" style={{ padding: '8px 16px', fontSize: '12px', color: '#64748B', background: '#F8FAFC', borderRadius: '8px', fontWeight: 700 }}>Details</Link>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedReview && (
                <ReviewModal
                    appointment={selectedReview}
                    onClose={() => setSelectedReview(null)}
                    onSuccess={() => {
                        fetchBookings();
                    }}
                />
            )}
        </Layout>
    );
}
