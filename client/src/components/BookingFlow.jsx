import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Calendar, User as UserIcon, Clock, ChevronLeft, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

export default function BookingFlow({ service, onBack }) {
    const [step, setStep] = useState(1);
    const [consultants, setConsultants] = useState([]);
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        topic: '',
        message: '',
        documentName: null
    });

    // File Upload Simulation
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        // Mock fetch or real fetch
        fetch(getApiUrl('/api/consultants'))
            .then(res => res.json())
            .then(data => setConsultants(data))
            .catch(err => {
                // Fallback mock data if API fails or doesn't exist yet
                setConsultants([
                    { id: 1, User: { name: 'Dr. Aris Setiawan' }, bio: 'Specialist in scholarship applications.', profileImage: null },
                    { id: 2, User: { name: 'Elena Rodriguez' }, bio: 'Visa & Immigration expert.', profileImage: null }
                ]);
            });
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    setUploadSuccess(true);
                    setFormData(prevData => ({ ...prevData, documentName: file.name }));
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to book an appointment');
            return;
        }

        // ... submission logic remains same ...
        alert('Booking Successful! (Simulation)');
        onBack();
    };

    const totalSteps = 5;
    const progressPercentage = (step / totalSteps) * 100;

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto', minHeight: '600px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <button onClick={onBack} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                    <ChevronLeft size={18} /> Back
                </button>
                <span className="badge badge-purple">Step {step} of {totalSteps}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: 'var(--space-8)' }}>
                <div style={{
                    height: '100%',
                    width: `${progressPercentage}%`,
                    background: 'var(--color-primary)',
                    boxShadow: 'none',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Booking: <span style={{ color: 'var(--color-primary)' }}>{service.title}</span></h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>Complete the steps below to secure your session.</p>

            {step === 1 && (
                <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Select a Consultant</h3>
                    <div className="grid-auto-fit">
                        {consultants.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedConsultant(c)}
                                className={`glass-panel ${selectedConsultant?.id === c.id ? '' : ''}`}
                                style={{
                                    padding: 'var(--space-4)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: selectedConsultant?.id === c.id ? 'var(--color-primary-dim)' : 'var(--color-surface)',
                                    transition: 'var(--transition-fast)',
                                    border: selectedConsultant?.id === c.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <UserIcon size={24} color="var(--color-text-muted)" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: 'var(--color-text-header)' }}>{c.User.name}</p>
                                        <p style={{ fontSize: 'var(--text-ms)', color: 'var(--color-text-dim)' }}>{c.bio ? c.bio.substring(0, 50) + '...' : 'Available for booking'}</p>
                                    </div>
                                </div>
                                {selectedConsultant?.id === c.id && <CheckCircle size={24} color="var(--color-primary)" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Terms & Prerequisites</h3>
                    <div className="glass-panel" style={{ background: 'var(--color-bg-base)' }}>
                        {service.prerequisites && service.prerequisites.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {service.prerequisites.map((p, i) => (
                                    <li key={i} style={{
                                        marginBottom: 'var(--space-2)',
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <CheckCircle size={16} color="var(--color-secondary)" />
                                        <span style={{ flex: 1, color: 'var(--color-text-body)' }}>{p}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--color-text-dim)' }}>No specific prerequisites.</p>
                        )}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Select Date & Time</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-8)' }}>
                        <div>
                            <label className="text-header" style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Date</label>
                            <input
                                type="date"
                                className="input-field"
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-base)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-body)',
                                    marginBottom: 'var(--space-6)'
                                }}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-header" style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Time Slot</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                {['10:00', '13:00', '15:30', '17:00'].map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setFormData({ ...formData, time: slot })}
                                        style={{
                                            padding: 'var(--space-3)',
                                            borderRadius: 'var(--radius-md)',
                                            border: formData.time === slot ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            background: formData.time === slot ? 'var(--color-primary-dim)' : 'transparent',
                                            color: formData.time === slot ? 'var(--color-primary)' : 'var(--color-text-dim)',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-fast)',
                                            boxShadow: 'none'
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Session Details</h3>

                    <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                        <label>Consultation Topic <span style={{ color: 'var(--color-accent-red)' }}>*</span></label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Scholarship Essay Review"
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                        <label>Message / Context</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="What do you want to achieve from this session?"
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Documents (Optional)</label>
                        <div
                            className="dropzone"
                            style={{
                                background: uploading ? 'rgba(45, 212, 191, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: uploading ? '1px dashed var(--color-primary)' : '1px dashed var(--color-border)',
                                cursor: 'pointer',
                                padding: 'var(--space-8)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                position: 'relative'
                            }}
                        >
                            <input
                                type="file"
                                accept=".pdf,.jpg,.png"
                                onChange={handleFileSelect}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            />

                            {!uploading && !uploadSuccess && (
                                <>
                                    <Upload size={32} style={{ color: 'var(--color-text-dim)', marginBottom: 'var(--space-2)' }} />
                                    <p style={{ color: 'var(--color-text-body)' }}>Click to upload file</p>
                                </>
                            )}

                            {uploading && (
                                <div style={{ width: '100%', maxWidth: '200px', margin: '0 auto' }}>
                                    <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Uploading...</p>
                                    <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px' }}>
                                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s' }}></div>
                                    </div>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div style={{ color: 'var(--color-primary)' }}>
                                    <CheckCircle size={32} style={{ marginBottom: 'var(--space-2)' }} />
                                    <p style={{ fontWeight: 700 }}>{formData.documentName}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Confirm Booking</h3>
                    <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.3)', marginBottom: 'var(--space-8)' }}>
                        <SummaryRow icon={<UserIcon size={18} />} label="Consultant" value={selectedConsultant?.User?.name} />
                        <SummaryRow icon={<Calendar size={18} />} label="Date & Time" value={`${formData.date} at ${formData.time}`} />
                        <SummaryRow icon={<FileText size={18} />} label="Topic" value={formData.topic} />
                        {formData.documentName && <SummaryRow icon={<CheckCircle size={18} />} label="Attachment" value={formData.documentName} />}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
                {step > 1 && (
                    <button className="btn btn-outline" onClick={() => setStep(step - 1)} style={{ flex: 1 }}>
                        Back
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    onClick={() => step < 5 ? setStep(step + 1) : handleSubmit({ preventDefault: () => { } })}
                    disabled={step === 1 && !selectedConsultant}
                    style={{ flex: 1 }}
                >
                    {step === 5 ? 'Confirm Booking' : 'Next Step'} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

function SummaryRow({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
            <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>{label}</p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-header)' }}>{value}</p>
            </div>
        </div>
    );
}
