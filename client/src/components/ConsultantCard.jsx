import { Star, Clock, CheckCircle } from 'lucide-react';

export default function ConsultantCard({ consultant, onSelect }) {
    const { User, title, expertise, rating, reviewCount, isOnline, hourly_rate, profileImage } = consultant;

    // Fallback image if none provided
    const displayImage = profileImage || `https://i.pravatar.cc/150?u=${User?.name || 'anonymous'}`;

    return (
        <div
            className="card animate-fade-in-up"
            onClick={() => onSelect(consultant)}
            style={{
                padding: 'var(--space-6)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={displayImage}
                        alt={User?.name}
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--color-surface)',
                            boxShadow: '0 0 0 2px var(--color-border)'
                        }}
                    />
                    {isOnline && (
                        <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            border: '2px solid var(--color-surface)',
                            boxShadow: 'none'
                        }} />
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, color: 'var(--color-text-header)' }}>{User?.name}</h3>
                        {rating >= 4.9 && (
                            <div style={{
                                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)'
                            }}>
                                FEATURED
                            </div>
                        )}
                    </div>
                    <p style={{ fontSize: 'var(--text-ms)', color: 'var(--color-secondary)', margin: 0, fontWeight: 600 }}>{title || 'Senior Academic Consultant'}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(rating || 5) ? "#F59E0B" : "none"} stroke={i < Math.floor(rating || 5) ? "#F59E0B" : "#E2E8F0"} />
                        ))}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-header)', fontSize: '14px' }}>{rating?.toFixed(1) || '5.0'}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>({reviewCount} reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '11px', fontWeight: 800 }}>
                    <Clock size={12} />
                    <span>AVALABLE TODAY</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-6)' }}>
                {/* Excellence Badges */}
                <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: '#F0FDFA',
                    color: '#0D9488',
                    border: '1px solid #CCFBF1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <CheckCircle size={10} /> TOP RATED
                </span>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: '#FEF2F2',
                    color: '#B91C1C',
                    border: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <Clock size={10} /> FASTEST RESPONSE
                </span>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #DBEAFE'
                }}>
                    IVY LEAGUE ALUM
                </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                {(Array.isArray(expertise) ? expertise : []).slice(0, 3).map((pill, idx) => (
                    <span key={idx} style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-body)'
                    }}>{pill}</span>
                ))}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)'
            }}>
                <div>
                    <span style={{ fontSize: 'var(--text-xs)', display: 'block', color: 'var(--color-text-dim)' }}>Price per 30 mins</span>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-header)' }}>${(hourly_rate / 2).toFixed(2)}</span>
                </div>
                <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 'var(--text-ms)' }}>Book Now</button>
            </div>
        </div>
    );
}
