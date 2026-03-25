import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ShieldCheck, CreditCard, CheckCircle, Lock, Calendar, User, FileText } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

export default function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(getApiUrl(`/api/appointments/${id}`), {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setAppointment(data);
                if (data.status === 'paid') setSuccess(true);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert('Could not load appointment details');
                navigate('/dashboard');
            });
    }, [id, navigate]);

    const handlePayment = () => {
        setProcessing(true);
        const token = localStorage.getItem('token');

        // Simulate API call delay
        setTimeout(() => {
            fetch(getApiUrl(`/api/appointments/${id}/pay`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) {
                        navigate('/payment-success');
                    } else {
                        alert('Payment failed');
                    }
                })
                .finally(() => setProcessing(false));
        }, 2000);
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <Layout>
            <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: 'var(--space-12) 0' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <div style={{ marginBottom: 'var(--space-10)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2DD4BF', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                            <ShieldCheck size={14} /> Secure Payment Gateway
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1E293B', margin: 0 }}>Complete Your Booking</h1>
                        <p style={{ color: '#64748B', fontWeight: 500 }}>Securely finalize your consultation with {appointment.ConsultantProfile.User.name}.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
                        {/* Left Column: Payment Form */}
                        <div className="card" style={{ padding: 'var(--space-10)', borderRadius: '24px', background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 900, color: '#1E293B' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                                    <CreditCard size={20} />
                                </div>
                                Payment Method
                            </h3>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                                <button
                                    className="btn"
                                    onClick={() => setPaymentMethod('card')}
                                    style={{
                                        flex: 1,
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontWeight: 800,
                                        background: paymentMethod === 'card' ? '#2DD4BF' : '#F8FAFC',
                                        color: paymentMethod === 'card' ? '#1E293B' : '#64748B',
                                        border: paymentMethod === 'card' ? 'none' : '1px solid #E2E8F0'
                                    }}
                                >
                                    Credit Card
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => setPaymentMethod('paypal')}
                                    style={{
                                        flex: 1,
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontWeight: 800,
                                        background: paymentMethod === 'paypal' ? '#2DD4BF' : '#F8FAFC',
                                        color: paymentMethod === 'paypal' ? '#1E293B' : '#64748B',
                                        border: paymentMethod === 'paypal' ? 'none' : '1px solid #E2E8F0'
                                    }}
                                >
                                    PayPal
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: '#1E293B', fontSize: '13px', textTransform: 'uppercase' }}>Card Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <CreditCard size={18} color="#94A3B8" style={{ position: 'absolute', top: '15px', left: '16px' }} />
                                            <input type="text" className="input" placeholder="0000 0000 0000 0000" style={{ padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '100%', fontWeight: 600 }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: '#1E293B', fontSize: '13px', textTransform: 'uppercase' }}>Expiry Date</label>
                                            <input type="text" className="input" placeholder="MM/YY" style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '100%', fontWeight: 600 }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: '#1E293B', fontSize: '13px', textTransform: 'uppercase' }}>CVC</label>
                                            <input type="text" className="input" placeholder="123" style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '100%', fontWeight: 600 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: '#1E293B', fontSize: '13px', textTransform: 'uppercase' }}>Cardholder Name</label>
                                        <input type="text" className="input" placeholder="Jane Doe" style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '100%', fontWeight: 600 }} />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'paypal' && (
                                <div style={{ textAlign: 'center', padding: '3rem', background: '#F8FAFC', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
                                    <p style={{ color: '#64748B', fontWeight: 600 }}>You will be redirected to PayPal to complete your secure payment.</p>
                                </div>
                            )}

                            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                                    <ShieldCheck size={18} />
                                </div>
                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Bank-level encryption. Your data is never stored.</span>
                            </div>

                            <button
                                className="btn"
                                style={{
                                    width: '100%',
                                    marginTop: '2.5rem',
                                    padding: '20px',
                                    fontSize: '18px',
                                    fontWeight: 900,
                                    background: '#2DD4BF',
                                    color: '#1E293B',
                                    borderRadius: '16px',
                                    boxShadow: '0 8px 25px rgba(45, 212, 191, 0.3)'
                                }}
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? 'Verifying Transaction...' : `Pay Total: $${appointment.Service.price}`}
                            </button>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="card" style={{ padding: 'var(--space-10)', borderRadius: '24px', background: '#1E293B', height: 'fit-content', color: 'white', border: 'none' }}>
                            <h3 style={{ marginBottom: '2rem', fontSize: '20px', fontWeight: 900 }}>Package Summary</h3>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Expert Consultant</p>
                                    <p style={{ fontWeight: 800, fontSize: '16px', color: '#2DD4BF' }}>{appointment.ConsultantProfile.User.name}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Service Selection</p>
                                <p style={{ fontWeight: 700, fontSize: '15px' }}>{appointment.Service.title}</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <Calendar size={16} color="#2DD4BF" />
                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{appointment.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldCheck size={16} color="#2DD4BF" />
                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{appointment.time} (UTC+7)</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Session Priority</p>
                                <p style={{ fontWeight: 600, fontSize: '14px', fontStyle: 'italic', opacity: 0.9 }}>"{appointment.topic}"</p>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Final Amount</span>
                                    <div style={{ fontSize: '36px', fontWeight: 900, color: 'white' }}>${appointment.Service.price}</div>
                                </div>
                                <div style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(45, 212, 191, 0.1)', color: '#2DD4BF', fontSize: '11px', fontWeight: 900 }}>VIP QUEUE</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
