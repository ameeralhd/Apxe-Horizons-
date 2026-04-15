import { useState, useEffect } from 'react';
import { 
    GraduationCap, Plus, Search, Filter, Trash2, Edit, ExternalLink, X, 
    CheckCircle, AlertTriangle, ShieldCheck, Save, DollarSign, Clock 
} from 'lucide-react';
import axios from 'axios';

export default function ScholarshipManagement() {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [savedPopup, setSavedPopup] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', university: '', country: '', flag: '🇬🇧', field: 'Any Field', 
        level: 'Masters', fundingType: 'Full Ride', amount: '', amountNum: '', 
        deadline: '', matchScore: 80, link: '', logo: '', description: ''
    });

    const token = localStorage.getItem('token');

    const fetchScholarships = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/scholarships');
            setScholarships(res.data);
        } catch (error) {
            console.error('Failed to fetch scholarships', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({
            name: '', university: '', country: '', flag: '🇬🇧', field: 'Any Field', 
            level: 'Masters', fundingType: 'Full Ride', amount: '', amountNum: '', 
            deadline: '', matchScore: 80, link: '', logo: '', description: ''
        });
        setEditingId(null);
    };

    const openModal = (scholarship = null) => {
        if (scholarship) {
            setFormData(scholarship);
            setEditingId(scholarship.id);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${token}` };
            // Auto calculate amountNum based on amount if simple digit extraction needed
            let payload = { ...formData };
            if (!payload.amountNum) {
                payload.amountNum = parseInt(payload.amount.replace(/[^0-9]/g, ''), 10) || 0;
            }

            if (editingId) {
                await axios.put(`http://localhost:5000/api/scholarships/${editingId}`, payload, { headers });
            } else {
                await axios.post('http://localhost:5000/api/scholarships', payload, { headers });
            }
            
            fetchScholarships();
            closeModal();
            showSavedPopup();
        } catch (error) {
            console.error('Error saving scholarship', error);
            alert('Error saving scholarship. Please check the form.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this scholarship?')) {
            try {
                await axios.delete(`http://localhost:5000/api/scholarships/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchScholarships();
            } catch (error) {
                console.error('Error deleting scholarship', error);
            }
        }
    };

    const showSavedPopup = () => {
        setSavedPopup(true);
        setTimeout(() => setSavedPopup(false), 3000);
    };

    const filtered = scholarships.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: '24px',
                padding: '40px',
                color: 'white',
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <GraduationCap color="#38BDF8" size={32} />
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Scholarship Command Center</h1>
                    </div>
                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '15px' }}>
                        Manage premium scholarship opportunities available to users globally.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        background: '#38BDF8', color: '#0F172A',
                        padding: '14px 24px', borderRadius: '12px', border: 'none',
                        fontWeight: 800, fontSize: '15px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 10px 20px rgba(56, 189, 248, 0.3)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> Add Scholarship
                </button>
            </div>

            {/* Toolbar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'white', padding: '16px 24px', borderRadius: '16px',
                marginBottom: '24px', border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#64748B' }} />
                    <input
                        type="text"
                        placeholder="Search by name, uni, or country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 16px 14px 44px',
                            borderRadius: '12px', border: '1px solid #E2E8F0',
                            background: '#F8FAFC', outline: 'none',
                            fontSize: '14px', boxSizing: 'border-box'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                        padding: '12px 20px', background: '#F1F5F9', borderRadius: '12px',
                        fontSize: '13px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        Total: <span style={{ color: '#0F172A', fontSize: '15px' }}>{scholarships.length}</span>
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading secure database...</div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px',
                    border: '1px dashed #CBD5E1'
                }}>
                    <Search size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px', color: '#1E293B', fontSize: '18px' }}>No Scholarships Found</h3>
                    <p style={{ margin: 0, color: '#64748B' }}>Adjust your filters or add a new entry.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                    {filtered.map(s => (
                        <div key={s.id} style={{
                            background: 'white', borderRadius: '20px', overflow: 'hidden',
                            border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: '#F1F5F9' }}>
                                    <img src={s.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{s.name}</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{s.flag} {s.university}</p>
                                </div>
                            </div>
                            
                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B' }}>Value</span>
                                    <span style={{ fontWeight: 700, color: '#10B981' }}>{s.amount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B' }}>Deadline</span>
                                    <span style={{ fontWeight: 700, color: '#EF4444' }}>{s.deadline}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B' }}>Match Rating</span>
                                    <span style={{ fontWeight: 800, background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: '12px' }}>
                                        {s.matchScore}%
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: '#64748B' }}>Level / Field</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{s.level} - {s.field}</span>
                                </div>
                            </div>

                            <div style={{ padding: '16px 20px', background: '#F8FAFC', display: 'flex', gap: '12px', borderTop: '1px solid #E2E8F0' }}>
                                <button
                                    onClick={() => openModal(s)}
                                    style={{
                                        flex: 1, padding: '10px', background: 'white', border: '1px solid #E2E8F0',
                                        borderRadius: '10px', fontWeight: 600, color: '#475569', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    style={{
                                        flex: 1, padding: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5',
                                        borderRadius: '10px', fontWeight: 600, color: '#EF4444', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '800px',
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                        animation: 'slideUp 0.3s ease'
                    }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderRadius: '24px 24px 0 0' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {editingId ? <Edit color="#38BDF8" size={24} /> : <Plus color="#38BDF8" size={24} />}
                                {editingId ? 'Edit Scholarship Entry' : 'Add New Scholarship'}
                            </h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                
                                <FormGroup label="Scholarship Name" icon={<GraduationCap size={16}/>}>
                                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="admin-input-premium" />
                                </FormGroup>
                                
                                <FormGroup label="University / Source" icon={<Filter size={16}/>}>
                                    <input required type="text" name="university" value={formData.university} onChange={handleInputChange} className="admin-input-premium" />
                                </FormGroup>

                                <FormGroup label="Country" icon={<span style={{fontSize:'12px'}}>🌍</span>}>
                                    <select name="country" value={formData.country} onChange={handleInputChange} className="admin-input-premium">
                                        <option value="">Select Country</option>
                                        <option value="UK">UK</option>
                                        <option value="USA">USA</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="China">China</option>
                                        <option value="Malaysia">Malaysia</option>
                                        <option value="Indonesia">Indonesia</option>
                                    </select>
                                </FormGroup>

                                <FormGroup label="Country Flag Emoji" icon={<span style={{fontSize:'12px'}}>🏳️</span>}>
                                    <input required type="text" name="flag" value={formData.flag} onChange={handleInputChange} className="admin-input-premium" placeholder="e.g. 🇬🇧" />
                                </FormGroup>

                                <FormGroup label="Field of Study" icon={<Search size={16}/>}>
                                    <select name="field" value={formData.field} onChange={handleInputChange} className="admin-input-premium">
                                        <option value="Any Field">Any Field</option>
                                        <option value="Business">Business</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Social Sciences">Social Sciences</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Medicine">Medicine</option>
                                    </select>
                                </FormGroup>

                                <FormGroup label="Degree Level" icon={<GraduationCap size={16}/>}>
                                    <select name="level" value={formData.level} onChange={handleInputChange} className="admin-input-premium">
                                        <option value="Bachelors">Bachelors</option>
                                        <option value="Masters">Masters</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </FormGroup>

                                <FormGroup label="Funding Type" icon={<DollarSign size={16}/>}>
                                    <select name="fundingType" value={formData.fundingType} onChange={handleInputChange} className="admin-input-premium">
                                        <option value="Full Ride">Full Ride</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Tuition Only">Tuition Only</option>
                                    </select>
                                </FormGroup>

                                <FormGroup label="Award Value (Text)" icon={<DollarSign size={16}/>}>
                                    <input required type="text" name="amount" value={formData.amount} onChange={handleInputChange} className="admin-input-premium" placeholder="e.g. £18,180 / year" />
                                </FormGroup>

                                <FormGroup label="Deadline Date" icon={<Clock size={16}/>}>
                                    <input required type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="admin-input-premium" />
                                </FormGroup>

                                <FormGroup label="Match Score (%)" icon={<ShieldCheck size={16}/>}>
                                    <input required type="number" min="0" max="100" name="matchScore" value={formData.matchScore} onChange={handleInputChange} className="admin-input-premium" />
                                </FormGroup>
                            </div>

                            <FormGroup label="External Apply Link URL" icon={<ExternalLink size={16}/>}>
                                <input required type="url" name="link" value={formData.link} onChange={handleInputChange} className="admin-input-premium" />
                            </FormGroup>

                            <FormGroup label="Logo/Image URL" icon={<ExternalLink size={16}/>}>
                                <input type="url" name="logo" value={formData.logo} onChange={handleInputChange} className="admin-input-premium" />
                            </FormGroup>

                            <FormGroup label="Description" width="full">
                                <textarea required name="description" value={formData.description} onChange={handleInputChange} className="admin-input-premium" rows={3} style={{ resize: 'vertical' }}></textarea>
                            </FormGroup>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
                                <button type="button" onClick={closeModal} style={{
                                    padding: '14px 24px', background: '#F1F5F9', color: '#475569',
                                    borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    padding: '14px 24px', background: '#0F172A', color: 'white',
                                    borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <Save size={18} /> {editingId ? 'Update Scholarship' : 'Save Scholarship'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            <div style={{
                position: 'fixed', bottom: '24px', right: '24px', background: '#10B981', color: 'white',
                padding: '16px 24px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                transform: savedPopup ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.9)',
                opacity: savedPopup ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 9999
            }}>
                <CheckCircle size={20} />
                Entry saved successfully!
            </div>

            <style>{`
                .admin-input-premium {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid #E2E8F0;
                    background: #F8FAFC;
                    font-size: 14px;
                    font-family: inherit;
                    color: #1E293B;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .admin-input-premium:focus {
                    background: white;
                    border-color: #38BDF8;
                    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

function FormGroup({ label, icon, children, width }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: width === 'full' ? '1 / -1' : 'auto', marginBottom: width === 'full' ? '0' : '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon && <span style={{ color: '#94A3B8' }}>{icon}</span>}
                {label}
            </label>
            {children}
        </div>
    );
}
