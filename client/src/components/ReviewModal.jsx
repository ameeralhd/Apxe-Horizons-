import { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, Award, Zap, MessageSquare, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getApiUrl } from '../utils/apiConfig';

const TRAIT_TAGS = [
    { id: 'Knowledgeable', icon: <Award size={14} />, label: 'Knowledgeable' },
    { id: 'Punctual', icon: <Zap size={14} />, label: 'Punctual' },
    { id: 'Clear Communication', icon: <MessageSquare size={14} />, label: 'Clear Communication' },
    { id: 'Friendly Tone', icon: <Heart size={14} />, label: 'Friendly Tone' }
];

export default function ReviewModal({ appointment, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please choose a star rating to continue.');
            return;
        }

        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(getApiUrl('/api/reviews/submit'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointmentId: appointment.id,
                    rating,
                    comment,
                    traitTags: selectedTags,
                    isAnonymous
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Submission failed');
            }

            // Success Animation
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2DD4BF', '#1E293B', '#F59E0B']
            });

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }} onClick={onClose}>
            <div className="glass-panel animate-fade-in-up" onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '540px', padding: '40px', position: 'relative',
                background: 'white', borderRadius: '32px', border: '1px solid #F1F5F9',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: '#F8FAFC', border: 'none', color: '#64748B', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={18} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: '#F0FDFA', borderRadius: '16px', color: '#2DD4BF', marginBottom: '16px' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#1E293B', marginBottom: '8px', lineHeight: 1.2 }}>Session Completed!</h2>
                    <p style={{ color: '#64748B', fontWeight: 500 }}>Your consultation with <strong style={{ color: '#1E293B' }}>{appointment.ConsultantProfile?.User?.name}</strong> has concluded.</p>
                </div>

                {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, border: '1px solid #FEE2E2' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* High-Contrast Star Rating */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.8)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            >
                                <Star
                                    size={48}
                                    fill={star <= (hover || rating) ? '#F59E0B' : 'none'}
                                    stroke={star <= (hover || rating) ? '#F59E0B' : '#E2E8F0'}
                                    strokeWidth={star <= (hover || rating) ? 0 : 2}
                                    style={{ filter: star <= (hover || rating) ? 'drop-shadow(0 4px 6px rgba(245, 158, 11, 0.3))' : 'none' }}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Trait Tags */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', color: '#1E293B', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>How would you describe the experience?</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {TRAIT_TAGS.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '100px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: '2px solid',
                                        background: selectedTags.includes(tag.id) ? '#F0FDFA' : '#F8FAFC',
                                        borderColor: selectedTags.includes(tag.id) ? '#2DD4BF' : '#F1F5F9',
                                        color: selectedTags.includes(tag.id) ? '#0D9488' : '#64748B'
                                    }}
                                >
                                    {tag.icon}
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share more details (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={300}
                            placeholder="Your testimonial helps other students make the right choice..."
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '2px solid #F1F5F9',
                                background: '#F8FAFC',
                                fontSize: '15px',
                                color: '#1E293B',
                                minHeight: '100px',
                                resize: 'none',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#2DD4BF'}
                            onBlur={e => e.target.style.borderColor = '#F1F5F9'}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: '#2DD4BF' }}
                            />
                            Hide my name on the public review
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: '#1E293B',
                            color: 'white',
                            borderRadius: '16px',
                            fontWeight: 900,
                            fontSize: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 25px -5px rgba(30, 41, 59, 0.4)'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Submit Review & Help Others'}
                    </button>
                </form>
            </div>
        </div>
    );
}
