import { useState, useEffect } from 'react';
import { Search, Filter, Bookmark } from 'lucide-react';
import ResourceCard from './ResourceCard';
import { getApiUrl } from '../../utils/apiConfig';

export default function ResourceLibrary() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const categories = ['All', 'CV/Resumes', 'SOP/Essays', 'Research', 'Visa'];

    useEffect(() => {
        fetchTemplates();
    }, [category]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const catMap = {
                'All': 'All',
                'CV/Resumes': 'CV',
                'SOP/Essays': 'Academic',
                'Research': 'Research',
                'Visa': 'Visa'
            };
            const query = new URLSearchParams({ 
                category: catMap[category],
                search 
            });
            const res = await fetch(getApiUrl(`/api/templates?${query}`), {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const data = await res.json();
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        // Debounce or immediate? Immediate for now as requested "Real-time"
        fetchTemplates();
    };

    const toggleFavorite = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login to favorite templates');
        
        try {
            const res = await fetch(getApiUrl(`/api/templates/${id}/favorite`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchTemplates();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <section style={{ marginTop: '56px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1E293B', margin: '0 0 4px' }}>
                        Student Resource Toolkit
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        Professional templates to fast-track your application success.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flex: '1', maxWidth: '400px', minWidth: '250px' }}>
                    <div style={{ 
                        position: 'relative', 
                        flex: 1 
                    }}>
                        <Search size={18} style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: '#94A3B8' 
                        }} />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={search}
                            onChange={handleSearch}
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Pill Icons */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '32px', 
                overflowX: 'auto', 
                paddingBottom: '8px' 
            }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '30px',
                            border: '1px solid',
                            borderColor: category === cat ? '#1E293B' : '#E2E8F0',
                            background: category === cat ? '#1E293B' : 'white',
                            color: category === cat ? 'white' : '#64748B',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                    <p style={{ color: '#64748B' }}>Fetching templates...</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {templates.map(template => (
                        <ResourceCard 
                            key={template.id} 
                            template={template} 
                            onToggleFavorite={toggleFavorite}
                        />
                    ))}
                    {templates.length === 0 && (
                        <div style={{ 
                            gridColumn: '1 / -1', 
                            padding: '60px', 
                            textAlign: 'center', 
                            background: 'white', 
                            borderRadius: '16px',
                            border: '1px dashed #CBD5E1'
                        }}>
                            <p style={{ color: '#94A3B8', fontWeight: 600 }}>No templates match your search or category.</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
