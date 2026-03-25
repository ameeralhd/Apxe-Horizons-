import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CreditCard, Download, ChevronRight } from 'lucide-react';

export default function MyPaymentsPage() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetch('/api/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                // Filter for paid appointments or pending ones
                const paidOrPending = data.filter(d => d.status === 'paid' || d.status === 'pending');
                setPayments(paidOrPending);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [navigate]);

    return (
        <Layout>
            <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: 'var(--space-12) 0' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2DD4BF', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                <CreditCard size={14} /> Student Dashboard
                            </div>
                            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1E293B', margin: 0 }}>Order History</h1>
                            <p style={{ color: '#64748B', fontWeight: 500, marginTop: '4px' }}>Track your consultation payments and download invoices.</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ fontWeight: 600 }}>Retrieving transaction records...</p>
                            </div>
                        ) : payments.length === 0 ? (
                            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF', margin: '0 auto 1.5rem' }}>
                                    <CreditCard size={40} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>No Payments Found</h3>
                                <p style={{ color: '#64748B', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Once you book and pay for a consultation, your receipts and order details will appear here.</p>
                                <Link to="/consultation" className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '12px' }}>Book a Session</Link>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Description</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Amount</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(payment => (
                                            <tr key={payment.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '24px' }}>
                                                    <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '15px' }}>{payment.Service.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Order #PX-{payment.id + 1000}</div>
                                                </td>
                                                <td style={{ padding: '24px' }}>
                                                    <div style={{ color: '#475569', fontWeight: 600, fontSize: '14px' }}>{payment.date}</div>
                                                </td>
                                                <td style={{ padding: '24px' }}>
                                                    <div style={{ fontWeight: 900, color: '#1E293B', fontSize: '16px' }}>${payment.Service.price || '0'}</div>
                                                </td>
                                                <td style={{ padding: '24px' }}>
                                                    <span style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        background: payment.status === 'paid' ? '#F0FDFA' : '#FFFBEB',
                                                        color: payment.status === 'paid' ? '#0D9488' : '#B45309'
                                                    }}>
                                                        {payment.status === 'paid' ? 'Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '24px', textAlign: 'right' }}>
                                                    {payment.status === 'paid' ? (
                                                        <button className="btn" style={{ background: '#F8FAFC', color: '#64748B', padding: '8px 16px', fontSize: '12px', fontWeight: 800, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                                            <Download size={14} /> Invoice
                                                        </button>
                                                    ) : (
                                                        <Link to={`/payment/${payment.id}`} className="btn" style={{ background: '#2DD4BF', color: '#1E293B', padding: '8px 16px', fontSize: '12px', fontWeight: 800, borderRadius: '8px' }}>
                                                            Complete Payment
                                                        </Link>
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
        </Layout>
    );
}
