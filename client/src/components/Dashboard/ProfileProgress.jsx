import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function ProfileProgress({ progress }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { percentage = 0, tasks = [] } = progress || {};

    useEffect(() => {
        if (percentage === 100) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [percentage]);

    return (
        <div className="profile-progress-card" style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
        }}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            background: percentage === 100 ? '#F0FDFA' : '#EFF6FF',
                            padding: '8px',
                            borderRadius: '12px',
                            color: percentage === 100 ? '#2DD4BF' : '#3B82F6'
                        }}>
                            {percentage === 100 ? <Sparkles size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E293B' }}>
                                {percentage === 100 ? 'Profile Optimized – Ready to Apply!' : 'Profile Strength'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                                {percentage === 100 ? 'You are doing great!' : `${100 - percentage}% more to unlock Scholarship Matching`}
                            </p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '24px', fontWeight: 900, color: percentage === 100 ? '#2DD4BF' : '#1E293B' }}>
                            {percentage}%
                        </span>
                    </div>
                </div>

                <div style={{ 
                    position: 'relative', 
                    height: '10px', 
                    background: '#F1F5F9', 
                    borderRadius: '5px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${percentage}%`,
                        background: percentage === 100 ? '#2DD4BF' : 'linear-gradient(90deg, #3B82F6, #2DD4BF)',
                        borderRadius: '5px',
                        transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isExpanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                            {isExpanded ? 'Hide Breakdown' : 'See what\'s missing'}
                        </span>
                    </div>
                    {percentage < 100 && (
                        <Link to={tasks.find(t => !t.completed)?.link || '/settings'} style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#3B82F6',
                            textDecoration: 'none'
                        }}>
                            Quick Action: {tasks.find(t => !t.completed)?.label} →
                        </Link>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div style={{ 
                    marginTop: '24px', 
                    paddingTop: '24px', 
                    borderTop: '1px solid #F1F5F9',
                    display: 'grid',
                    gap: '12px'
                }}>
                    {tasks.map((task, index) => (
                        <Link 
                            key={index} 
                            to={task.link}
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                textDecoration: 'none',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: task.completed ? '#F8FAFC' : '#FFF7ED',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: task.completed ? '#2DD4BF' : '#FB923C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    {task.completed ? <Check size={14} /> : <span style={{ fontSize: '10px', fontWeight: 900 }}>!</span>}
                                </div>
                                <span style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 700, 
                                    color: task.completed ? '#64748B' : '#1E293B' 
                                }}>
                                    {task.label}
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: task.completed ? '#2DD4BF' : '#FB923C' }}>
                                {task.completed ? 'COMPLETED' : 'OFFLINE / MISSING'}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
