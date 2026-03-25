import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Clock, DollarSign, User, FileText, ChevronRight } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ name: 'User' }); // Replace with actual user context if available

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

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

        // Mock user fetch
        // setUser({ name: 'Alex' }); 
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
            <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 80px)', padding: '2rem 0' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Dashboard</h1>
                            <p style={{ color: '#666' }}>Welcome back, manage your sessions and documents.</p>
                        </div>
                        <Link to="/consultation" className="btn btn-primary">Book New Session</Link>
                    </div>

                    <div className="card shadow-md" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>My Bookings</h3>
                        </div>

                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                        ) : bookings.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                <Calendar size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#666', marginBottom: '1rem' }}>You haven't booked any consultations yet.</p>
                                <Link to="/consultation" className="btn btn-outline">Find an Expert</Link>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', fontWeight: 600, color: '#444' }}>Service & Expert</th>
                                            <th style={{ padding: '1rem', fontWeight: 600, color: '#444' }}>Date & Time</th>
                                            <th style={{ padding: '1rem', fontWeight: 600, color: '#444' }}>Topic</th>
                                            <th style={{ padding: '1rem', fontWeight: 600, color: '#444' }}>Status</th>
                                            <th style={{ padding: '1rem', fontWeight: 600, color: '#444' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => (
                                            <tr key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{booking.Service.title}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <User size={14} /> {booking.ConsultantProfile.User.name}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 500 }}>{booking.date}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{booking.time}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {booking.topic}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: getStatusColor(booking.status) === 'green' ? '#e6fcf5' : getStatusColor(booking.status) === 'orange' ? '#fff9db' : '#f8f9fa',
                                                        color: getStatusColor(booking.status) === 'green' ? '#087f5b' : getStatusColor(booking.status) === 'orange' ? '#f59f00' : '#444',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {booking.status === 'pending' ? (
                                                        <Link to={`/payment/${booking.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                                            Pay Now
                                                        </Link>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>View</button>
                                                            {booking.status !== 'cancelled' && (
                                                                <button className="btn btn-ghost" style={{ padding: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Reschedule</button>
                                                            )}
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
        </Layout>
    );
}
