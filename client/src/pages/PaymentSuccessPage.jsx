import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Check, ArrowRight, Download, Calendar, User, ShoppingBag, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [bookingData, setBookingData] = useState(location.state?.booking || null);
    const [loading, setLoading] = useState(!bookingData);

    useEffect(() => {
        if (!bookingData) {
            // Ideally fetch the latest booking if state is missing
            const token = localStorage.getItem('token');
            // Mock fetch for demo if state is empty
            setBookingData({
                id: Math.floor(Math.random() * 1000) + 9000,
                amount: '199.99',
                consultantName: 'Dr. Sarah Al-Fayed',
                date: '2026-03-15',
                time: '14:00'
            });
            setLoading(false);
        }
    }, [bookingData]);

    return (
        <Layout>
            <style>
                {`
                    @keyframes scaleIn {
                        0% { transform: scale(0); opacity: 0; }
                        60% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes drawCheck {
                        0% { stroke-dashoffset: 100; }
                        100% { stroke-dashoffset: 0; }
                    }
                    .checkmark-circle {
                        animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    }
                    .checkmark-path {
                        stroke-dasharray: 100;
                        stroke-dashoffset: 100;
                        animation: drawCheck 0.5s 0.6s ease-out forwards;
                    }
                    .success-card {
                        animation: slideUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(30px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>

            <div style={{ minHeight: 'calc(100vh - 80px)', background: '#F8FAFC', padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div className="success-card" style={{ textAlign: 'center' }}>
                        {/* Animated Checkmark */}
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2.5rem' }}>
                            <svg className="checkmark-circle" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                                <circle cx="50" cy="50" r="45" fill="#F0FDFA" stroke="#2DD4BF" strokeWidth="2" />
                                <path
                                    className="checkmark-path"
                                    d="M30 50 L45 65 L70 35"
                                    fill="none"
                                    stroke="#0D9488"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#1E293B', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Payment Successful!
                        </h1>
                        <p style={{ fontSize: '18px', color: '#64748B', fontWeight: 500, marginBottom: '3rem' }}>
                            Your future is waiting. We've confirmed your session and sent a receipt to your email.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left', marginBottom: '3rem' }}>
                            {/* Transaction Summary */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 1.5rem', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShoppingBag size={14} /> Transaction Summary
                                </h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Order ID</div>
                                        <div style={{ fontWeight: 800, color: '#1E293B' }}>#AH-{bookingData?.id || '99283'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Amount Paid</div>
                                        <div style={{ fontWeight: 900, color: '#0D9488', fontSize: '20px' }}>${bookingData?.amount || '199.99'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Status</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0D9488', fontWeight: 700, fontSize: '14px' }}>
                                            <Check size={16} /> Paid in Full
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Summary */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 1.5rem', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={14} /> Session Details
                                </h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Expert</div>
                                            <div style={{ fontWeight: 700, color: '#1E293B' }}>{bookingData?.consultantName || 'Dr. Sarah Al-Fayed'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Scheduled For</div>
                                            <div style={{ fontWeight: 700, color: '#1E293B' }}>{bookingData?.date} at {bookingData?.time}</div>
                                        </div>
                                    </div>
                                    <Link to="/my-bookings" style={{ fontSize: '13px', color: '#0D9488', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', textDecoration: 'none' }}>
                                        Check Meeting Link <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="btn"
                                style={{
                                    padding: '18px 48px',
                                    background: '#2DD4BF',
                                    color: '#1E293B',
                                    borderRadius: '16px',
                                    fontWeight: 900,
                                    fontSize: '18px',
                                    boxShadow: '0 10px 25px rgba(45, 212, 191, 0.4)',
                                    width: '100%',
                                    maxWidth: '320px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Go to My Bookings <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={async (e) => {
                                    const btn = e.currentTarget;
                                    const originalText = btn.innerHTML;
                                    btn.innerHTML = '<div class="spinner-small"></div> Generating...';
                                    btn.disabled = true;

                                    try {
                                        const token = localStorage.getItem('token');
                                        const response = await fetch(`/api/appointments/${bookingData.id}/receipt`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `Receipt-INV-${bookingData.id + 1000}.pdf`;
                                        a.click();
                                    } catch (err) {
                                        console.error(err);
                                        alert('Receipt generation failed.');
                                    } finally {
                                        btn.innerHTML = originalText;
                                        btn.disabled = false;
                                    }
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748B',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#1E293B'}
                                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                            >
                                <Download size={18} /> Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
