import { useState, useEffect } from 'react';
import {
    Check,
    X,
    Clock,
    Filter,
    Search,
    ChevronRight,
    AlertCircle,
    ExternalLink,
    FileText,
    User as UserIcon,
    ShieldCheck
} from 'lucide-react';
import '../../admin-enhanced.css';

export default function VerificationQueue() {
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    const [selectedIds, setSelectedIds] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [filterStatus, filterCategory]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams();
            if (filterStatus !== 'all') query.append('status', filterStatus);
            if (filterCategory !== 'all') query.append('category', filterCategory);

            const res = await fetch(`/api/admin/documents?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }

            const data = await res.json();
            setDocuments(data);

            // Clear selection when filters change
            setSelectedIds([]);

            if (data.length > 0 && !selectedDoc) {
                setSelectedDoc(data[0]);
                setFeedback(data[0].customerFeedback || '');
            } else if (data.length === 0) {
                setSelectedDoc(null);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDoc = (doc) => {
        // If clicking same doc, don't deselect, just ensure it's active
        setSelectedDoc(doc);
        setFeedback(doc.customerFeedback || '');
        setRejectionReason(doc.rejectionReason || ''); // Load existing reason if any
    };

    const toggleSelectDoc = (e, id) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredDocs.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredDocs.map(d => d.id));
        }
    };

    const handleReview = async (newStatus, reason = null) => {
        if (!selectedDoc) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const body = {
                status: newStatus,
                customerFeedback: feedback,
                adminNotes: `Reviewed as ${newStatus}`,
                rejectionReason: reason // Pass specifically for rejection
            };

            await fetch(`/api/admin/documents/${selectedDoc.id}/review`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            // Update local state
            setDocuments(prev => prev.map(d =>
                d.id === selectedDoc.id ? { ...d, status: newStatus, customerFeedback: feedback, rejectionReason: reason } : d
            ));

            setShowRejectModal(false);
            setRejectionReason('');

            // Move to next pending
            if (filterStatus === 'pending') {
                const currentIndex = documents.findIndex(d => d.id === selectedDoc.id);
                // Find next doc that isn't the current one (simple next index logic)
                const nextDoc = documents[currentIndex + 1] || documents[currentIndex - 1];
                if (nextDoc) {
                    handleSelectDoc(nextDoc);
                } else {
                    // Refresh if list might be empty
                    fetchDocuments();
                }
            }
        } catch (error) {
            console.error('Error reviewing document:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Approve ${selectedIds.length} documents?`)) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            // Parallel requests (or implement bulk endpoint in backend for efficiency)
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/admin/documents/${id}/review`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'verified',
                        customerFeedback: 'Bulk Approved',
                        adminNotes: 'Bulk Approved'
                    })
                })
            ));

            // Refresh list
            fetchDocuments();
            setSelectedIds([]);
        } catch (error) {
            console.error('Error bulk approving:', error);
        } finally {
            setSaving(false);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.User?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>The Approval Hub</h2>
                    <p>Efficiently verify student credentials and provide instant feedback.</p>
                </div>
                {selectedIds.length > 0 && (
                    <button className="btn-approve" onClick={handleBulkApprove} disabled={saving} style={{ marginLeft: 'auto' }}>
                        <Check size={16} /> Approve Selected ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="approval-hub-container">
                {/* Global Filters */}
                <div className="approval-hub-filters">
                    <div className="filter-group">
                        <Filter size={18} className="text-muted" />
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="pending">Pending Review</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                            <option value="all">All Status</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="scholarship">Scholarship</option>
                            <option value="visa">Visa / Admission</option>
                            <option value="job">Career / Job</option>
                        </select>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by student or document name..."
                            className="filter-select"
                            style={{ width: '100%', paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="approval-hub-content">
                    {/* Left: Queue Sidebar */}
                    <div className="queue-sidebar">
                        <div className="queue-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                checked={filteredDocs.length > 0 && selectedIds.length === filteredDocs.length}
                                onChange={toggleSelectAll}
                                style={{ cursor: 'pointer' }}
                            />
                            <span>Application Queue ({filteredDocs.length})</span>
                        </div>
                        <div className="queue-list">
                            {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}
                            {!loading && filteredDocs.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    <ShieldCheck size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                                    <p>No documents found</p>
                                </div>
                            )}
                            {filteredDocs.map(doc => (
                                <div
                                    key={doc.id}
                                    className={`queue-item ${selectedDoc?.id === doc.id ? 'active' : ''}`}
                                    onClick={() => handleSelectDoc(doc)}
                                >
                                    <div onClick={(e) => e.stopPropagation()} style={{ marginRight: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(doc.id)}
                                            onChange={(e) => toggleSelectDoc(e, doc.id)}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="queue-item-header">
                                            <span className="queue-student-name">{doc.User?.name}</span>
                                            <span className={`urgency-badge urgency-${doc.urgency || 'Normal'}`}>
                                                {doc.urgency || 'Normal'}
                                            </span>
                                        </div>
                                        <div className="queue-doc-type">{doc.documentType}</div>
                                        <div className="queue-meta">
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                            <span style={{ color: doc.status === 'verified' ? '#10b981' : doc.status === 'rejected' ? '#ef4444' : '#f59e0b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>
                                                {doc.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Review Panel */}
                    <div className="review-panel-hub">
                        {selectedDoc ? (
                            <>
                                <div className="document-previewer">
                                    <iframe
                                        src={selectedDoc.filePath}
                                        className="preview-iframe"
                                        title="Document Preview"
                                    />
                                </div>

                                <div className="review-controls">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                        <div className="admin-avatar-lg" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                                            {selectedDoc.User?.name[0]}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '16px' }}>{selectedDoc.User?.name}</h3>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{selectedDoc.User?.email}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Document Type</p>
                                        <p style={{ margin: 0, fontWeight: 700 }}>{selectedDoc.documentType}</p>
                                    </div>

                                    <div className="feedback-section-hub">
                                        <label>General Feedback (Optional)</label>
                                        <textarea
                                            className="feedback-textarea"
                                            rows={3}
                                            placeholder="Example: 'Great work!'"
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        />
                                    </div>

                                    <div className="action-buttons-hub">
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleReview('verified')}
                                            disabled={saving}
                                        >
                                            {saving ? '...' : <><Check size={18} /> Approve</>}
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={saving}
                                        >
                                            {saving ? '...' : <><X size={18} /> Reject</>}
                                        </button>
                                    </div>

                                    <div style={{ marginTop: 'auto', padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                                        <AlertCircle size={16} />
                                        <span>Approving will update student progress.</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <FileText size={64} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                                <h3 style={{ color: '#64748b' }}>Select a document to review</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rejection Modal */}
                {showRejectModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" style={{
                            background: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'
                        }}>
                            <h3 style={{ marginTop: 0, color: '#ef4444' }}>Reject Document</h3>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>
                                Please explain why this document is being rejected. The student will receive an email with this reason.
                            </p>

                            <textarea
                                className="feedback-textarea"
                                rows={6}
                                placeholder="Example: The scan is too blurry to read. Please re-upload a high-resolution version."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                style={{ width: '100%', marginBottom: '16px' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button className="btn-ghost" onClick={() => setShowRejectModal(false)}>Cancel</button>
                                <button
                                    className="btn-reject"
                                    onClick={() => handleReview('rejected', rejectionReason)}
                                    disabled={!rejectionReason.trim() || saving}
                                >
                                    {saving ? 'Sending...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
