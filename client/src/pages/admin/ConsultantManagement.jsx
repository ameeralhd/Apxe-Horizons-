import { useState, useEffect } from 'react';
import { Search, User, Calendar, Clock, Save, Eye, MoreVertical, Plus, Check, X, AlertCircle } from 'lucide-react';
import '../../admin-enhanced.css';

export default function ConsultantManagement() {
    const [consultants, setConsultants] = useState([]);
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // profile | schedule
    const [availability, setAvailability] = useState({});
    const [notification, setNotification] = useState(null);

    // Fetch Consultants
    useEffect(() => {
        fetchConsultants();
    }, []);

    const fetchConsultants = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/consultants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }

            const data = await res.json();
            setConsultants(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching consultants:', error);
            setLoading(false);
        }
    };

    const handleSelectConsultant = (consultant) => {
        setSelectedConsultant(consultant);

        // Parse availability from array (new schema) to object (UI state)
        const availabilityObj = {};
        if (consultant.Availabilities && Array.isArray(consultant.Availabilities)) {
            consultant.Availabilities.forEach(slot => {
                availabilityObj[slot.dayOfWeek] = [slot.startTime, slot.endTime];
            });
        } else if (consultant.availability && !Array.isArray(consultant.availability)) {
            // Fallback for old JSON format if any
            Object.assign(availabilityObj, consultant.availability);
        }

        setAvailability(availabilityObj);
        setActiveTab('profile');
    };

    const handleToggleStatus = async (e, consultant) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const newStatus = !consultant.isActive;

            const res = await fetch(`/api/admin/consultants/${consultant.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: newStatus })
            });

            if (res.ok) {
                // Update local list
                setConsultants(prev => prev.map(c => c.id === consultant.id ? { ...c, isActive: newStatus } : c));
                if (selectedConsultant?.id === consultant.id) {
                    setSelectedConsultant(prev => ({ ...prev, isActive: newStatus }));
                }
                showNotification(`Consultant ${newStatus ? 'activated' : 'deactivated'}`);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleSave = async () => {
        if (!selectedConsultant) return;

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...selectedConsultant,
                availability // Include the UI availability state
            };
            const res = await fetch(`/api/admin/consultants/${selectedConsultant.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updated = await res.json();
                setConsultants(prev => prev.map(c => c.id === updated.id ? updated : c));
                setSelectedConsultant(updated); // Refresh selected consultant state
                showNotification('Changes saved successfully');
            }
        } catch (error) {
            console.error('Error saving consultant:', error);
            showNotification('Failed to save changes', 'error');
        }
    };

    const showNotification = (msg, type = 'success') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // --- Schedule Logic ---
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const updateSchedule = (day, start, end) => {
        setAvailability(prev => {
            const newAvail = { ...prev };
            if (!start && !end) {
                delete newAvail[day]; // Remove slot
            } else {
                newAvail[day] = [start, end];
            }
            return newAvail;
        });
    };

    if (loading) return <div className="admin-loading">Loading consultants...</div>;

    return (
        <div className="admin-page">
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

            <div className="admin-page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Consultant Management</h2>
                        <p>Manage profiles, availability, and active status.</p>
                    </div>
                    <button className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>

            <div className="dashboard-split" style={{ alignItems: 'start' }}>

                {/* Left Column: List */}
                <div className="dashboard-left" style={{ background: 'white', borderRadius: '12px', padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search consultants..."
                                style={{
                                    width: '100%', padding: '10px 10px 10px 40px',
                                    borderRadius: '8px', border: '1px solid #cbd5e1',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                        {consultants.map(consultant => (
                            <div
                                key={consultant.id}
                                onClick={() => handleSelectConsultant(consultant)}
                                style={{
                                    padding: '16px', borderBottom: '1px solid #f1f5f9',
                                    cursor: 'pointer',
                                    background: selectedConsultant?.id === consultant.id ? '#f0fdf4' : 'white',
                                    borderLeft: selectedConsultant?.id === consultant.id ? '4px solid #10b981' : '4px solid transparent',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {consultant.profileImage ? (
                                            <img src={consultant.profileImage} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={20} color="#64748b" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{consultant.User?.name || 'Unknown User'}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{consultant.title || 'Consultant'}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleToggleStatus(e, consultant)}
                                    title={consultant.isActive ? "Disable" : "Enable"}
                                    style={{
                                        background: consultant.isActive ? '#dcfce7' : '#f1f5f9',
                                        border: 'none', borderRadius: '20px',
                                        padding: '4px 12px', cursor: 'pointer',
                                        fontSize: '11px', fontWeight: 600,
                                        color: consultant.isActive ? '#166534' : '#64748b',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    {consultant.isActive ? 'Active' : 'Disabled'}
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: consultant.isActive ? '#166534' : '#94a3b8'
                                    }}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Editor */}
                <div className="dashboard-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {selectedConsultant ? (
                        <div className="admin-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        style={{
                                            padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                            background: activeTab === 'profile' ? 'white' : 'transparent',
                                            fontWeight: 600, color: activeTab === 'profile' ? '#0f172a' : '#64748b',
                                            boxShadow: activeTab === 'profile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('schedule')}
                                        style={{
                                            padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                            background: activeTab === 'schedule' ? 'white' : 'transparent',
                                            fontWeight: 600, color: activeTab === 'schedule' ? '#0f172a' : '#64748b',
                                            boxShadow: activeTab === 'schedule' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        Manage Schedule
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569' }}>
                                        <Eye size={16} /> Preview
                                    </button>
                                    <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'profile' ? (
                                <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Full Name</label>
                                            <input
                                                type="text"
                                                value={selectedConsultant.User?.name || ''}
                                                disabled
                                                style={{ width: '100%', padding: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#94a3b8' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Professional Title</label>
                                            <input
                                                type="text"
                                                value={selectedConsultant.title || ''}
                                                onChange={(e) => setSelectedConsultant({ ...selectedConsultant, title: e.target.value })}
                                                placeholder="e.g. Senior Career Coach"
                                                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Hourly Rate ($)</label>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }}>$</span>
                                                <input
                                                    type="number"
                                                    value={selectedConsultant.hourly_rate || ''}
                                                    onChange={(e) => setSelectedConsultant({ ...selectedConsultant, hourly_rate: e.target.value })}
                                                    style={{ width: '100%', padding: '10px 10px 10px 25px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Profile Image URL</label>
                                            <input
                                                type="text"
                                                value={selectedConsultant.profileImage || ''}
                                                onChange={(e) => setSelectedConsultant({ ...selectedConsultant, profileImage: e.target.value })}
                                                placeholder="https://..."
                                                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Professional Bio (Markdown Supported)</label>
                                        <div style={{ position: 'relative' }}>
                                            <textarea
                                                rows="8"
                                                value={selectedConsultant.bio || ''}
                                                onChange={(e) => setSelectedConsultant({ ...selectedConsultant, bio: e.target.value })}
                                                placeholder="Use bullet points and markdown for a better profile..."
                                                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }}
                                            ></textarea>
                                            <div style={{ position: 'absolute', right: '12px', bottom: '12px', fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: '4px' }}>
                                                Markdown supported
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#475569', textTransform: 'uppercase' }}>Social Rating</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={selectedConsultant.rating || 5.0}
                                                onChange={(e) => setSelectedConsultant({ ...selectedConsultant, rating: parseFloat(e.target.value) })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#475569', textTransform: 'uppercase' }}>Review Count</label>
                                            <input
                                                type="number"
                                                value={selectedConsultant.reviewCount || 0}
                                                onChange={(e) => setSelectedConsultant({ ...selectedConsultant, reviewCount: parseInt(e.target.value) })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#475569', textTransform: 'uppercase' }}>Online Status</label>
                                            <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedConsultant.isOnline}
                                                    onChange={(e) => setSelectedConsultant({ ...selectedConsultant, isOnline: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: selectedConsultant.isOnline ? '#10b981' : '#64748b' }}>
                                                    {selectedConsultant.isOnline ? 'Active Online' : 'Set Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in-up">
                                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bbf7d0', display: 'flex', gap: '10px', fontSize: '13px', color: '#166534' }}>
                                        <Clock size={18} />
                                        <span>Set the hours when this consultant is available to take bookings. Times are in system local time.</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {days.map(day => {
                                            const hasSlot = availability && availability[day];
                                            const [start, end] = hasSlot || ["09:00", "17:00"];

                                            return (
                                                <div key={day} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px', background: hasSlot ? 'white' : '#f8fafc',
                                                    border: '1px solid #e2e8f0', borderRadius: '8px',
                                                    opacity: hasSlot ? 1 : 0.7
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '120px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!hasSlot}
                                                            onChange={(e) => updateSchedule(day, e.target.checked ? "09:00" : null, e.target.checked ? "17:00" : null)}
                                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontWeight: 600, fontSize: '14px', color: hasSlot ? '#0f172a' : '#64748b' }}>{day}</span>
                                                    </div>

                                                    {hasSlot ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <input
                                                                type="time"
                                                                value={start}
                                                                onChange={(e) => updateSchedule(day, e.target.value, end)}
                                                                style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                            />
                                                            <span style={{ color: '#64748b' }}>to</span>
                                                            <input
                                                                type="time"
                                                                value={end}
                                                                onChange={(e) => updateSchedule(day, start, e.target.value)}
                                                                style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginRight: '50px' }}>Unavailable</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="admin-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', minHeight: '400px' }}>
                            <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No Consultant Selected</h3>
                            <p style={{ margin: 0 }}>Select a consultant from the list to manage their profile and schedule.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
