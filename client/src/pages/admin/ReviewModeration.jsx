import { useState, useEffect } from 'react';
import { CheckCircle, Trash2, MessageSquare, Star, User, UserCheck, Award, Heart, ShieldCheck, Globe } from 'lucide-react';
import '../../admin-enhanced.css';

export default function ReviewModeration() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/reviews/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }

            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reviewId, updates) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/reviews/${reviewId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));
                setNotification({
                    message: "Review updated successfully",
                    type: 'success'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (error) {
            console.error('Update error:', error);
            setNotification({ message: 'Failed to update review', type: 'error' });
        }
    };

    if (loading) return <div className="admin-loading">Loading elite reviews...</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2DD4BF', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                            <Award size={14} /> Global Reputation Management
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B' }}>Social Proof Hub</h2>
                        <p style={{ color: '#64748B', fontWeight: 500 }}>Moderate student feedback and select featured testimonials for the public landing page.</p>
                    </div>
                </div>
            </div>

            {notification && (
                <div className={`admin-notification ${notification.type}`} style={{
                    padding: '16px 24px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    background: notification.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <Trash2 size={20} />}
                    {notification.message}
                </div>
            )}

            <div className="admin-card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '32px', border: '1px solid #F1F5F9' }}>
                        <MessageSquare size={64} style={{ marginBottom: '24px', color: '#E2E8F0' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>No Reviews Yet</h3>
                        <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>Wait for students to complete their sessions. High-quality feedback will appear here automatically.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {reviews.map(review => (
                            <div key={review.id} style={{
                                padding: '32px',
                                background: 'white',
                                borderRadius: '32px',
                                border: '1px solid #F1F5F9',
                                display: 'flex',
                                gap: '32px',
                                alignItems: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ flex: '0 0 240px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#1E293B', border: '2px solid #F1F5F9' }}>
                                            {review.User?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '15px' }}>{review.isAnonymous ? 'Anonymous Student' : review.User?.name}</div>
                                            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px 12px', background: '#F0FDFA', borderRadius: '12px' }}>
                                        <ShieldCheck size={14} color="#2DD4BF" />
                                        <span style={{ fontSize: '13px', color: '#0D9488', fontWeight: 700 }}>Expert: {review.ConsultantProfile?.User?.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                size={16}
                                                fill={s <= review.rating ? '#F59E0B' : 'none'}
                                                stroke={s <= review.rating ? '#F59E0B' : '#E2E8F0'}
                                                strokeWidth={s <= review.rating ? 0 : 2}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div style={{ flex: 1, padding: '0 24px', borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                                    <p style={{
                                        fontSize: '17px',
                                        lineHeight: '1.6',
                                        color: '#1E293B',
                                        fontWeight: 500,
                                        margin: '0 0 16px 0',
                                        fontStyle: 'italic'
                                    }}>
                                        "{review.comment || 'No written feedback provided.'}"
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {(review.traitTags || []).map(tag => (
                                            <span key={tag} style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', background: '#F8FAFC', padding: '4px 12px', borderRadius: '100px', border: '1px solid #F1F5F9' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button
                                        onClick={() => handleUpdateStatus(review.id, { isPublished: !review.isPublished })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '16px',
                                            background: review.isPublished ? '#10B981' : '#F8FAFC',
                                            color: review.isPublished ? 'white' : '#64748B',
                                            border: 'none',
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Globe size={16} /> {review.isPublished ? 'Live on Site' : 'Publish Review'}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(review.id, { isTestimonial: !review.isTestimonial })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '16px',
                                            background: review.isTestimonial ? '#F59E0B' : '#F8FAFC',
                                            color: review.isTestimonial ? 'white' : '#64748B',
                                            border: 'none',
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Heart size={16} fill={review.isTestimonial ? 'white' : 'none'} /> {review.isTestimonial ? 'Featured Story' : 'Mark Testimonial'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
