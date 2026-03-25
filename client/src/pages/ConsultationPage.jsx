import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
    Calendar,
    Clock,
    User,
    CheckCircle,
    FileText,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Star,
    CheckCircle2,
    X,
    GraduationCap,
    Globe,
    Briefcase,
    Check,
    MapPin,
    Users,
    Upload,
    AlertCircle,
    Play,
    MessageSquare
} from 'lucide-react';

export default function ConsultationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', time: '', topic: '', message: '', documentName: null });
    const [consultants, setConsultants] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewingBio, setViewingBio] = useState(null);
    const [verificationPercent, setVerificationPercent] = useState(0);
    const [verifyingStatus, setVerifyingStatus] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [lastServerUpdate, setLastServerUpdate] = useState(null);

    const categories = [
        { id: 'scholarship', title: 'Scholarship Guidance', icon: <GraduationCap size={32} />, desc: 'Expert help with essays, applications, and finding fully funded opportunities.' },
        { id: 'visa', title: 'Visa Consultation', icon: <Globe size={32} />, desc: 'Navigate complex immigration rules for US, UK, Canada, and more.' },
        { id: 'career', title: 'Career Coaching', icon: <Briefcase size={32} />, desc: 'Resume reviews, interview prep, and job market strategies.' }
    ];

    const filters = ['All', 'Scholarship Experts', 'Visa Specialists', 'Admissions Coaches'];

    useEffect(() => {
        const fetchVerificationStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // 1. Fetch User Path
                const pathRes = await fetch('/api/documents/path', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let userPath = { category: 'scholarship', type: 'Undergraduate', country: 'USA' };
                if (pathRes.ok) {
                    userPath = await pathRes.json();
                }

                // 2. Fetch Requirements
                const query = new URLSearchParams({ category: userPath.category });
                if (userPath.category === 'visa') {
                    query.append('country', userPath.country);
                } else {
                    query.append('type', userPath.type);
                }

                const reqRes = await fetch(`/api/documents/requirements?${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (reqRes.ok) {
                    const requirements = await reqRes.json();
                    if (Array.isArray(requirements) && requirements.length > 0) {
                        const verifiedCount = requirements.filter(r => r.status === 'verified').length;
                        const percent = Math.round((verifiedCount / requirements.length) * 100);
                        setVerificationPercent(percent);
                    }
                }
            } catch (error) {
                console.error("Error fetching verification status", error);
            } finally {
                setVerifyingStatus(false);
            }
        };

        fetchVerificationStatus();

        const fetchConsultants = async () => {
            try {
                // Add timestamp and headers to prevent caching
                const res = await fetch(`/api/consultants?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Normalize availability if it's an array from DB but expected as object by component
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

                    // Store last updated timestamp for sync verification
                    const serverTS = res.headers.get('X-Last-Updated');
                    if (serverTS) {
                        setLastServerUpdate(serverTS);
                        console.log(`[Elite Sync] Data verified. Last server update: ${serverTS}`);
                    }
                } else {
                    console.error("API returned non-array for consultants:", data);
                    setConsultants([]);
                }
                // Verification: Log the last updated timestamp from server
                const serverLastUpdated = res.headers.get('X-Last-Updated');
                if (serverLastUpdated) {
                    console.log(`[Elite Sync] Data verified. Last server update: ${serverLastUpdated}`);
                }
            } catch (err) {
                console.error("Failed to load consultants", err);
                setConsultants([]);
            }
        };

        fetchConsultants();

        // Restore Draft if exists and no specific reschedule param
        const params = new URLSearchParams(window.location.search);
        if (!params.get('reschedule')) {
            const draft = localStorage.getItem('consultation_draft');
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    // Optional: Check timestamp expiry (e.g. 24h)
                    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                        setStep(parsed.step);
                        setBookingData(parsed.bookingData);
                    }
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
        }
    }, []);

    // Save draft state on step change
    useEffect(() => {
        if (step > 1 && step < 5) {
            const draft = {
                step,
                bookingData,
                timestamp: Date.now()
            };
            localStorage.setItem('consultation_draft', JSON.stringify(draft));
        }
    }, [step, bookingData]);

    const handleNext = async () => {
        // Sync Verification: Before entering Expert Selection (2) or Scheduling (3), check for remote updates
        if (step === 1 || step === 2) {
            try {
                const headCheck = await fetch(`/api/consultants?t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
                if (headCheck.status === 401) {
                    localStorage.clear();
                    window.location.href = '/login?expired=true';
                    return;
                }
                const currentServerTS = headCheck.headers.get('X-Last-Updated');

                if (currentServerTS && currentServerTS !== lastServerUpdate) {
                    console.warn(`[Elite Sync] Remote data changed (${currentServerTS}). Forcing re-fetch...`);
                    // Call the logic to re-fetch
                    const res = await fetch(`/api/consultants?t=${Date.now()}`, { cache: 'no-store' });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const normalized = data.map(c => {
                            if (Array.isArray(c.Availabilities)) {
                                const availObj = {};
                                c.Availabilities.forEach(a => { availObj[a.dayOfWeek] = [a.startTime, a.endTime]; });
                                return { ...c, availability: availObj };
                            }
                            return c;
                        });
                        setConsultants(normalized);
                        setLastServerUpdate(currentServerTS);
                    }
                }
            } catch (e) {
                console.error("Sync verification failed", e);
            }
        }

        if (step < 5) setStep(step + 1);
        if (step === 5) handleFinalConfirm();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Constraint check (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large (Max 5MB)');
            return;
        }

        setUploading(true);
        setUploadProgress(10); // Start
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            // [FIX] Use relative URL
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type is auto-set by FormData
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();

            setUploadProgress(100);
            setUploadSuccess(true);
            setBookingData(prev => ({
                ...prev,
                documentName: file.name,
                documentPath: data.filePath // Store the server path
            }));
        } catch (err) {
            console.error(err);
            alert('Upload failed: ' + err.message);
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    // Renamed handleBooking to handleFinalConfirm and updated its logic
    const handleFinalConfirm = async () => {
        setIsProcessing(true); // Keep processing state for the API call
        try {
            setRedirecting(true); // Set redirecting state for UI transition
            const token = localStorage.getItem('token');
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    consultantId: selectedConsultant.id,
                    serviceId: selectedCategory?.id, // Assuming selectedCategory.id is the serviceId
                    date: bookingData.date,
                    time: bookingData.time,
                    topic: bookingData.topic,
                    notes: bookingData.message, // Using notes for message
                    documentPath: bookingData.documentPath || null // Using documentPath from bookingData
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Brief delay for the loading experience as requested
                setTimeout(() => {
                    navigate(`/payment/${data.id}`);
                }, 1500);
            } else {
                setRedirecting(false); // Reset redirecting if booking fails
                if (res.status === 401) {
                    localStorage.clear();
                    window.location.href = '/login?expired=true';
                    return;
                }
                const errorData = await res.json().catch(() => ({}));
                const detailedError = errorData.error ? `\nReason: ${errorData.error}` : '';
                const stackTrace = errorData.stack ? `\n\nStack: ${errorData.stack.substring(0, 300)}...` : '';
                alert(`Booking failed: ${errorData.message || 'Please try again.'}${detailedError}${stackTrace}`);
            }
        } catch (err) {
            setRedirecting(false); // Reset redirecting on error
            console.error(err);
        } finally {
            setIsProcessing(false); // Reset processing state
        }
    };

    const filteredConsultants = consultants.filter(c => {
        if (activeFilter === 'All') return true;

        const searchStr = `${c.title} ${c.expertise?.join(' ')}`.toLowerCase();

        if (activeFilter === 'Scholarship Experts') return searchStr.includes('scholarship');
        if (activeFilter === 'Visa Specialists') return searchStr.includes('visa');
        if (activeFilter === 'Admissions Coaches') return searchStr.includes('coach') || searchStr.includes('admission');

        return true;
    });

    return (
        <Layout>
            {redirecting && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="spinner" style={{ borderTopColor: '#2DD4BF', width: '60px', height: '60px' }}></div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginTop: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
                        Preparing your secure checkout...
                    </h2>
                    <p style={{ color: '#64748B', fontWeight: 600 }}>
                        You are being redirected to our payment partner.
                    </p>
                </div>
            )}
            <section className="section" style={{ background: 'var(--color-bg-alt)', minHeight: 'calc(100vh - 80px)' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>

                    {/* Page Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Consultation Booking</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Secure your future with professional international guidance.</p>
                    </div>

                    <div className="booking-layout" style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(280px, auto) 1fr',
                        gap: '40px',
                        alignItems: 'start'
                    }}>
                        {/* Sidebar Stepper (Desktop) */}
                        <div style={{
                            width: '280px',
                            background: 'white',
                            borderRadius: '24px',
                            padding: 'var(--space-8)',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid #F1F5F9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-6)',
                            height: 'fit-content',
                            zIndex: 10,
                            position: 'sticky',
                            top: '110px'
                        }}>
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                                <StepNodeV step={1} current={step} title="Select Interest" subtitle="Select your interest" isLast={false} />
                                <StepNodeV step={2} current={step} title="Expert Choice" subtitle="Select a specialist" isLast={false} />
                                <StepNodeV step={3} current={step} title="Scheduling" subtitle="Pick date & time" isLast={false} />
                                <StepNodeV step={4} current={step} title="Consultation Details" subtitle="Message & Docs" isLast={false} />
                                <StepNodeV step={5} current={step} title="Final Review" subtitle="Confirm booking" isLast={true} />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="card shadow-lg" style={{
                                padding: 'var(--space-10)',
                                border: 'none',
                                borderRadius: '24px',
                                background: 'white', // Explicit white to prevent transparency
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                            }}>
                                {/* Mobile Progress Bar */}
                                <div className="horizontal-stepper" style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', marginBottom: 'var(--space-8)' }}>
                                    <div className="horizontal-progress-fill" style={{ width: `${(step - 1) / 4 * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
                                </div>

                                {/* Step 1: Category */}
                                {step === 1 && (
                                    <div className="animate-fade-in">
                                        <div style={{ marginBottom: 'var(--space-8)' }}>
                                            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>What can we help with?</h1>
                                            <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 500 }}>Choose the service that fits your current needs.</p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                                            {categories.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    className={`card ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                                    style={{
                                                        padding: 'var(--space-8)',
                                                        cursor: 'pointer',
                                                        border: selectedCategory?.id === cat.id ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                                                        position: 'relative',
                                                        transition: 'all 0.2s ease',
                                                        background: 'white',
                                                        borderRadius: '20px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 'var(--space-4)',
                                                        boxShadow: selectedCategory?.id === cat.id ? '0 10px 20px rgba(45, 212, 191, 0.1)' : 'var(--shadow-sm)'
                                                    }}
                                                    onClick={() => setSelectedCategory(cat)}
                                                >
                                                    <div style={{
                                                        width: '56px',
                                                        height: '56px',
                                                        borderRadius: '16px',
                                                        background: selectedCategory?.id === cat.id ? 'var(--color-primary)' : '#F0FDFA',
                                                        color: selectedCategory?.id === cat.id ? 'white' : 'var(--color-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {cat.icon}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#1E293B', marginBottom: 'var(--space-2)' }}>{cat.title}</h3>
                                                        <p style={{ fontSize: 'var(--text-sm)', color: '#64748B', lineHeight: 1.6 }}>{cat.desc}</p>
                                                    </div>
                                                    {selectedCategory?.id === cat.id && (
                                                        <div style={{
                                                            position: 'absolute', top: '12px', right: '12px',
                                                            background: 'var(--color-primary)', color: 'white',
                                                            borderRadius: '50%', padding: '4px'
                                                        }}>
                                                            <Check size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: 'var(--space-12)', padding: 'var(--space-6)', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                            <div style={{ color: 'var(--color-primary)' }}>
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#1E293B', margin: 0 }}>Verified Experts Only</p>
                                                <p style={{ fontSize: 'var(--text-xs)', color: '#64748B', margin: 0 }}>All consultants undergo a rigorous background check and verify their credentials before joining Apex Horizons.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Expert Choice */}
                                {step === 2 && (
                                    <div className="animate-fade-in">
                                        <div style={{ marginBottom: 'var(--space-8)' }}>
                                            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>Choose Your Expert</h1>
                                            <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 500 }}>Select a professional mentor for your session.</p>
                                        </div>

                                        {/* Filter Bar - Pill Style */}
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-10)', flexWrap: 'wrap' }}>
                                            {filters.map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setActiveFilter(f)}
                                                    className={`btn`}
                                                    style={{
                                                        borderRadius: 'var(--radius-full)',
                                                        padding: '12px 28px',
                                                        fontSize: '14px',
                                                        fontWeight: 800,
                                                        background: activeFilter === f ? '#0D9488' : 'white',
                                                        color: activeFilter === f ? 'white' : '#64748B',
                                                        border: '1px solid #F1F5F9',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', minHeight: '300px' }}>
                                            {filteredConsultants.length > 0 ? (
                                                filteredConsultants.map(c => (
                                                    <div
                                                        key={c.id}
                                                        className={`card ${selectedConsultant?.id === c.id ? 'active' : ''}`}
                                                        onClick={() => setSelectedConsultant(c)}
                                                        style={{
                                                            padding: 'var(--space-6)',
                                                            cursor: 'pointer',
                                                            border: selectedConsultant?.id === c.id ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                                                            position: 'relative',
                                                            transition: 'all 0.2s ease',
                                                            background: 'white',
                                                            borderRadius: '16px',
                                                            boxShadow: selectedConsultant?.id === c.id ? '0 10px 20px rgba(45, 212, 191, 0.1)' : 'var(--shadow-sm)'
                                                        }}
                                                    >
                                                        {selectedConsultant?.id === c.id && (
                                                            <div style={{
                                                                position: 'absolute', top: '-10px', right: '-10px',
                                                                background: 'var(--color-primary)', color: 'white',
                                                                borderRadius: '50%', padding: '4px', border: '2px solid white',
                                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <Check size={16} />
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                                                <img
                                                                    src={c.profileImage || `https://i.pravatar.cc/150?u=${c.User?.name || 'anon'}`}
                                                                    alt={c.User?.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>{c.User?.name}</h3>
                                                                    {c.averageRating >= 4.9 && (
                                                                        <span style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>FEATURED</span>
                                                                    )}
                                                                </div>
                                                                <p style={{ margin: 0, fontSize: '13px', color: '#0D9488', fontWeight: 700 }}>{c.title || 'Senior Academic Expert'}</p>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            size={14}
                                                                            fill={i < Math.floor(c.averageRating || 5) ? "#F59E0B" : "none"}
                                                                            stroke={i < Math.floor(c.averageRating || 5) ? "#F59E0B" : "#E2E8F0"}
                                                                            strokeWidth={i < Math.floor(c.averageRating || 5) ? 0 : 2}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{c.averageRating || '5.0'}</span>
                                                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>({c.reviewCount || 0})</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '11px', fontWeight: 800 }}>
                                                                <Clock size={12} />
                                                                <span>AVAILABLE TODAY</span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-6)' }}>
                                                            {(Array.isArray(c.expertise) ? c.expertise : []).map(tag => (
                                                                <span key={tag} style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: 800,
                                                                    background: '#F8FAFC',
                                                                    color: '#64748B',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #E2E8F0'
                                                                }}>{tag}</span>
                                                            ))}
                                                        </div>

                                                        <button
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                borderRadius: '12px',
                                                                border: '2px solid #2DD4BF',
                                                                background: 'white',
                                                                color: '#0D9488',
                                                                fontSize: '13px',
                                                                fontWeight: 800,
                                                                transition: 'all 0.2s',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={(e) => { e.stopPropagation(); setViewingBio(c); }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDFA'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                                                        >
                                                            View Bio & Profile
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{
                                                    gridColumn: '1 / -1',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 'var(--space-20) var(--space-4)',
                                                    textAlign: 'center',
                                                    background: '#F8FAFC',
                                                    borderRadius: '24px',
                                                    border: '2px dashed #E2E8F0'
                                                }}>
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
                                                        <Users size={40} color="#94A3B8" />
                                                    </div>
                                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', marginBottom: 'var(--space-2)' }}>No Slots Available?</h2>
                                                    <p style={{
                                                        fontSize: '16px',
                                                        color: '#64748B',
                                                        maxWidth: '450px',
                                                        lineHeight: 1.6,
                                                        fontWeight: 500,
                                                        marginBottom: 'var(--space-8)'
                                                    }}>
                                                        All slots for this expert are currently booked. Would you like to view our next available expert or join the waitlist?
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button onClick={() => setActiveFilter('All')} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '10px' }}>View Other Experts</button>
                                                        <button className="btn btn-outline" style={{ padding: '10px 24px', borderRadius: '10px' }}>Join Waitlist</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bio Modal */}
                                {viewingBio && (
                                    <div className="overlay" style={{ display: 'flex' }} onClick={() => setViewingBio(null)}>
                                        <div className="modal-bio-content" onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                                <h2 style={{ margin: 0 }}>Consultant Profile</h2>
                                                <button onClick={() => setViewingBio(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)' }}>
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                                                <div className="headshot-container" style={{ width: '120px', height: '120px' }}>
                                                    <img src={viewingBio.profileImage || `https://i.pravatar.cc/150?u=${viewingBio.id}`} alt="" />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px', color: '#1E293B' }}>{viewingBio.User?.name}</h3>
                                                    <p style={{ color: '#0D9488', fontWeight: 800, margin: '0 0 12px 0', fontSize: '15px' }}>{viewingBio.title || "Senior Education Consultant"}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    size={14}
                                                                    fill={star <= (viewingBio.averageRating || 5) ? "#F59E0B" : "none"}
                                                                    stroke={star <= (viewingBio.averageRating || 5) ? "#F59E0B" : "#E2E8F0"}
                                                                    strokeWidth={star <= (viewingBio.averageRating || 5) ? 0 : 2}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{viewingBio.averageRating || '5.0'}</span>
                                                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>({viewingBio.reviewCount || 0} reviews)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 style={{ marginBottom: 'var(--space-2)' }}>About</h4>
                                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
                                                {viewingBio.bio || "An experienced admissions expert dedicated to helping students achieve their global academic goals."}
                                            </p>

                                            <h4 style={{ marginBottom: 'var(--space-4)' }}>Success Stories</h4>
                                            <div className="success-story-card">
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm)' }}>Top-Tier University Admission</p>
                                                <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                                    Successfully guided 50+ students into Ivy League and Russell Group universities with high funding.
                                                </p>
                                            </div>

                                            <div style={{ marginTop: 'var(--space-8)' }}>
                                                <button onClick={() => { setSelectedConsultant(viewingBio); setViewingBio(null); }} className="btn btn-primary" style={{ width: '100%' }}>
                                                    Select This Expert
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Scheduling */}
                                {step === 3 && (
                                    <div className="animate-fade-in">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-10)' }}>
                                            <div>
                                                <h4 style={{ marginBottom: 'var(--space-4)', fontSize: '14px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Calendar size={18} color="var(--color-primary)" /> SELECT DATE
                                                </h4>
                                                <div className="visual-calendar" style={{
                                                    background: '#F8FAFC',
                                                    borderRadius: '20px',
                                                    padding: 'var(--space-6)',
                                                    border: '1px solid #E2E8F0'
                                                }}>
                                                    <CustomCalendar
                                                        selectedDate={bookingData.date}
                                                        onChange={(date) => setBookingData({ ...bookingData, date })}
                                                        availability={selectedConsultant?.availability}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 style={{ marginBottom: 'var(--space-4)', fontSize: '14px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Clock size={18} color="var(--color-primary)" /> SELECT TIME
                                                </h4>
                                                <div style={{
                                                    background: '#F8FAFC',
                                                    borderRadius: '20px',
                                                    padding: 'var(--space-6)',
                                                    border: '1px solid #E2E8F0',
                                                    minHeight: '200px'
                                                }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)' }}>
                                                        {(() => {
                                                            if (!bookingData.date) return <p style={{ color: '#94A3B8', textAlign: 'center', marginTop: '40px' }}>Please select a date first</p>;

                                                            const dayName = new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long' });
                                                            const expertAvail = selectedConsultant?.availability?.[dayName];

                                                            if (!expertAvail || !Array.isArray(expertAvail)) {
                                                                return (
                                                                    <div style={{
                                                                        textAlign: 'center',
                                                                        marginTop: '20px',
                                                                        padding: '24px',
                                                                        background: 'white',
                                                                        borderRadius: '24px',
                                                                        border: '1px solid #E2E8F0',
                                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                                                    }}>
                                                                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                                                            <Users size={28} color="#0D9488" />
                                                                        </div>
                                                                        <h4 style={{ color: '#1E293B', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Expert Fully Booked</h4>
                                                                        <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                                                                            All slots for this expert are currently booked. Would you like to view our next available expert or join the waitlist?
                                                                        </p>
                                                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                                            <button onClick={() => setStep(2)} className="btn" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 800, cursor: 'pointer', color: '#1E293B' }}>View Other Experts</button>
                                                                            <button className="btn" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px', background: '#0D9488', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Join Waitlist</button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            const [start, end] = expertAvail;
                                                            const slots = [];
                                                            let current = parseInt(start.split(':')[0]);
                                                            const endH = parseInt(end.split(':')[0]);

                                                            for (let h = current; h < endH; h += 1) {
                                                                const timeStr = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                                                                slots.push(timeStr);
                                                            }

                                                            return slots.map(time => (
                                                                <button
                                                                    key={time}
                                                                    className={`btn ${bookingData.time === time ? 'btn-primary' : 'btn-ghost'}`}
                                                                    style={{
                                                                        justifyContent: 'center',
                                                                        padding: '14px',
                                                                        borderRadius: '12px',
                                                                        background: bookingData.time === time ? '#0D9488' : 'white',
                                                                        color: bookingData.time === time ? 'white' : '#64748B',
                                                                        border: '1px solid #E2E8F0',
                                                                        fontWeight: 700,
                                                                        boxShadow: bookingData.time === time ? '0 4px 12px rgba(13, 148, 136, 0.2)' : 'none'
                                                                    }}
                                                                    onClick={() => setBookingData({ ...bookingData, time: time })}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Details */}
                                {step === 4 && (
                                    <div className="animate-fade-in">
                                        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>Consultation Details</h2>
                                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Tell us more about what you need.</p>

                                        <div style={{ maxWidth: '600px' }}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.625rem', fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>
                                                    Topic <span style={{ color: '#E11D48' }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    style={{
                                                        width: '100%',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '15px',
                                                        color: '#1E293B',
                                                        transition: 'all 0.2s',
                                                        outline: 'none'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#0D9488';
                                                        e.target.style.boxShadow = '0 0 0 4px rgba(45, 212, 191, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#E2E8F0';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    placeholder="e.g., Financial Planning Review"
                                                    value={bookingData.topic}
                                                    onChange={e => setBookingData({ ...bookingData, topic: e.target.value })}
                                                />
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.625rem', fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>Message</label>
                                                <textarea
                                                    style={{
                                                        width: '100%',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '15px',
                                                        color: '#1E293B',
                                                        transition: 'all 0.2s',
                                                        outline: 'none',
                                                        minHeight: '120px',
                                                        resize: 'vertical'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#0D9488';
                                                        e.target.style.boxShadow = '0 0 0 4px rgba(45, 212, 191, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#E2E8F0';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    placeholder="Enter your questions or context here..."
                                                    value={bookingData.message}
                                                    onChange={e => setBookingData({ ...bookingData, message: e.target.value })}
                                                />
                                            </div>

                                            <div style={{ marginBottom: '2rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.625rem', fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>
                                                    Upload Documents (Optional)
                                                </label>
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);
                                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                            handleFileSelect({ target: { files: e.dataTransfer.files } });
                                                        }
                                                    }}
                                                    style={{
                                                        border: `2px dashed ${isDragging ? '#0D9488' : '#CBD5E1'}`,
                                                        borderRadius: '16px',
                                                        padding: '2.5rem 2rem',
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        background: isDragging ? '#F0FDFA' : '#F8FAFC',
                                                        position: 'relative',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.png"
                                                        onChange={handleFileSelect}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    />

                                                    {!uploading && !uploadSuccess && (
                                                        <>
                                                            <div style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                borderRadius: '12px',
                                                                background: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginBottom: '4px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                color: '#64748B'
                                                            }}>
                                                                <Upload size={24} />
                                                            </div>
                                                            <p style={{ color: '#1E293B', fontWeight: 700, fontSize: '14px', margin: '4px 0 0' }}>Drag & drop or Click to upload</p>
                                                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>PDF, JPG, PNG (Max 5MB)</p>
                                                        </>
                                                    )}

                                                    {uploading && (
                                                        <div style={{ width: '100%', padding: '20px' }}>
                                                            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748B' }}>Uploading...</p>
                                                            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0D9488', transition: 'width 0.3s' }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {uploadSuccess && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                                                <CheckCircle size={24} color="#0D9488" />
                                                            </div>
                                                            <p style={{ color: '#0D9488', fontWeight: 700, fontSize: '14px', margin: 0 }}>File Attached!</p>
                                                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{bookingData.documentName}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Review */}
                                {step === 5 && (
                                    <div className="animate-fade-in">
                                        <div style={{ marginBottom: 'var(--space-8)' }}>
                                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: '#1E293B', marginBottom: 'var(--space-1)' }}>Review Your Booking</h2>
                                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-md)' }}>Verify your session details before confirming.</p>
                                        </div>



                                        <div style={{
                                            background: 'white',
                                            borderRadius: '24px',
                                            padding: '40px',
                                            border: '1px solid #E2E8F0',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                                            maxWidth: '600px',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Receipt Header Pattern */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0D9488, #2DD4BF)' }} />

                                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Booking Summary</h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                        <img
                                                            src={selectedConsultant?.profileImage || `https://i.pravatar.cc/150?u=${selectedConsultant?.User.name}`}
                                                            alt={selectedConsultant?.User.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Expert</p>
                                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E293B' }}>{selectedConsultant?.User.name}</p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Service</p>
                                                        <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>{selectedCategory?.title}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</p>
                                                        <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>{bookingData.date} at {bookingData.time}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Topic of Discussion</p>
                                                    <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1E293B', fontSize: '15px', lineHeight: 1.4 }}>{bookingData.topic}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Success State */}
                                {step === 6 && (
                                    <div className="animate-fade-in">
                                        {/* Success Hero */}
                                        <div className="success-hero">
                                            <div className="checkmark-circle">
                                                <CheckCircle size={56} strokeWidth={2.5} />
                                            </div>
                                            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)', color: 'var(--color-secondary)' }}>
                                                Your Journey to {selectedCategory?.title.includes('Scholarship') ? 'Global Education' : selectedCategory?.title.includes('Visa') ? 'Your Dream Country' : 'Career Success'} Starts Now!
                                            </h1>
                                            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)' }}>
                                                We've sent a confirmation and meeting link to your email.
                                            </p>
                                        </div>

                                        {/* Appointment Summary Card */}
                                        <div className="appointment-card">
                                            <div className="appointment-header">
                                                <div className="headshot-container" style={{ width: '60px', height: '60px' }}>
                                                    <img src={`https://i.pravatar.cc/150?u=${selectedConsultant?.User.name}`} alt="" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{selectedConsultant?.User.name}</h3>
                                                    <p style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                                                        {selectedCategory?.title} Specialist
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="appointment-details">
                                                <div className="detail-row">
                                                    <Calendar size={18} />
                                                    <span>Date</span>
                                                    <strong>{new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                                                </div>
                                                <div className="detail-row">
                                                    <Clock size={18} />
                                                    <span>Time</span>
                                                    <strong>{bookingData.time} (GMT+7)</strong>
                                                </div>
                                                <div className="detail-row">
                                                    <Globe size={18} />
                                                    <span>Platform</span>
                                                    <strong>Zoom Meeting</strong>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: 'var(--space-6)' }}>
                                                <CalendarDropdown
                                                    consultant={selectedConsultant}
                                                    date={bookingData.date}
                                                    time={bookingData.time}
                                                    category={selectedCategory}
                                                />
                                            </div>
                                        </div>

                                        {/* Preparation Checklist */}
                                        <div className="prep-checklist">
                                            <h3 style={{ margin: '0 0 var(--space-6)', fontSize: 'var(--text-xl)', color: 'var(--color-secondary)' }}>
                                                Prepare for Success
                                            </h3>

                                            <div className="checklist-item">
                                                <div className="checklist-number">1</div>
                                                <div className="checklist-content">
                                                    <h4>Check Your Email</h4>
                                                    <p>We've sent you a pre-session questionnaire to help your consultant prepare. Please complete it before your meeting.</p>
                                                </div>
                                            </div>

                                            <div className="checklist-item">
                                                <div className="checklist-number">2</div>
                                                <div className="checklist-content">
                                                    <h4>Upload Documents to Your Vault</h4>
                                                    <p>Add any missing transcripts, certificates, or supporting documents so your expert can review them beforehand.</p>
                                                </div>
                                            </div>

                                            <div className="checklist-item">
                                                <div className="checklist-number">3</div>
                                                <div className="checklist-content">
                                                    <h4>Prepare Your Questions</h4>
                                                    <p>Note down your top 3 questions or concerns to make the most of your consultation time.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Document Vault Prompt */}
                                        <div className="vault-prompt" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/verification'}>
                                            <div className="vault-icon">
                                                <FileText size={24} />
                                            </div>
                                            <div className="vault-content" style={{ flex: 1 }}>
                                                <h4>Speed Up Your Consultation</h4>
                                                <p>Upload your transcripts to your Document Vault now so your expert can review them before you meet.</p>
                                                <a href="/verification" className="vault-link" onClick={(e) => e.stopPropagation()}>
                                                    Go to Document Vault <ChevronRight size={16} />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Primary Action */}
                                        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                                            <button
                                                onClick={() => window.location.href = '/'}
                                                className="btn btn-primary"
                                                style={{
                                                    padding: '16px 40px',
                                                    fontSize: '16px',
                                                    borderRadius: '14px',
                                                    fontWeight: 800,
                                                    background: '#0D9488',
                                                    color: 'white',
                                                    border: 'none',
                                                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
                                                }}
                                            >
                                                Go to My Dashboard
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Actions */}
                                {step < 5 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        marginTop: 'var(--space-12)',
                                        paddingTop: 'var(--space-8)',
                                        borderTop: '1px solid #F1F5F9'
                                    }}>
                                        {step > 1 && (
                                            <button
                                                onClick={handleBack}
                                                className="btn"
                                                style={{
                                                    padding: '14px 36px',
                                                    borderRadius: '12px',
                                                    fontWeight: 800,
                                                    fontSize: '14px',
                                                    color: '#1E293B',
                                                    background: 'white',
                                                    border: '1px solid #E2E8F0',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Back
                                            </button>
                                        )}

                                        <button
                                            onClick={handleNext}
                                            className="btn"
                                            style={{
                                                padding: '14px 36px',
                                                borderRadius: '12px',
                                                background: (isProcessing ||
                                                    (step === 1 && !selectedCategory) ||
                                                    (step === 2 && !selectedConsultant) ||
                                                    (step === 3 && (!bookingData.date || !bookingData.time)) ||
                                                    (step === 4 && !bookingData.topic)) ? '#E2E8F0' : '#0D9488',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: 800,
                                                fontSize: '14px',
                                                cursor: (isProcessing ||
                                                    (step === 1 && !selectedCategory) ||
                                                    (step === 2 && !selectedConsultant) ||
                                                    (step === 3 && (!bookingData.date || !bookingData.time)) ||
                                                    (step === 4 && !bookingData.topic)) ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: (isProcessing ||
                                                    (step === 1 && !selectedCategory) ||
                                                    (step === 2 && !selectedConsultant) ||
                                                    (step === 3 && (!bookingData.date || !bookingData.time)) ||
                                                    (step === 4 && !bookingData.topic)) ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.2)'
                                            }}
                                            disabled={
                                                isProcessing ||
                                                (step === 1 && !selectedCategory) ||
                                                (step === 2 && !selectedConsultant) ||
                                                (step === 3 && (!bookingData.date || !bookingData.time)) ||
                                                (step === 4 && !bookingData.topic)
                                            }
                                        >
                                            {isProcessing ? 'Processing...' : 'Next Step'}
                                        </button>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        marginTop: 'var(--space-12)',
                                        paddingTop: 'var(--space-8)',
                                        borderTop: '1px solid #F1F5F9'
                                    }}>
                                        <button
                                            onClick={handleBack}
                                            className="btn"
                                            style={{
                                                padding: '12px 32px',
                                                borderRadius: '8px',
                                                fontWeight: 800,
                                                fontSize: '14px',
                                                color: '#1E293B',
                                                background: 'white',
                                                border: '1px solid #E2E8F0',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleFinalConfirm}
                                            className="btn"
                                            style={{
                                                padding: '12px 32px',
                                                borderRadius: '8px',
                                                background: isProcessing ? '#E2E8F0' : '#0D9488',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: 800,
                                                fontSize: '14px',
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? 'Confirming...' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout >
    );
}

function StepNodeV({ step, current, title, subtitle, isLast }) {
    const isCompleted = current > step;
    const isActive = current === step;

    return (
        <div style={{
            display: 'flex',
            gap: 'var(--space-5)',
            alignItems: 'flex-start',
            opacity: isActive || isCompleted ? 1 : 0.5,
            transition: 'all 0.3s ease',
            position: 'relative',
            paddingBottom: isLast ? 0 : 'var(--space-2)'
        }}>
            {/* Vertical Line */}
            {!isLast && (
                <div style={{
                    position: 'absolute',
                    top: '32px',
                    left: '16px',
                    width: '2px',
                    height: 'calc(100% + var(--space-2))',
                    background: '#E2E8F0',
                    zIndex: 1
                }}>
                    <div style={{
                        width: '100%',
                        height: isCompleted ? '100%' : (isActive ? '50%' : '0%'),
                        background: 'linear-gradient(to bottom, #2DD4BF, #0D9488)',
                        transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isCompleted ? '0 0 8px rgba(45, 212, 191, 0.4)' : 'none'
                    }} />
                </div>
            )}

            {/* Step Counter Circle */}
            <div style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '50%',
                background: isCompleted ? 'var(--color-primary)' : 'white',
                color: isCompleted ? 'white' : (isActive ? 'var(--color-primary)' : '#94A3B8'),
                border: isCompleted ? 'none' : `2px solid ${isActive ? 'var(--color-primary)' : '#E2E8F0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                zIndex: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 0 0 4px rgba(45, 212, 191, 0.15), 0 0 20px rgba(45, 212, 191, 0.4)' : 'none',
                animation: isActive ? 'pulse-border 2s infinite' : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)'
            }}>
                {isCompleted ? (
                    <div className="animate-pop-in" style={{ display: 'flex' }}>
                        <Check size={18} strokeWidth={3} />
                    </div>
                ) : step}
            </div>

            <style>{`
                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(45, 212, 191, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0); }
                }
                .animate-pop-in {
                    animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes pop-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            {/* Step Label Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isActive ? '#1E293B' : (isCompleted ? '#1E293B' : '#94A3B8'),
                    lineHeight: 1.2
                }}>{title}</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{subtitle}</span>
            </div>
        </div>
    );
}

function CalendarDropdown({ consultant, date, time, category }) {
    const [isOpen, setIsOpen] = useState(false);

    const generateCalendarLink = (type) => {
        const startDate = new Date(`${date} ${time}`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

        const title = `Consultation with ${consultant?.User.name}`;
        const description = `${category?.title} consultation session with ${consultant?.User.name}. Meeting link will be sent via email.`;
        const location = 'Zoom Meeting (link in email)';

        if (type === 'google') {
            const formatDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        } else if (type === 'outlook') {
            const formatDate = (d) => d.toISOString();
            return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        } else if (type === 'ics') {
            // Generate ICS file content
            const formatDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Horizons//Consultation//EN
BEGIN:VEVENT
UID:${Date.now()}@apexhorizons.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'consultation.ics';
            link.click();
            URL.revokeObjectURL(url);
            return null;
        }
    };

    const handleCalendarClick = (type) => {
        const link = generateCalendarLink(type);
        if (link) {
            window.open(link, '_blank');
        }
        setIsOpen(false);
    };

    return (
        <div className="calendar-dropdown">
            <button
                className="calendar-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar size={20} />
                Add to Calendar
                <ChevronRight size={16} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            <div className={`calendar-menu ${isOpen ? 'open' : ''}`}>
                <button className="calendar-option" onClick={() => handleCalendarClick('google')}>
                    <Globe size={16} />
                    Google Calendar
                </button>
                <button className="calendar-option" onClick={() => handleCalendarClick('outlook')}>
                    <Globe size={16} />
                    Outlook Calendar
                </button>
                <button className="calendar-option" onClick={() => handleCalendarClick('ics')}>
                    <Calendar size={16} />
                    Apple Calendar (.ics)
                </button>
            </div>
        </div>
    );
}

function CustomCalendar({ selectedDate, onChange, availability }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const checkAvailability = (date) => {
        if (!availability) return true;
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        // Correcting availability check to handle both array and object formats if they exist
        const dayAvail = availability[dayName];
        return dayAvail && (Array.isArray(dayAvail) || (typeof dayAvail === 'object' && Object.keys(dayAvail).length > 0));
    };

    const days = [];
    const firstDay = firstDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);

    // Padding for first day
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`pad-${i}`} style={{ height: '40px' }}></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dateObj = new Date(year, month, d);
        const isAvailable = checkAvailability(dateObj) && dateObj >= today;
        const dateStr = dateObj.toISOString().split('T')[0];
        const isSelected = selectedDate === dateStr;

        days.push(
            <div
                key={d}
                onClick={() => isAvailable && onChange(dateStr)}
                style={{
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    background: isSelected ? '#0D9488' : 'transparent',
                    color: isSelected ? 'white' : (isAvailable ? '#1E293B' : '#CBD5E1'),
                    border: isSelected ? 'none' : (isAvailable ? '1px solid transparent' : 'none'),
                    position: 'relative'
                }}
                onMouseEnter={(e) => {
                    if (isAvailable && !isSelected) {
                        e.currentTarget.style.background = '#F0FDFA';
                        e.currentTarget.style.borderColor = '#2DD4BF';
                        e.currentTarget.style.color = '#0D9488';
                    }
                }}
                onMouseLeave={(e) => {
                    if (isAvailable && !isSelected) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = '#1E293B';
                    }
                }}
            >
                {d}
                {isAvailable && !isSelected && (
                    <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#2DD4BF'
                    }} />
                )}
            </div>
        );
    }

    return (
        <div style={{ userSelect: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {monthNames[month]} {year}
                </h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={prevMonth} className="btn-ghost" style={{ padding: '6px', minWidth: '32px' }}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /></button>
                    <button onClick={nextMonth} className="btn-ghost" style={{ padding: '6px', minWidth: '32px' }}><ChevronRight size={18} /></button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>{d}</div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {days}
            </div>
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2DD4BF' }} />
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1' }} />
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Not Available</span>
                </div>
            </div>
        </div>
    );
}
