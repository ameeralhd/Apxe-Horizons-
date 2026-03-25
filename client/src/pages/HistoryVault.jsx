import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, User, CreditCard, Download, CheckCircle2, Star, Clock, FileText, ChevronRight } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

export default function HistoryVault() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);

    const handleDownloadReceipt = async (payment) => {
        const btn = document.activeElement;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="spinner-small"></div>';
        btn.disabled = true;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${payment.appointmentId || payment.id}/receipt`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Receipt-INV-${payment.id + 1000}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert('Could not download receipt. Please try again later.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    const fetchBookings = () => {
        const token = localStorage.getItem('token');
        fetch('/api/appointments', {
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

        // Check for completed sessions to auto-trigger review
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

    return (
        <Layout>
            <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: 'var(--space-12) 0' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ marginBottom: 'var(--space-10)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2DD4BF', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                            <FileText size={14} /> Student Records
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1E293B', margin: 0 }}>History Vault</h1>
                        <p style={{ color: '#64748B', fontWeight: 500, marginTop: '4px' }}>Access your sessions, payment receipts, and academic records.</p>
                    </div>

                    {/* Tab Switcher */}
                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: 'var(--space-8)',
                        borderBottom: '1px solid #E2E8F0',
                        paddingBottom: '2px'
                    }}>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            style={{
                                padding: '12px 4px',
                                borderBottom: activeTab === 'bookings' ? '3px solid #0D9488' : '3px solid transparent',
                                background: 'transparent',
                                color: activeTab === 'bookings' ? '#0D9488' : '#94A3B8',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            My Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            style={{
                                padding: '12px 4px',
                                borderBottom: activeTab === 'payments' ? '3px solid #0D9488' : '3px solid transparent',
                                background: 'transparent',
                                color: activeTab === 'payments' ? '#0D9488' : '#94A3B8',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Payment Records
                        </button>
                    </div>

                    <div className="card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ fontWeight: 600 }}>Syncing your records...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'bookings' ? (
                                    <BookingsTable bookings={bookings} onLeaveReview={setSelectedReview} />
                                ) : (
                                    <PaymentsTable
                                        payments={bookings.filter(b => b.status === 'paid' || b.status === 'pending' || b.status === 'completed')}
                                        onDownload={handleDownloadReceipt}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {selectedReview && (
                <ReviewModal
                    appointment={selectedReview}
                    onClose={() => setSelectedReview(null)}
                    onSuccess={fetchBookings}
                />
            )}
        </Layout>
    );
}

function BookingsTable({ bookings, onLeaveReview }) {
    if (bookings.length === 0) return <EmptyState type="bookings" />;

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                        <th style={tableHeaderStyle}>Expert & Service</th>
                        <th style={tableHeaderStyle}>Schedule</th>
                        <th style={tableHeaderStyle}>Topic</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.id} style={tableRowStyle} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #F1F5F9' }}>
                                        <img
                                            src={booking.ConsultantProfile?.profileImage || `https://i.pravatar.cc/150?u=${booking.ConsultantProfile?.User?.name || 'Expert'}`}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '15px' }}>{booking.Service?.title || 'General Consultation'}</div>
                                        <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {booking.ConsultantProfile?.User?.name || 'Assigned Expert'}
                                            <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                            <span style={{ fontWeight: 700 }}>{booking.ConsultantProfile?.averageRating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '24px' }}>
                                <div style={{ fontWeight: 700, color: '#1E293B' }}>{booking.date}</div>
                                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{booking.time}</div>
                            </td>
                            <td style={{ padding: '24px' }}>
                                <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {booking.topic}
                                </div>
                            </td>
                            <td style={{ padding: '24px' }}>
                                <StatusBadge status={booking.status} />
                            </td>
                            <td style={{ padding: '24px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <JoinButton booking={booking} />
                                    {booking.status === 'completed' && (
                                        <button onClick={() => onLeaveReview(booking)} className="btn-small-gold">
                                            <Star size={14} fill="#F59E0B" /> Review
                                        </button>
                                    )}
                                    {booking.status === 'pending' && (
                                        <Link to={`/payment/${booking.id}`} className="btn-small-mint">Pay Now</Link>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PaymentsTable({ payments, onDownload }) {
    if (payments.length === 0) return <EmptyState type="payments" />;

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                        <th style={tableHeaderStyle}>Invoice ID</th>
                        <th style={tableHeaderStyle}>Service Selection</th>
                        <th style={tableHeaderStyle}>Session Date</th>
                        <th style={tableHeaderStyle}>Amount</th>
                        <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Receipt</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} style={tableRowStyle} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '24px' }}>
                                <div style={{ fontWeight: 800, color: '#1E293B' }}>#INV-{payment.id + 1000}</div>
                                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>TRANSACTION SUCCESS</div>
                            </td>
                            <td style={{ padding: '24px' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{payment.Service?.title || 'General Consultation'}</div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{payment.ConsultantProfile?.User?.name || 'Assigned Expert'}</p>
                            </td>
                            <td style={{ padding: '24px' }}>
                                <div style={{ fontSize: '14px', color: '#475569' }}>{payment.date}</div>
                            </td>
                            <td style={{ padding: '24px' }}>
                                <div style={{ fontWeight: 900, fontSize: '16px', color: '#0D9488' }}>${payment.Service?.price || '199.99'}</div>
                                <StatusBadge status={payment.status} />
                            </td>
                            <td style={{ padding: '24px', textAlign: 'right' }}>
                                {payment.status === 'paid' || payment.status === 'completed' ? (
                                    <button className="btn-receipt" onClick={() => onDownload(payment)}>
                                        <Download size={14} /> PDF
                                    </button>
                                ) : (
                                    <Link to={`/payment/${payment.id}`} style={{ fontSize: '12px', fontWeight: 700, color: '#B45309' }}>Complete Payment</Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusBadge({ status }) {
    const getColors = () => {
        switch (status) {
            case 'paid': return { bg: '#F0FDFA', text: '#0D9488', label: 'Paid' };
            case 'pending': return { bg: '#FFFBEB', text: '#B45309', label: 'Pending' };
            case 'completed': return { bg: '#EEF2FF', text: '#4F46E5', label: 'Completed' };
            case 'cancelled': return { bg: '#FEF2F2', text: '#B91C1C', label: 'Cancelled' };
            default: return { bg: '#F1F5F9', text: '#64748B', label: status };
        }
    };
    const colors = getColors();
    return (
        <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: colors.bg,
            color: colors.text
        }}>
            {colors.label}
        </span>
    );
}

function JoinButton({ booking }) {
    const sessionTime = new Date(`${booking.date} ${booking.time}`);
    const now = new Date();
    const diffMinutes = (sessionTime - now) / (1000 * 60);
    const isActive = diffMinutes <= 10 && diffMinutes > -60;

    if (isActive && booking.status === 'paid') {
        return (
            <a href={booking.meetingLink || 'https://meet.apexhorizons.com/live'} target="_blank" rel="noopener noreferrer" className="btn-join">
                Join Now
            </a>
        );
    }
    return null;
}

function EmptyState({ type }) {
    return (
        <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF', margin: '0 auto 1.5rem' }}>
                {type === 'bookings' ? <Calendar size={40} /> : <CreditCard size={40} />}
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>
                {type === 'bookings' ? 'No Bookings Yet' : 'No Transactions Found'}
            </h3>
            <p style={{ color: '#64748B', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                {type === 'bookings' ? 'Map out your academic future with top-tier consultants.' : 'Your financial history will appear here once you book a session.'}
            </p>
            <Link to="/consultation" className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '12px' }}>
                {type === 'bookings' ? 'Find an Expert' : 'Book First Session'}
            </Link>
        </div>
    );
}

const tableHeaderStyle = { padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableRowStyle = { borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' };
