import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import ConsultantCard from '../components/ConsultantCard';
import Layout from '../components/Layout';
import './ExpertSelection.css';

export default function ExpertSelection() {
    const navigate = useNavigate();
    const [consultants, setConsultants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConsultants();
    }, []);

    const fetchConsultants = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/consultants?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                // Normalize availability
                const normalized = data.map(c => {
                    if (Array.isArray(c.Availabilities)) {
                        const availObj = {};
                        c.Availabilities.forEach(a => {
                            availObj[a.dayOfWeek] = [a.startTime, a.endTime];
                        });
                        return { ...c, availability: availObj };
                    }
                    return c;
                });
                setConsultants(normalized);
            } else {
                setConsultants([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching consultants:', error);
            setLoading(false);
        }
    };

    const filteredConsultants = consultants.filter(c => {
        const nameMatch = c.User?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const specialtyMatch = (Array.isArray(c.expertise) ? c.expertise : [])
            .some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        return nameMatch || specialtyMatch;
    });

    const handleSelectExpert = (consultant) => {
        // Navigate to consultation page with pre-selected consultant
        navigate('/consultation', { state: { selectedConsultantId: consultant.id } });
    };

    return (
        <Layout>
            <div className="expert-selection-page">
                <div className="selection-container">
                    <div className="selection-header">
                        <div className="header-content">
                            <h1 className="selection-title">Choose Your <span className="text-gradient">Professional Expert</span></h1>
                            <p className="selection-subtitle">Select a verified specialist to guide you through your international journey.</p>
                        </div>

                        <div className="search-filter-wrapper">
                            <div className="search-box">
                                <Search size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name or specialty (e.g. Visa, Scholarship)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <button className="filter-pill-btn">
                                <SlidersHorizontal size={18} />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="selection-loading">
                            <div className="spinner"></div>
                            <p>Finding the best experts for you...</p>
                        </div>
                    ) : filteredConsultants.length > 0 ? (
                        <div className="expert-grid">
                            {filteredConsultants.map(c => (
                                <ConsultantCard
                                    key={c.id}
                                    consultant={c}
                                    onSelect={handleSelectExpert}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon-wrapper">
                                <Users size={48} />
                            </div>
                            <h2 className="empty-title">All our experts are currently busy</h2>
                            <p className="empty-desc">Please check back in a few minutes or try a different search term!</p>
                            <button
                                className="reset-search-btn"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
