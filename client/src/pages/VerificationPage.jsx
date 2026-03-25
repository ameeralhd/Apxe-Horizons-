import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import {
    ShieldCheck, Upload, CheckCircle2, Clock, FileText, Info,
    GraduationCap, Briefcase, Globe, AlertCircle, ChevronRight,
    Download, RefreshCw, XCircle, Loader2, Eye, HelpCircle,
    Lock, Star, UserCheck, FileCheck, FileBadge, Heart, Wallet,
    X, Check, ChevronDown, BookOpen
} from 'lucide-react';
import ResourceLibrary from '../components/ResourceHub/ResourceLibrary';

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT CATEGORY DEFINITIONS (used for grouping in the vault)
// ─────────────────────────────────────────────────────────────────────────────
const DOC_GROUP_ICONS = {
    Academic: <GraduationCap size={16} />,
    Identity: <UserCheck size={16} />,
    Financial: <Wallet size={16} />,
    Language: <Globe size={16} />,
    Professional: <Briefcase size={16} />,
    Other: <FileText size={16} />
};

function getDocGroup(docName = '') {
    const n = docName.toLowerCase();
    if (n.includes('transcript') || n.includes('degree') || n.includes('academic') || n.includes('certificate') || n.includes('diploma')) return 'Academic';
    if (n.includes('passport') || n.includes('id') || n.includes('identity') || n.includes('photo')) return 'Identity';
    if (n.includes('sponsor') || n.includes('financial') || n.includes('bank') || n.includes('scholarship fund')) return 'Financial';
    if (n.includes('ielts') || n.includes('toefl') || n.includes('english') || n.includes('language')) return 'Language';
    if (n.includes('cv') || n.includes('resume') || n.includes('recommendation') || n.includes('reference') || n.includes('employment')) return 'Professional';
    return 'Other';
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP DEFINITIONS for each common document type
// ─────────────────────────────────────────────────────────────────────────────
const DOC_TOOLTIPS = {
    transcript: 'Must be an official copy issued by your university, with an institutional stamp and registrar signature.',
    passport: 'Passport must be valid for at least 6 months beyond your intended stay. Upload the main bio-data page.',
    ielts: 'Must be the official Test Report Form (TRF) issued by the British Council or IDP. Photocopies are not accepted.',
    toefl: 'Official electronic score report is required. Minimum score varies by institution.',
    sponsorship: 'A letter from your sponsor on official letterhead. Must include the sponsored amount and duration.',
    cv: 'A recent, up-to-date CV including your academic history, publications, and relevant experience.',
    recommendation: 'Must be signed by your recommender and submitted on institutional/company letterhead.',
    diploma: 'The original award certificate from your institution. Certified translations required if not in English.',
    default: 'Upload a high-quality scan or clear photo. Accepted formats: PDF, JPG, PNG. Max size: 10MB.'
};

function getTooltip(docName = '') {
    const n = docName.toLowerCase();
    for (const [key, tip] of Object.entries(DOC_TOOLTIPS)) {
        if (n.includes(key)) return tip;
    }
    return DOC_TOOLTIPS.default;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    verified: { label: 'VERIFIED', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC', icon: <CheckCircle2 size={14} /> },
    pending: { label: 'UNDER REVIEW', bg: '#FEF9C3', color: '#92400E', border: '#FDE68A', icon: <Clock size={14} /> },
    rejected: { label: 'ACTION REQUIRED', bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA', icon: <AlertCircle size={14} /> },
    missing: { label: 'NOT STARTED', bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1', icon: <XCircle size={14} /> },
    analyzing: { label: 'ANALYZING…', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', icon: <Loader2 size={14} className="spin" /> }
};

export default function VerificationPage() {
    const [selectedCategory, setSelectedCategory] = useState('scholarship');
    const [selectedCountry, setSelectedCountry] = useState('USA');
    const [selectedType, setSelectedType] = useState('Undergraduate');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [groupOpen, setGroupOpen] = useState({});
    const dropRef = useRef(null);

    const categories = [
        { id: 'scholarship', title: 'Scholarship', icon: <GraduationCap size={20} /> },
        { id: 'job', title: 'Job Application', icon: <Briefcase size={20} /> },
        { id: 'visa', title: 'Admission / Visa', icon: <Globe size={20} /> }
    ];
    const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany'];
    const scholarshipTypes = ['Undergraduate', 'Postgraduate', 'PhD'];
    const jobTypes = ['Technical', 'Management', 'Creative'];

    // ── Fetch path from DB ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchUserPath = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/documents/path', { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    setSelectedCategory(data.category);
                    setSelectedType(data.type);
                    setSelectedCountry(data.country);
                }
            } catch (err) { /* silent */ }
        };
        fetchUserPath();
    }, []);

    const savePath = async (category, type, country) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await fetch('/api/documents/path', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, type, country })
            });
        } catch (err) { /* silent */ }
    };

    useEffect(() => {
        fetchRequirements();
        savePath(selectedCategory, selectedType, selectedCountry);
        setGroupOpen({});
    }, [selectedCategory, selectedCountry, selectedType]);

    const fetchRequirements = async () => {
        if (!selectedCategory) return;
        setLoading(true);
        try {
            const query = new URLSearchParams({ category: selectedCategory });
            if (selectedCategory === 'visa') query.append('country', selectedCountry);
            else query.append('type', selectedType);
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`/api/documents/requirements?${query}`, { headers });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDocuments(Array.isArray(data) ? data : []);
        } catch {
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        setSelectedType(catId === 'scholarship' ? 'Undergraduate' : catId === 'job' ? 'Technical' : selectedType);
    };

    const handleFileUpload = async (docId, file, documentType) => {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'analyzing', uploadDate: new Date().toLocaleDateString() } : d));
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docId', docId);
        formData.append('category', selectedCategory);
        formData.append('documentType', documentType);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/documents/analyze', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await res.json();
            setDocuments(prev => prev.map(d => d.id === docId
                ? { ...d, status: result.status === 'verified' ? 'verified' : 'error', feedback: result.feedback, issues: result.issues || [], uploadDate: new Date().toLocaleDateString() }
                : d
            ));
        } catch {
            setDocuments(prev => prev.map(d => d.id === docId
                ? { ...d, status: 'error', feedback: 'Analysis failed. Please try again.', issues: [] }
                : d
            ));
        }
    };

    // ── Drag & Drop (bulk zone) ────────────────────────────────────────────────
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files).filter(f =>
            ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type) && f.size <= 10 * 1024 * 1024
        );
        setUploadQueue(prev => [...prev, ...files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + ' KB', status: 'queued' }))]);
    }, []);

    const verifiedCount = documents.filter(d => d.status === 'verified').length;
    const progress = documents.length > 0 ? Math.round((verifiedCount / documents.length) * 100) : 0;

    // Group documents
    const grouped = documents.reduce((acc, doc) => {
        const g = getDocGroup(doc.name);
        if (!acc[g]) acc[g] = [];
        acc[g].push(doc);
        return acc;
    }, {});

    // Pending actions (docs not yet verified)
    const pendingActions = documents.filter(d => d.status !== 'verified').map(d => d.name);

    const circumference = 2 * Math.PI * 42; // r=42

    return (
        <Layout>
            <section style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                    {/* ── Page Header ─────────────────────────────────────────── */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1E293B', margin: 0 }}>Document Vault</h1>
                                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Secure, encrypted storage for your verification documents.</p>
                            </div>
                        </div>

                        {/* Trust badges row */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                            <TrustBadge icon={<Lock size={14} />} text="End-to-end encrypted storage" />
                            <TrustBadge icon={<Star size={14} />} text="Expert review within 24–48 hours" />
                            <TrustBadge icon={<ShieldCheck size={14} />} text="ISO 27001 Compliant" />
                        </div>
                    </div>

                    {/* ── Drag & Drop Upload Zone ──────────────────────────────── */}
                    <div
                        ref={dropRef}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${dragActive ? '#2DD4BF' : '#CBD5E1'}`,
                            borderRadius: '16px',
                            background: dragActive ? '#F0FDFA' : 'white',
                            padding: '32px',
                            textAlign: 'center',
                            marginBottom: '28px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#2DD4BF' }}>
                            <Upload size={28} />
                        </div>
                        <p style={{ fontWeight: 800, fontSize: '16px', color: '#1E293B', margin: '0 0 4px' }}>
                            Drag & Drop Documents Here
                        </p>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px' }}>
                            PDF, JPG, PNG — up to 10MB per file
                        </p>
                        <label style={{ padding: '10px 24px', background: '#1E293B', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-block' }}>
                            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                                onChange={e => {
                                    const files = Array.from(e.target.files).filter(f => f.size <= 10 * 1024 * 1024);
                                    setUploadQueue(prev => [...prev, ...files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + ' KB', status: 'queued' }))]);
                                }}
                            />
                            Browse Files
                        </label>

                        {/* Upload queue preview */}
                        {uploadQueue.length > 0 && (
                            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                {uploadQueue.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#F1F5F9', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                                        <FileText size={14} color="#2DD4BF" />
                                        <span>{f.name}</span>
                                        <span style={{ color: '#94A3B8' }}>({f.size})</span>
                                        <button onClick={() => setUploadQueue(prev => prev.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Main content: Vault + Sidebar ───────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

                        {/* LEFT: The Vault ──────────────────────────────────────── */}
                        <div>
                            {/* Category Tabs */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: '10px',
                                            border: '1px solid',
                                            borderColor: selectedCategory === cat.id ? '#2DD4BF' : '#E2E8F0',
                                            background: selectedCategory === cat.id ? '#1E293B' : 'white',
                                            color: selectedCategory === cat.id ? 'white' : '#475569',
                                            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.2s'
                                        }}>
                                        {cat.icon} {cat.title}
                                    </button>
                                ))}
                            </div>

                            {/* Sub-type selectors */}
                            <div style={{ padding: '14px 20px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                {selectedCategory === 'visa' ? (
                                    <>
                                        <Globe size={18} color="#2DD4BF" />
                                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>Destination:</span>
                                        <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '13px', color: '#1E293B', background: '#F8FAFC' }}>
                                            {countries.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </>
                                ) : selectedCategory === 'scholarship' ? (
                                    <>
                                        <GraduationCap size={18} color="#2DD4BF" />
                                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>Academic Level:</span>
                                        <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '13px', color: '#1E293B', background: '#F8FAFC' }}>
                                            {scholarshipTypes.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <Briefcase size={18} color="#2DD4BF" />
                                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>Role Type:</span>
                                        <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '13px', color: '#1E293B', background: '#F8FAFC' }}>
                                            {jobTypes.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </>
                                )}
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
                                    <Info size={14} />
                                    Showing <strong style={{ color: '#1E293B' }}>{documents.length}</strong> required documents
                                    <button onClick={fetchRequirements} title="Refresh" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
                                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                                    </button>
                                </div>
                            </div>

                            {/* Document Vault Table */}
                            {loading ? (
                                <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                                    <Loader2 size={40} color="#2DD4BF" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }} />
                                    <p style={{ color: '#64748B', fontWeight: 600 }}>Loading document requirements…</p>
                                </div>
                            ) : documents.length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <FileText size={40} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
                                    <p style={{ color: '#94A3B8', fontWeight: 600 }}>No documents found for this selection.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {Object.entries(grouped).map(([group, docs]) => (
                                        <DocumentGroup
                                            key={group}
                                            group={group}
                                            docs={docs}
                                            isOpen={groupOpen[group] !== false}
                                            onToggle={() => setGroupOpen(p => ({ ...p, [group]: p[group] === false ? true : false }))}
                                            onUpload={handleFileUpload}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Expert Review Banner */}
                            <div style={{ marginTop: '24px', padding: '20px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(45,212,191,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#2DD4BF' }}>
                                    <UserCheck size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 800, fontSize: '15px', margin: '0 0 4px' }}>Expert Review Guaranteed</p>
                                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Our certified specialists review every submission within <strong style={{ color: '#2DD4BF' }}>24–48 hours</strong> and provide personalized feedback.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Sidebar ─────────────────────────────────────────── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Verification Score Ring */}
                            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '28px 24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                                <p style={{ fontWeight: 800, fontSize: '13px', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '20px' }}>Verification Score</p>
                                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                                    <svg width="120" height="120" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke={progress >= 80 ? '#10B981' : progress >= 40 ? '#F59E0B' : '#EF4444'}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference - (circumference * progress) / 100}
                                            transform="rotate(-90 50 50)"
                                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '28px', fontWeight: 900, color: '#1E293B', lineHeight: 1 }}>{progress}%</span>
                                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>Complete</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                                    <strong style={{ color: '#1E293B' }}>{verifiedCount}</strong> of <strong style={{ color: '#1E293B' }}>{documents.length}</strong> documents verified
                                </p>
                                {progress === 100 ? (
                                    <div style={{ marginTop: '16px', padding: '10px', background: '#DCFCE7', borderRadius: '10px', color: '#15803D', fontSize: '12px', fontWeight: 700 }}>
                                        <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                        Profile Complete!
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '16px', padding: '10px', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '12px' }}>
                                        {100 - progress}% remaining to reach full verification
                                    </div>
                                )}
                            </div>

                            {/* Pending Actions */}
                            {pendingActions.length > 0 && (
                                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                                    <p style={{ fontWeight: 800, fontSize: '13px', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={14} color="#F59E0B" /> Pending Actions
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {pendingActions.slice(0, 5).map((name, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#475569' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                                                <span>{name}</span>
                                            </div>
                                        ))}
                                        {pendingActions.length > 5 && (
                                            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>+{pendingActions.length - 5} more</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Encryption Trust card */}
                            <div style={{ background: '#0F172A', borderRadius: '20px', padding: '24px', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Lock size={18} color="#2DD4BF" />
                                    <p style={{ fontWeight: 800, fontSize: '13px', margin: 0 }}>Bank-Grade Security</p>
                                </div>
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.6 }}>
                                    Your documents are encrypted with AES-256 and stored in a secure, access-controlled vault.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {['256-bit AES Encryption', 'GDPR Compliant Storage', 'Zero third-party sharing'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
                                            <Check size={12} color="#2DD4BF" /> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    {/* Resource Library Section */}
                    <ResourceLibrary />
                </div>
            </section>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                .vault-row:hover { background: #F8FAFC !important; }
            `}</style>
        </Layout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT GROUP (accordion-style category section)
// ─────────────────────────────────────────────────────────────────────────────
function DocumentGroup({ group, docs, isOpen, onToggle, onUpload }) {
    const verifiedInGroup = docs.filter(d => d.status === 'verified').length;
    return (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {/* Group Header */}
            <button onClick={onToggle} style={{
                width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                borderBottom: isOpen ? '1px solid #F1F5F9' : 'none'
            }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                    {DOC_GROUP_ICONS[group] || <FileText size={16} />}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: '#1E293B' }}>{group}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>{verifiedInGroup}/{docs.length} verified</p>
                </div>
                {/* Mini progress */}
                <div style={{ width: '80px', height: '4px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${docs.length > 0 ? (verifiedInGroup / docs.length) * 100 : 0}%`, background: '#2DD4BF', transition: 'width 0.5s' }} />
                </div>
                <ChevronDown size={16} color="#94A3B8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {isOpen && (
                <div>
                    {/* Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 160px 140px', gap: '12px', padding: '10px 20px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        {['Document', 'Upload Date', 'Status', 'Action'].map(h => (
                            <span key={h} style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                        ))}
                    </div>
                    {docs.map((doc, i) => (
                        <VaultRow key={doc.id} doc={doc} onUpload={onUpload} isLast={i === docs.length - 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// VAULT ROW — one document per row with status badge, action, tooltip
// ─────────────────────────────────────────────────────────────────────────────
function VaultRow({ doc, onUpload, isLast }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const rawStatus = doc.status === 'analyzing' ? 'analyzing' :
        doc.status === 'error' ? 'rejected' :
            doc.status === 'verified' ? 'verified' :
                doc.status === 'pending' ? 'pending' : 'missing';

    const cfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.missing;
    const tooltip = getTooltip(doc.name);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile({ name: file.name, size: (file.size / 1024).toFixed(0) + ' KB', url: URL.createObjectURL(file) });
        onUpload(doc.id, file, doc.name);
    };

    return (
        <div className="vault-row" style={{
            display: 'grid', gridTemplateColumns: '1fr 130px 160px 140px',
            gap: '12px', padding: '16px 20px', alignItems: 'center',
            borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
            transition: 'background 0.15s'
        }}>
            {/* Document Name + Tooltip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={16} color="#64748B" />
                </div>
                <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                    {uploadedFile && <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8' }}>{uploadedFile.name} · {uploadedFile.size}</p>}
                    {doc.feedback && rawStatus === 'rejected' && (
                        <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>{doc.feedback}</p>
                    )}
                </div>
                {/* Info Tooltip */}
                <div style={{ position: 'relative', flexShrink: 0 }} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}>
                        <HelpCircle size={11} color="#94A3B8" />
                    </div>
                    {showTooltip && (
                        <div style={{
                            position: 'absolute', left: '24px', top: '-8px', zIndex: 100,
                            background: '#1E293B', color: 'white', borderRadius: '10px',
                            padding: '10px 14px', width: '240px', fontSize: '11px', lineHeight: 1.6,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', pointerEvents: 'none'
                        }}>
                            <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#2DD4BF', fontSize: '10px', textTransform: 'uppercase' }}>Requirements</p>
                            {tooltip}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Date */}
            <span style={{ fontSize: '12px', color: '#64748B' }}>
                {doc.uploadDate || (uploadedFile ? new Date().toLocaleDateString() : '—')}
            </span>

            {/* Status Badge */}
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                width: 'fit-content'
            }}>
                {cfg.icon} {cfg.label}
            </span>

            {/* Action Button */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {uploadedFile && (
                    <button onClick={() => window.open(uploadedFile.url, '_blank')} style={{
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0',
                        background: 'white', color: '#475569', fontSize: '11px', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <Eye size={12} /> View
                    </button>
                )}
                {rawStatus !== 'analyzing' && (
                    <label style={{
                        padding: '6px 12px', borderRadius: '8px',
                        background: rawStatus === 'verified' ? '#F1F5F9' : '#1E293B',
                        color: rawStatus === 'verified' ? '#64748B' : 'white',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange} />
                        <Upload size={12} /> {rawStatus === 'verified' ? 'Replace' : 'Upload'}
                    </label>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BADGE
// ─────────────────────────────────────────────────────────────────────────────
function TrustBadge({ icon, text }) {
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', background: 'white', borderRadius: '20px',
            border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600, color: '#475569',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
            <span style={{ color: '#2DD4BF' }}>{icon}</span>
            {text}
        </div>
    );
}
