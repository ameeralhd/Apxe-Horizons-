import { getApiUrl } from '../../utils/apiConfig';
import { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, ExternalLink, 
    MoreVertical, CheckCircle2, XCircle, Play, 
    ArrowUpDown, Filter, Video, Users, GraduationCap, X
} from 'lucide-react';

export default function MediaManager() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('university_discovery'); // or 'success_story'
    
    const [formData, setFormData] = useState({
        title: '',
        youtube_url: '',
        category: 'university_discovery',
        status: true,
        order_index: 0,
        country: '',
        official_link: ''
    });

    const token = localStorage.getItem('token');

    const fetchContent = async () => {
        try {
            const res = await fetch(getApiUrl('/api/dynamic-content'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.ok ? await res.json() : [];
                setContent(data);
            }
        } catch (err) {
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `/api/dynamic-content/${editingItem.id}` : '/api/dynamic-content';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchContent();
                closeModal();
            } else {
                const err = await res.json();
                alert(err.message || 'Error saving content');
            }
        } catch (err) {
            console.error('Error saving content:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;

        try {
            const res = await fetch(getApiUrl(`/api/dynamic-content/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchContent();
            }
        } catch (err) {
            console.error('Error deleting content:', err);
        }
    };

    const toggleStatus = async (item) => {
        try {
            const res = await fetch(getApiUrl(`/api/dynamic-content/${item.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...item, status: !item.status })
            });

            if (res.ok) {
                fetchContent();
            }
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                youtube_url: item.youtube_url,
                category: item.category,
                status: item.status,
                order_index: item.order_index,
                country: item.country || '',
                official_link: item.official_link || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                youtube_url: '',
                category: activeTab,
                status: true,
                order_index: content.length,
                country: '',
                official_link: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ title: '', youtube_url: '', category: 'university_discovery', status: true, order_index: 0, country: '', official_link: '' });
    };

    const filteredContent = content.filter(item => 
        item.category === activeTab &&
        (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         item.youtube_url.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="media-manager-page animate-fade-in">
            {/* Header Section */}
            <div className="admin-page-header" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p className="admin-subtitle">Media Content Management</p>
                        <h2 className="admin-title">Media Manager</h2>
                        <p style={{ color: '#64748B', marginTop: '8px' }}>Manage Featured University Discovery and Student Success Stories.</p>
                    </div>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal()}>
                        <Plus size={20} />
                        Add New Media
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '24px', 
                marginBottom: '40px' 
            }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    boxShadow: '0 20px 25px -5px rgba(45, 212, 191, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Discovery Highlights</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{content.filter(c => c.category === 'university_discovery').length}</h3>
                    </div>
                </div>
                <div style={{ 
                    background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Success Stories</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{content.filter(c => c.category === 'success_story').length}</h3>
                    </div>
                </div>
                <div style={{ 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <Play size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Active Showcase</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{content.filter(c => c.status).length}</h3>
                    </div>
                </div>
            </div>

            {/* Tabs & Search Container */}
            <div style={{ 
                background: 'white', 
                padding: '32px', 
                borderRadius: '32px', 
                border: '1px solid #F1F5F9',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '32px',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        background: '#F8FAFC', 
                        padding: '6px', 
                        borderRadius: '16px'
                    }}>
                        <button 
                            className={`admin-tab-btn ${activeTab === 'university_discovery' ? 'active' : ''}`}
                            onClick={() => setActiveTab('university_discovery')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer',
                                background: activeTab === 'university_discovery' ? '#1E293B' : 'transparent',
                                color: activeTab === 'university_discovery' ? 'white' : '#64748B',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Video size={18} /> University Discovery
                        </button>
                        <button 
                            className={`admin-tab-btn ${activeTab === 'success_story' ? 'active' : ''}`}
                            onClick={() => setActiveTab('success_story')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer',
                                background: activeTab === 'success_story' ? '#1E293B' : 'transparent',
                                color: activeTab === 'success_story' ? 'white' : '#64748B',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Users size={18} /> Success Stories
                        </button>
                    </div>

                    <div style={{ 
                        position: 'relative', 
                        minWidth: '320px',
                        flex: '1',
                        maxWidth: '450px'
                    }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Find institution by name or country..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px 14px 48px',
                                borderRadius: '16px',
                                border: '1.5px solid #F1F5F9',
                                background: '#F8FAFC',
                                fontSize: '14px',
                                fontWeight: 600,
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>
                </div>

                {/* Content Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</th>
                                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institution & Link</th>
                                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Showcase Info</th>
                                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visibility</th>
                                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px 0' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                        <p style={{ marginTop: '24px', color: '#64748B', fontWeight: 600 }}>Syncing media vault...</p>
                                    </td>
                                </tr>
                            ) : filteredContent.length > 0 ? (
                                filteredContent.map(item => (
                                    <tr key={item.id} className="admin-table-row" style={{ 
                                        background: 'white', 
                                        transition: 'all 0.2s',
                                        borderRadius: '16px'
                                    }}>
                                        <td style={{ padding: '24px', borderRadius: '16px 0 0 16px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', borderLeft: '1px solid #F1F5F9' }}>
                                            <span style={{ fontWeight: 900, color: '#1E293B', fontSize: '16px' }}>#{item.order_index}</span>
                                        </td>
                                        <td style={{ padding: '24px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ position: 'relative', width: '140px', height: '80px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 15px -3px rgba(0,0,0,0.1)' }}>
                                                <img 
                                                    src={`https://img.youtube.com/vi/${item.video_id}/maxresdefault.jpg`} 
                                                    alt={item.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = `https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg` }}
                                                />
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.9)', padding: '8px', borderRadius: '50%' }}>
                                                        <Play size={16} fill="#1E293B" color="#1E293B" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ maxWidth: '300px' }}>
                                                <p style={{ fontWeight: 900, color: '#1E293B', fontSize: '16px', marginBottom: '8px' }}>{item.title}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    {item.country && (
                                                        <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, color: '#64748B' }}>
                                                            {item.country}
                                                        </span>
                                                    )}
                                                    {item.official_link && (
                                                        <a href={item.official_link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6366F1', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            Official Site <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <a href={item.youtube_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2DD4BF', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: 800 }}>
                                                    Watch Video <ExternalLink size={14} />
                                                </a>
                                                <code style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>UID: {item.video_id}</code>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                                            <button 
                                                onClick={() => toggleStatus(item)}
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                            >
                                                {item.status ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDFA', color: '#2DD4BF', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 900 }}>
                                                        <CheckCircle2 size={14} /> LIVE
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF2F2', color: '#EF4444', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 900 }}>
                                                        <XCircle size={14} /> HIDDEN
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td style={{ padding: '24px', borderRadius: '0 16px 16px 0', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                <button className="admin-icon-btn shadow-sm" style={{ background: '#F8FAFC', padding: '10px', borderRadius: '12px' }} title="Edit" onClick={() => openModal(item)}>
                                                    <Edit2 size={18} color="#64748B" />
                                                </button>
                                                <button className="admin-icon-btn delete shadow-sm" style={{ background: '#FEF2F2', padding: '10px', borderRadius: '12px' }} title="Delete" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 size={18} color="#EF4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '80px', color: '#94A3B8', border: '2px dashed #F1F5F9', borderRadius: '24px' }}>
                                        <div style={{ opacity: 0.3 }}>
                                            <Play size={64} style={{ margin: '0 auto 20px' }} />
                                            <p style={{ fontSize: '18px', fontWeight: 700 }}>No institution media found in this zone.</p>
                                        </div>
                                        <button className="admin-btn admin-btn-primary" style={{ marginTop: '24px' }} onClick={() => openModal()}>Add your first showcase</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '650px', width: '90%', borderRadius: '32px' }}>
                        <div className="admin-modal-header" style={{ padding: '32px 40px', borderBottom: '1px solid #F1F5F9' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900 }}>{editingItem ? 'Edit Media Content' : 'Add New Media'}</h3>
                                <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Provide accurate details for university discovery.</p>
                            </div>
                            <button className="admin-modal-close" onClick={closeModal} style={{ background: '#F8FAFC', borderRadius: '50%', padding: '8px' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form" style={{ padding: '40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div className="admin-form-group">
                                    <label>Content Title / Institution</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="e.g. Harvard University"
                                        required
                                        style={{ borderRadius: '12px', padding: '12px 16px' }}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Target Country</label>
                                    <select 
                                        value={formData.country}
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        style={{ borderRadius: '12px', padding: '12px 16px' }}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                        <option value="Japan">Japan</option>
                                        <option value="Global">Global / Multiple</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: '24px' }}>
                                <label>Official Institution Website</label>
                                <input 
                                    type="url" 
                                    value={formData.official_link}
                                    onChange={(e) => setFormData({...formData, official_link: e.target.value})}
                                    placeholder="https://www.harvard.edu"
                                    style={{ borderRadius: '12px', padding: '12px 16px' }}
                                />
                                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Direct link to the university's official application or home page.</p>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: '24px' }}>
                                <label>YouTube Video Link</label>
                                <input 
                                    type="url" 
                                    value={formData.youtube_url}
                                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    required
                                    style={{ borderRadius: '12px', padding: '12px 16px' }}
                                />
                                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>The showcase video for this institution.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                <div className="admin-form-group">
                                    <label>Category Space</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        style={{ borderRadius: '12px', padding: '12px 16px' }}
                                    >
                                        <option value="university_discovery">University Discovery</option>
                                        <option value="success_story">Success Story</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Display Order</label>
                                    <input 
                                        type="number" 
                                        value={formData.order_index}
                                        onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                                        style={{ borderRadius: '12px', padding: '12px 16px' }}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: '40px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 700, color: '#1E293B' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.checked})}
                                        style={{ width: '20px', height: '20px', accentColor: '#2DD4BF' }}
                                    />
                                    Publish this content to the live platform
                                </label>
                            </div>

                            <div className="admin-modal-footer" style={{ padding: '0', background: 'none' }}>
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal} style={{ borderRadius: '16px', padding: '16px 32px', fontWeight: 800 }}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary" style={{ borderRadius: '16px', padding: '16px 48px', fontWeight: 900, boxShadow: '0 10px 20px -5px rgba(45, 212, 191, 0.4)' }}>
                                    {editingItem ? 'Update Content' : 'Save Media'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
