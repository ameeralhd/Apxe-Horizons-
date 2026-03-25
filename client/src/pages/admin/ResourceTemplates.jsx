import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, FileText, Upload, X } from 'lucide-react';
import '../../admin-enhanced.css';
import { getApiUrl } from '../../utils/apiConfig';

export default function ResourceTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Academic',
        file: null
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl('/api/templates'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }

            const data = await res.json();
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (template = null) => {
        if (template) {
            setIsEditing(true);
            setCurrentTemplate(template);
            setFormData({
                name: template.name,
                category: template.category,
                file: null
            });
        } else {
            setIsEditing(false);
            setCurrentTemplate(null);
            setFormData({
                name: '',
                category: 'Academic',
                file: null
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', category: 'Academic', file: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        try {
            if (isEditing) {
                const res = await fetch(getApiUrl(`/api/templates/${currentTemplate.id}`), {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        category: formData.category
                    })
                });
                if (res.ok) fetchTemplates();
            } else {
                const data = new FormData();
                data.append('name', formData.name);
                data.append('category', formData.category);
                data.append('file', formData.file);

                const res = await fetch(getApiUrl('/api/templates'), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: data
                });
                if (res.ok) fetchTemplates();
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl(`/api/templates/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTemplates(templates.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page animate-fade-in" style={{ padding: '0 20px' }}>
            <div className="admin-page-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '40px' 
            }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B' }}>Resource Vault</h2>
                    <p style={{ marginTop: '8px', color: '#64748B', fontSize: '16px' }}>Curate high-impact guides, SOPs, and document templates for global student success.</p>
                </div>
                <button 
                    className="admin-btn admin-btn-primary" 
                    onClick={() => handleOpenModal()} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '16px 32px', 
                        borderRadius: '16px',
                        fontSize: '15px',
                        fontWeight: 900,
                        boxShadow: '0 10px 15px -3px rgba(45, 212, 191, 0.3)'
                    }}
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Post New Template</span>
                </button>
            </div>

            {/* Stats Cards Section */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px', 
                marginBottom: '40px' 
            }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.15)'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <FileText size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Total Repo Size</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{templates.length} <span style={{ fontSize: '14px', opacity: 0.7 }}>Assets</span></h3>
                    </div>
                </div>
                <div style={{ 
                    background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    boxShadow: '0 20px 25px -5px rgba(244, 63, 94, 0.15)'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <Upload size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Global Downloads</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>
                            {templates.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Toolbar Section */}
            <div style={{ 
                background: 'white', 
                padding: '32px', 
                borderRadius: '32px', 
                marginBottom: '32px',
                border: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '500px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="Search resource by title or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '16px 20px 16px 56px', 
                            borderRadius: '16px', 
                            border: '1.5px solid #F1F5F9',
                            background: '#F8FAFC',
                            fontSize: '15px',
                            fontWeight: 600,
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {['All', 'Academic', 'Visa', 'Research', 'CV'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSearch(cat === 'All' ? '' : cat)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: (search === cat || (cat === 'All' && !search)) ? '#1E293B' : '#F1F5F9',
                                color: (search === cat || (cat === 'All' && !search)) ? 'white' : '#64748B',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div>
                {loading ? (
                    <div style={{ padding: '100px', textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
                        <p style={{ color: '#64748B', fontWeight: 600 }}>Fetching latest resources...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredTemplates.map(template => (
                            <div key={template.id} style={{ 
                                background: 'white', 
                                padding: '24px 32px', 
                                borderRadius: '24px',
                                border: '1px solid #F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                            }} className="resource-card-hover">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1' }}>
                                    <div style={{ 
                                        background: template.category === 'Academic' ? '#F0FDFA' : 
                                                    template.category === 'Visa' ? '#EEF2FF' : 
                                                    template.category === 'Research' ? '#FFF7ED' : '#FDF4FF',
                                        padding: '20px',
                                        borderRadius: '20px',
                                        color: template.category === 'Academic' ? '#2DD4BF' : 
                                               template.category === 'Visa' ? '#6366F1' : 
                                               template.category === 'Research' ? '#F97316' : '#D946EF'
                                    }}>
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>{template.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                fontWeight: 900, 
                                                textTransform: 'uppercase',
                                                color: '#64748B',
                                                background: '#F1F5F9',
                                                padding: '4px 10px',
                                                borderRadius: '8px'
                                            }}>{template.category}</span>
                                            <span style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Upload size={14} /> {new Date(template.createdAt).toLocaleDateString()}
                                            </span>
                                            <span style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <strong>{template.downloadCount || 0}</strong> downloads
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button 
                                        className="admin-icon-btn shadow-sm" 
                                        title="Edit Template"
                                        onClick={() => handleOpenModal(template)}
                                        style={{ background: '#F8FAFC', padding: '12px', borderRadius: '14px' }}
                                    >
                                        <Edit2 size={20} color="#64748B" />
                                    </button>
                                    <button 
                                        className="admin-icon-btn delete shadow-sm" 
                                        title="Delete Template"
                                        onClick={() => handleDelete(template.id)}
                                        style={{ background: '#FEF2F2', padding: '12px', borderRadius: '14px' }}
                                    >
                                        <Trash2 size={20} color="#EF4444" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredTemplates.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px 40px', background: '#F8FAFC', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
                                <FileText size={64} style={{ color: '#CBD5E1', marginBottom: '24px' }} />
                                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Zone is empty</h4>
                                <p style={{ color: '#94A3B8', marginBottom: '32px' }}>No resources match your current selection.</p>
                                <button className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
                                    Upload First Asset
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '650px', width: '90%', borderRadius: '32px', overflow: 'hidden' }}>
                        <div className="admin-modal-header" style={{ padding: '40px', borderBottom: '1px solid #F1F5F9' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900 }}>{isEditing ? 'Asset Modification' : 'Secure Asset Upload'}</h3>
                                <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                                    {isEditing ? 'Syncing updates for this resource guide.' : 'Registering a new resource for global distribution.'}
                                </p>
                            </div>
                            <button className="admin-modal-close" onClick={handleCloseModal} style={{ background: '#F8FAFC', borderRadius: '50%', padding: '10px' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form" style={{ padding: '40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div className="admin-form-group">
                                    <label style={{ fontWeight: 700, marginBottom: '8px' }}>Professional Display Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Yale MBA SOP Guide"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        style={{ padding: '14px', borderRadius: '12px' }}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label style={{ fontWeight: 700, marginBottom: '8px' }}>Content Classification</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        style={{ padding: '14px', borderRadius: '12px' }}
                                    >
                                        <option value="Academic">Academic (Scholarships, SOPs)</option>
                                        <option value="Visa">Visa (Application Guides)</option>
                                        <option value="Research">Research (Proposals, Methods)</option>
                                        <option value="CV">CV (Templates, Samples)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {!isEditing && (
                                <div className="admin-form-group" style={{ marginBottom: '40px' }}>
                                    <label style={{ fontWeight: 700, marginBottom: '12px' }}>Binary File Asset</label>
                                    <div style={{ 
                                        border: '2px dashed #E2E8F0', 
                                        borderRadius: '24px', 
                                        padding: '40px', 
                                        textAlign: 'center',
                                        background: '#F8FAFC',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }} className="upload-dropzone">
                                        <input
                                            type="file"
                                            required
                                            onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                                            id="file-upload"
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                            <div style={{ background: '#2DD4BF', color: 'white', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 15px -3px rgba(45, 212, 191, 0.4)' }}>
                                                <Upload size={28} />
                                            </div>
                                            <p style={{ fontWeight: 900, color: '#1E293B', fontSize: '18px', marginBottom: '4px' }}>
                                                {formData.file ? formData.file.name : 'Target Asset Selection'}
                                            </p>
                                            <span style={{ fontSize: '14px', color: '#94A3B8' }}>PDF, DOCX, or XLSX (Verified up to 10MB)</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="admin-modal-footer" style={{ padding: '0', background: 'none' }}>
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal} style={{ padding: '16px 32px', borderRadius: '16px', fontWeight: 800 }}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '16px 48px', borderRadius: '16px', fontWeight: 900, boxShadow: '0 10px 20px -5px rgba(45, 212, 191, 0.4)' }}>
                                    <Upload size={20} style={{ marginRight: '10px' }} strokeWidth={3} />
                                    {isEditing ? 'Authorized Save' : 'Start Manifest Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
