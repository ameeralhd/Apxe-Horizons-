import { useState, useEffect } from 'react';
import { Search, Filter, Eye, FileText, Mail, ShieldCheck, Users } from 'lucide-react';
import '../../admin-enhanced.css';

export default function ApplicantManagement() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchApplicants();
    }, [page, search]);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams({ page, search, limit: 20 });
            const res = await fetch(`/api/admin/applicants?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }

            const data = await res.json();
            setApplicants(data.applicants || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching applicants:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (progress) => {
        if (progress === 100) return '#0d9488';
        if (progress >= 75) return '#10b981';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="admin-page animate-fade-in" style={{ padding: '0 20px' }}>
            <div className="admin-page-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '40px' 
            }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B' }}>Applicant Management</h2>
                    <p style={{ marginTop: '8px', color: '#64748B', fontSize: '16px' }}>Track student journeys and facilitate global academic opportunities.</p>
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
                        <Users size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Total Students</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{applicants.length}</h3>
                    </div>
                </div>
                <div style={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.15)'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Ready to Apply</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{applicants.filter(a => a.progress === 100).length}</h3>
                    </div>
                </div>
                <div style={{ 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                    padding: '32px', 
                    borderRadius: '24px', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.15)'
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
                        <FileText size={32} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9 }}>Pending Verification</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>{applicants.filter(a => a.progress < 100 && a.totalDocuments > 0).length}</h3>
                    </div>
                </div>
            </div>

            {/* Toolbar Section */}
            <div style={{ 
                background: 'white', 
                padding: '32px', 
                borderRadius: '32px', 
                border: '1px solid #F1F5F9',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)',
                marginBottom: '32px'
            }}>
                <div style={{ 
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
                            placeholder="Find student by name or email..."
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
                        <button className="admin-btn admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', fontWeight: 700 }}>
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Applicants Table */}
            <div style={{ 
                background: 'white', 
                borderRadius: '32px', 
                border: '1px solid #F1F5F9',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)',
                minHeight: '400px'
            }}>
                {loading ? (
                    <div style={{ padding: '100px', textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
                        <p style={{ color: '#64748B', fontWeight: 600 }}>Syncing applicant data...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                                        <th style={{ padding: '24px 32px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Entity</th>
                                        <th style={{ padding: '24px 32px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Point</th>
                                        <th style={{ padding: '24px 32px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Path</th>
                                        <th style={{ padding: '24px 32px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</th>
                                        <th style={{ padding: '24px 32px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</th>
                                        <th style={{ padding: '24px 32px', color: '#64748B', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map(applicant => (
                                        <tr key={applicant.id} className="admin-table-row" style={{ transition: 'all 0.2s', borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ 
                                                        width: '48px', 
                                                        height: '48px', 
                                                        borderRadius: '16px', 
                                                        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '18px',
                                                        fontWeight: 900,
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {applicant.name.charAt(0)}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '15px' }}>{applicant.name}</span>
                                                        {applicant.progress === 100 && (
                                                            <span style={{ 
                                                                fontSize: '10px', 
                                                                fontWeight: 900, 
                                                                color: '#0D9488', 
                                                                background: '#F0FDFA', 
                                                                padding: '2px 8px', 
                                                                borderRadius: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                width: 'fit-content'
                                                            }}>
                                                                <ShieldCheck size={10} strokeWidth={3} /> VERIFIED
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '14px' }}>{applicant.email}</span>
                                                    <span style={{ color: '#94A3B8', fontSize: '13px' }}>{applicant.phone || 'No phone record'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '100px', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ 
                                                            width: `${applicant.progress}%`, 
                                                            height: '100%', 
                                                            background: getProgressColor(applicant.progress),
                                                            borderRadius: '4px'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontWeight: 900, color: getProgressColor(applicant.progress), fontSize: '14px' }}>
                                                        {applicant.progress}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ 
                                                        background: applicant.verifiedDocuments === applicant.totalDocuments && applicant.totalDocuments > 0 ? '#F0FDFA' : '#F8FAFC',
                                                        padding: '6px 12px',
                                                        borderRadius: '10px',
                                                        border: '1px solid #F1F5F9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <FileText size={14} color={applicant.verifiedDocuments === applicant.totalDocuments && applicant.totalDocuments > 0 ? '#2DD4BF' : '#94A3B8'} />
                                                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                                                            {applicant.verifiedDocuments}/{applicant.totalDocuments}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '24px 32px', color: '#64748B', fontSize: '14px', fontWeight: 600 }}>
                                                {new Date(applicant.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                    <button className="admin-icon-btn shadow-sm" title="Inspect Profile" style={{ background: '#F8FAFC', padding: '10px', borderRadius: '12px' }}>
                                                        <Eye size={18} color="#64748B" />
                                                    </button>
                                                    <button className="admin-icon-btn shadow-sm" title="Communication Hub" style={{ background: '#F8FAFC', padding: '10px', borderRadius: '12px' }}>
                                                        <Mail size={18} color="#64748B" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ 
                                padding: '32px', 
                                borderTop: '1px solid #F1F5F9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600 }}>
                                    Displaying page <span style={{ color: '#1E293B', fontWeight: 800 }}>{page}</span> of <span style={{ color: '#1E293B', fontWeight: 800 }}>{totalPages}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #F1F5F9',
                                            background: page === 1 ? '#F8FAFC' : 'white',
                                            color: page === 1 ? '#CBD5E1' : '#1E293B',
                                            fontSize: '14px',
                                            fontWeight: 800,
                                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #F1F5F9',
                                            background: page === totalPages ? '#F8FAFC' : 'white',
                                            color: page === totalPages ? '#CBD5E1' : '#1E293B',
                                            fontSize: '14px',
                                            fontWeight: 800,
                                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!loading && applicants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px 40px' }}>
                        <Users size={64} style={{ color: '#CBD5E1', marginBottom: '24px' }} />
                        <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>No students found</h4>
                        <p style={{ color: '#94A3B8' }}>Try adjusting your search or filters to find specific applicants.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
