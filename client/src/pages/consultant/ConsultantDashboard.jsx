import { useState, useEffect } from 'react';
import { User, Calendar, Clock, Save, Eye, Check, X, AlertCircle, Camera } from 'lucide-react';
import '../../admin-enhanced.css';

export default function ConsultantDashboard() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // profile | availability
    const [availability, setAvailability] = useState({});
    const [notification, setNotification] = useState(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/consultants/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            setProfile(data);

            // Parse availability
            const availObj = {};
            if (data.Availabilities) {
                data.Availabilities.forEach(slot => {
                    availObj[slot.dayOfWeek] = [slot.startTime, slot.endTime];
                });
            }
            setAvailability(availObj);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            // Format availability
            const formattedAvailability = [];
            Object.entries(availability).forEach(([day, times]) => {
                if (times && times.length === 2) {
                    formattedAvailability.push({
                        dayOfWeek: day,
                        startTime: times[0],
                        endTime: times[1]
                    });
                }
            });

            const res = await fetch('/api/consultants/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bio: profile.bio,
                    title: profile.title,
                    expertise: profile.expertise,
                    profileImage: profile.profileImage,
                    availability: formattedAvailability
                })
            });

            if (res.ok) {
                showNotification('Profile updated successfully');
            } else {
                showNotification('Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('An error occurred', 'error');
        }
    };

    const updateSchedule = (day, start, end) => {
        setAvailability(prev => {
            const next = { ...prev };
            if (!start && !end) delete next[day];
            else next[day] = [start, end];
            return next;
        });
    };

    const showNotification = (msg, type = 'success') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) return <div className="admin-loading">Loading your dashboard...</div>;
    if (!profile) return <div className="admin-error">Profile not found. Please contact admin.</div>;

    return (
        <div className="admin-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            {notification && (
                <div className={`notification ${notification.type}`} style={{
                    position: 'fixed', top: '20px', right: '20px',
                    background: notification.type === 'error' ? '#fee2e2' : '#dcfce7',
                    color: notification.type === 'error' ? '#ef4444' : '#10b981',
                    padding: '1rem', borderRadius: '8px', zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {notification.message}
                </div>
            )}

            <div className="admin-header" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#f1f5f9', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        overflow: 'hidden', position: 'relative'
                    }}>
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={40} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8' }} />
                        )}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0' }}>Welcome, {profile.User?.name}</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage your professional profile and availability grid.</p>
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ padding: '0', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            padding: '16px 24px', border: 'none', background: activeTab === 'profile' ? 'white' : 'transparent',
                            borderBottom: activeTab === 'profile' ? '2px solid #10b981' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: 600, color: activeTab === 'profile' ? '#10b981' : '#64748b'
                        }}
                    >
                        Profile Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        style={{
                            padding: '16px 24px', border: 'none', background: activeTab === 'availability' ? 'white' : 'transparent',
                            borderBottom: activeTab === 'availability' ? '2px solid #10b981' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: 600, color: activeTab === 'availability' ? '#10b981' : '#64748b'
                        }}
                    >
                        Availability Grid
                    </button>
                </div>

                <div style={{ padding: '32px' }}>
                    {activeTab === 'profile' ? (
                        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>Professional Title</label>
                                    <input
                                        type="text"
                                        value={profile.title || ''}
                                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                        placeholder="e.g. Senior Academic Advisor"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>Profile Image URL</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={profile.profileImage || ''}
                                            onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                                            placeholder="https://..."
                                            style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>Professional Bio</label>
                                <textarea
                                    rows="5"
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell potential clients about your background and expertise..."
                                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'inherit' }}
                                ></textarea>
                            </div>

                            <button onClick={handleSave} className="btn-primary" style={{ width: 'fit-content', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Save size={18} /> Update Profile
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bbf7d0', display: 'flex', gap: '12px', color: '#166534' }}>
                                <Clock size={20} />
                                <div>
                                    <p style={{ margin: '0', fontWeight: 600 }}>Set Your Weekly Availability</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Mark the days and hours you are online for consultations. Users will only see these slots as bookable.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {days.map(day => {
                                    const hasSlot = availability[day];
                                    const [start, end] = hasSlot || ["09:00", "17:00"];

                                    return (
                                        <div key={day} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px', background: hasSlot ? 'white' : '#f8fafc',
                                            border: '1px solid #e2e8f0', borderRadius: '12px',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!hasSlot}
                                                    onChange={(e) => updateSchedule(day, e.target.checked ? "09:00" : null, e.target.checked ? "17:00" : null)}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                                                />
                                                <span style={{ fontWeight: 700, minWidth: '100px', color: hasSlot ? '#0f172a' : '#94a3b8' }}>{day}</span>
                                            </div>

                                            {hasSlot ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <input
                                                        type="time"
                                                        value={start}
                                                        onChange={(e) => updateSchedule(day, e.target.value, end)}
                                                        style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                    />
                                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
                                                    <input
                                                        type="time"
                                                        value={end}
                                                        onChange={(e) => updateSchedule(day, start, e.target.value)}
                                                        style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Offline</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handleSave} className="btn-primary" style={{ marginTop: '32px', width: 'fit-content', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Save size={18} /> Save Availability
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
