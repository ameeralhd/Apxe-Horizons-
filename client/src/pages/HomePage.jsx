import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import LandingLayout from '../components/LandingLayout';
import { Link } from 'react-router-dom';
import {
    ShieldCheck, Calendar, Package, ChevronRight, Upload, X, File,
    Trash2, Play, Users, Globe, Headset, FileCheck, GraduationCap,
    Star, MessageSquare, ChevronDown, Home, CreditCard, BookOpen, Heart, Bell, Clock, Check, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ProfileProgress from '../components/Dashboard/ProfileProgress';
import { getApiUrl } from '../utils/apiConfig';

export default function HomePage() {
    const token = localStorage.getItem('token');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        user = {};
    }

    // --- STATE ---
    const [dashboardStatus, setDashboardStatus] = useState({ consultations: 0, verificationPercent: 0, academicStatus: 'In Progress' });
    const [newsTicker, setNewsTicker] = useState(null);
    const [unis, setUnis] = useState([]);
    const [eliteUnis, setEliteUnis] = useState([]);
    const [videos, setVideos] = useState([]);
    const [discoveryVideos, setDiscoveryVideos] = useState([]);
    const [successVideos, setSuccessVideos] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('Indonesia');
    const [loadingUnis, setLoadingUnis] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null); // { videoId, name, officialLink }
    const [spotlight, setSpotlight] = useState(null);

    // Use a ref to track selectedCountry for the polling interval to avoid stale closures
    const countryRef = useRef(selectedCountry);
    const [recentActivity, setRecentActivity] = useState([
        { id: 1, type: 'search', message: 'You searched for universities in Turkey', time: '10m ago' },
        { id: 2, type: 'view', message: 'Viewed Tsinghua University profile', time: '2h ago' },
        { id: 3, type: 'document', message: 'IELTS Certificate verification started', time: '5h ago' }
    ]);

    const addActivity = (type, message) => {
        const newAct = { id: Date.now(), type, message, time: 'Just now' };
        setRecentActivity(prev => [newAct, ...prev.slice(0, 4)]);
    };

    useEffect(() => {
        countryRef.current = selectedCountry;
    }, [selectedCountry]);

    // --- ANIMATIONS ---
    const [isVisible, setIsVisible] = useState(false);
    const statsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, []);

    // Fetch Dashboard Data
    useEffect(() => {
        if (!token) {
            setIsProcessing(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Status (Dynamic Analytics & Alerts)
                const statusRes = await fetch(getApiUrl('/api/dashboard/status'), { headers });
                if (statusRes.status === 401) {
                    localStorage.clear();
                    window.location.href = '/login?expired=true';
                    return;
                }
                if (statusRes.ok) setDashboardStatus(await statusRes.json());

                // Fetch News Ticker
                const newsRes = await fetch(getApiUrl('/api/dashboard/news/ticker'));
                if (newsRes.ok) setNewsTicker(await newsRes.json());

                // Fetch Elite Unis
                const eliteRes = await fetch(getApiUrl('/api/universities?category=Elite Partner'));
                if (eliteRes.ok) setEliteUnis(await eliteRes.json());

                // Fetch Dynamic CMS Content
                const cmsRes = await fetch(getApiUrl('/api/dynamic-content?status=true'));
                if (cmsRes.ok) {
                    const cmsData = await cmsRes.json();
                    setDiscoveryVideos(cmsData.filter(item => item.category === 'university_discovery'));
                    setSuccessVideos(cmsData.filter(item => item.category === 'success_story'));
                }

                // Keep old videoRes for backward compatibility or if needed, but we'll prioritize CMS
                const videoRes = await fetch(getApiUrl('/api/videos'));
                if (videoRes.ok) setVideos(await videoRes.json());

                // Fetch Spotlight
                const spotlightRes = await fetch(getApiUrl('/api/universities/spotlight'));
                if (spotlightRes.ok) {
                    const spotlightData = await spotlightRes.json();
                    setSpotlight(spotlightData);
                }

                // Initial Unis (Respect current selection instead of hardcoding Indonesia)
                const uniRes = await fetch(getApiUrl(`/api/universities?country=${countryRef.current}`));
                if (uniRes.ok) setUnis(await uniRes.json());
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setIsProcessing(false);
            }
        };

        fetchDashboardData();

        // Implement Polling for sync (30 seconds)
        const pollInterval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(pollInterval);
    }, [token]);

    const fetchUniversities = async (country) => {
        setLoadingUnis(true);
        setSelectedCountry(country);
        setUnis([]); // Required Fix: Clear previous list so the new list can mount/render cleanly
        try {
            const res = await fetch(getApiUrl(`/api/universities?country=${country}`));
            if (res.ok) setUnis(await res.json());
        } catch (err) {
            console.error('Error fetching universities:', err);
        } finally {
            setLoadingUnis(false);
        }
    };

    // --- HELPERS ---
    const getMilestone = (percent) => {
        if (percent === 0) return "Next: Complete Onboarding Checklist";
        if (percent < 50) return "Next: Upload Academic Transcripts";
        if (percent < 85) return "Next: Verify Identity Documents";
        if (percent < 100) return "Next: Schedule Expert Consultation";
        return "Profile 100% Verified. Explore Scholarships!";
    };

    useEffect(() => {
        if (!isProcessing && token && dashboardStatus.verificationPercent === 100) {
            const end = Date.now() + 3 * 1000;
            const colors = ['#2DD4BF', '#6366F1', '#ffffff'];
            (function frame() {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }
    }, [dashboardStatus.verificationPercent, isProcessing, token]);

    // --- GUEST VIEW ---
    if (!token) {
        return (
            <LandingLayout>
                {/* Hero Section */}
                <section className="hero-section" style={{
                    position: 'relative',
                    minHeight: '85vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: '#0F172A'
                }}>
                    {/* Background Overlay */}
                    <div className="hero-bg-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url("/images/hero_concept.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.5,
                        zIndex: 1
                    }}></div>

                    <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
                        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <h1 className="hero-title" style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                fontWeight: 900,
                                lineHeight: 1.1,
                                marginBottom: 'var(--space-8)',
                                color: 'white',
                                letterSpacing: '-0.02em'
                            }}>
                                Unlock Your Global Future:<br />
                                Expert Guidance for Scholarships & Careers
                            </h1>
                            <p className="hero-subtitle" style={{
                                fontSize: 'var(--text-xl)',
                                opacity: 0.9,
                                marginBottom: 'var(--space-10)',
                                maxWidth: '800px',
                                margin: '0 auto var(--space-10)'
                            }}>
                                Navigate international educational opportunities with trust, clarity, and expert support at every step.
                            </p>
                            <div className="hero-buttons-container" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-16)' }}>
                                <Link to="/register" className="btn" style={{
                                    background: '#2DD4BF',
                                    color: '#1E293B',
                                    padding: '18px 48px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 800,
                                    fontSize: 'var(--text-md)',
                                    boxShadow: '0 8px 30px rgba(45, 212, 191, 0.4)',
                                    transition: 'transform 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    Create Account
                                </Link>
                                <Link to="/login" className="btn" style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    padding: '18px 48px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 800,
                                    fontSize: 'var(--text-md)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                                    transition: 'transform 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    Login
                                </Link>
                            </div>

                            {/* Trust Bar */}
                            <div className="animate-fade-in-delayed" style={{ marginTop: 'var(--space-12)' }}>
                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: 'var(--space-6)' }}>
                                    Empowering students to reach top institutions
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-12)', filter: 'grayscale(100%) brightness(200%)', opacity: 0.4 }}>
                                    {/* Mock Logos */}
                                    <div style={{ fontWeight: 900, fontSize: '20px' }}>OXFORD</div>
                                    <div style={{ fontWeight: 900, fontSize: '20px' }}>HARVARD</div>
                                    <div style={{ fontWeight: 900, fontSize: '20px' }}>TSINGHUA</div>
                                    <div style={{ fontWeight: 900, fontSize: '20px' }}>NUS</div>
                                    <div style={{ fontWeight: 900, fontSize: '20px' }}>MIT</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container" style={{ marginTop: '48px' }}>
                    <AdmissionsGuideCTA isLoggedIn={false} />
                </div>

                {/* Country Expertise */}
                <section style={{ padding: 'var(--space-12) 0', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-10)', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Specializing In:</p>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <CountryChip label="United Kingdom" />
                                <CountryChip label="United States" />
                                <CountryChip label="Canada" />
                                <CountryChip label="Germany" />
                                <CountryChip label="China" />
                                <CountryChip label="Malaysia" />
                                <CountryChip label="Turkey" />
                                <CountryChip label="Saudi Arabia" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 2: How It Works */}
                <section style={{ padding: 'var(--space-24) 0', background: 'white' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1E293B', marginBottom: 'var(--space-4)' }}>Your Journey to Success</h2>
                            <p style={{ color: '#64748B', fontSize: 'var(--text-md)', maxWidth: '600px', margin: '0 auto' }}>A simple, proven pathway to your dream education.</p>
                        </div>

                        <div className="journey-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 'var(--space-12)',
                            position: 'relative'
                        }}>
                            <JourneyStep
                                number="01"
                                icon={<Globe size={40} />}
                                title="Explore"
                                desc="Match with thousands of global scholarships tailored to your profile."
                            />
                            <JourneyStep
                                number="02"
                                icon={<ShieldCheck size={40} />}
                                title="Verify"
                                desc="Submit your documents for professional verification and standard alignment."
                            />
                            <JourneyStep
                                number="03"
                                icon={<GraduationCap size={40} />}
                                title="Excel"
                                desc="Submit your application with expert backing and secure your spot."
                            />

                            {/* Connector Lines (Desktop only) */}
                            <style>{`
                                @media (min-width: 1024px) {
                                    .journey-connector { display: block !important; }
                                }
                                .journey-connector { display: none; }
                            `}</style>
                            <div className="journey-connector" style={{
                                position: 'absolute',
                                top: '100px',
                                left: '26%',
                                right: '55.5%',
                                height: '2px',
                                borderTop: '2px dashed #E2E8F0',
                                zIndex: 1
                            }}></div>
                            <div className="journey-connector" style={{
                                position: 'absolute',
                                top: '100px',
                                left: '59.5%',
                                right: '22%',
                                height: '2px',
                                borderTop: '2px dashed #E2E8F0',
                                zIndex: 1
                            }}></div>
                        </div>
                    </div>
                </section>

                {/* Core Services */}
                <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-bg-alt)' }}>
                    <div className="container" style={{ opacity: 0, animation: 'fadeIn 0.8s ease-out forwards' }}>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1E293B' }}>Core Services</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-10)' }}>
                            <ServiceCardDetailed
                                icon={<Calendar size={32} />}
                                title="Consultation Support"
                                desc="Expert advice for scholarship searches and career planning tailored to your profile."
                            />
                            <ServiceCardDetailed
                                icon={<ShieldCheck size={32} />}
                                title="Document Verification"
                                desc="Securely submit and verify your academic credentials for international standards."
                            />
                            <ServiceCardDetailed
                                icon={<Package size={32} />}
                                title="Application Guidance"
                                desc="Step-by-step assistance for university admissions and visa application processes."
                            />
                        </div>
                    </div>
                </section>

                {/* Step 3: Impact Ribbon */}
                <section ref={statsRef} style={{ background: '#0F172A', padding: 'var(--space-16) 0', color: 'white' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-8)', textAlign: 'center' }}>
                            <Metric value="5M" suffix="+" label="Scholarships Secured" run={isVisible} />
                            <Metric value="120" suffix="+" label="Partner Universities" run={isVisible} />
                            <Metric value="15" suffix="+" label="Countries Covered" run={isVisible} />
                            <Metric value="98" suffix="%" label="Visa Success Rate" run={isVisible} />
                        </div>
                    </div>
                </section>

                {/* Trusted by Global Learners */}
                <section style={{ padding: 'var(--space-20) 0', background: 'white', overflow: 'hidden' }}>
                    <div className="container" style={{ opacity: 0, animation: 'fadeIn 0.8s ease-out forwards' }}>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1E293B' }}>Voices of Success</h2>
                            <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Real results from students who dared to dream big.</p>
                        </div>

                        <TestimonialCarouselAdvanced />

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-12)' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                background: '#F8FAFC',
                                padding: '14px 28px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid #E2E8F0',
                                fontWeight: 800,
                                color: '#1E293B',
                                fontSize: 'var(--text-sm)'
                            }}>
                                <Users size={20} color="#2DD4BF" />
                                Trusted by 5,000+ Students Globally
                            </div>
                        </div>
                    </div>
                </section>


                {/* Expert Chat Preview */}
                <section style={{ padding: 'var(--space-24) 0', background: 'white' }}>
                    <div className="container">
                        <div style={{
                            background: 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)',
                            borderRadius: '32px',
                            padding: '60px',
                            border: '1px solid #CCFBF1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 'var(--space-12)',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ flex: '1', minWidth: '320px' }}>
                                <div style={{ background: '#2DD4BF', color: 'white', display: 'inline-flex', padding: '6px 16px', borderRadius: 'full', fontSize: '12px', fontWeight: 900, marginBottom: '24px' }}>
                                    EXPERT AGENTS ONLINE
                                </div>
                                <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1E293B', marginBottom: '24px' }}>Got a burning question about your global education?</h2>
                                <p style={{ color: '#64748B', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
                                    Skip the long forms. Talk to a certified scholarship expert right now and get a free profile evaluation in minutes.
                                </p>
                                <button className="btn" style={{
                                    background: '#1E293B',
                                    color: 'white',
                                    padding: '18px 36px',
                                    borderRadius: '16px',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <MessageSquare size={20} /> Talk to an Expert Now
                                </button>
                            </div>
                            <div style={{ flex: '1', minWidth: '320px', position: 'relative' }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    padding: '24px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                    border: '1px solid #F1F5F9'
                                }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                        <img src="https://i.pravatar.cc/100?u=expert1" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: 900 }}>Dr. Elena Vance</h4>
                                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>2m ago</span>
                                            </div>
                                            <p style={{ fontSize: '13px', background: '#F8FAFC', padding: '12px', borderRadius: '00 12px 12px 12px', marginTop: '4px' }}>
                                                "I've helped 50+ students secure 100% funding this year. What's your target country?"
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <div style={{ flex: 1, textAlign: 'right' }}>
                                            <p style={{ fontSize: '13px', background: '#2DD4BF', color: '#1E293B', padding: '12px', borderRadius: '12px 12px 0 12px', display: 'inline-block' }}>
                                                "Interested in the UK masters program!"
                                            </p>
                                        </div>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>M</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section style={{ padding: 'var(--space-24) 0', background: '#F8FAFC' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1E293B' }}>Professional FAQ</h2>
                            <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Everything you need to know about our premium consultancy services.</p>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'fixed(repeat(auto-fit, minmax(400px, 1fr)))',
                            gap: 'var(--space-6)',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }} className="faq-grid">
                            <style>{`
                                @media (min-width: 1024px) {
                                    .faq-grid { grid-template-columns: 1fr 1fr !important; }
                                }
                            `}</style>
                            <FAQItem
                                question="How do I apply for full funding?"
                                answer="Our consultation sessions provide a customized roadmap for full funding opportunities, including government grants, university-specific awards, and private scholarships."
                            />
                            <FAQItem
                                question="How long does the verification process take?"
                                answer="Standard verification typically takes 3-5 business days. Express analysis options are available for urgent applications."
                            />
                            <FAQItem
                                question="Is the meeting online or face-to-face?"
                                answer="We specialize in remote consultations via video call, allowing you to connect with Ivy League advisors regardless of your location. In-person meetings can be arranged at our hub offices in select regions."
                            />
                            <FAQItem
                                question="Which countries do you specialize in?"
                                answer="We specialize in the USA, UK, Canada, Australia, and elite academic hubs in Europe and Asia (China, Malaysia, Indonesia)."
                            />
                            <FAQItem
                                question="Are the document reviews legal equivalents?"
                                answer="We provide expert academic audits. For government-level equivalence, we guide you through the official WES or regional equivalent processes."
                            />
                            <FAQItem
                                question="Can you help with visa applications?"
                                answer="Yes, our application guidance includes specific modules for student visa preparation and mock interviews."
                            />
                            <FAQItem
                                question="Is there a subscription fee?"
                                answer="No, we operate on a per-service or package basis. You only pay for the specific guidance sessions or verification audits you need."
                            />
                            <FAQItem
                                question="Can I change my consultant later?"
                                answer="Yes, we prioritize the right fit. You can request a different specialist through your dashboard at any time."
                            />
                        </div>
                    </div>
                </section>

                {/* Last Call Section */}
                <section style={{ background: '#0F172A', padding: '100px 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: 'white', marginBottom: 'var(--space-8)' }}>
                            Your Scholarship Journey Starts Here
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: '20px', maxWidth: '700px', margin: '0 auto 48px', lineHeight: 1.6 }}>
                            Join 5,000+ students already navigating their way to top global universities. No commitments. Total transparency.
                        </p>
                        <Link to="/register" className="btn" style={{
                            background: '#2DD4BF',
                            color: '#1E293B',
                            padding: '20px 60px',
                            borderRadius: '16px',
                            fontWeight: 900,
                            fontSize: '18px',
                            boxShadow: '0 20px 40px rgba(45, 212, 191, 0.3)',
                            transition: 'all 0.3s'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            Create Free Account Now
                        </Link>
                    </div>
                </section>
            </LandingLayout >
        );
    }

    // --- AUTHENTICATED DASHBOARD ---
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <Layout>
            <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-10)', background: '#F9FAFB', minHeight: '100vh', margin: '-var(--space-8)' }}>
                {/* Hero Elite Partners Section */}
                <div style={{
                    background: 'white',
                    padding: '60px 0',
                    borderBottom: '1px solid #F1F5F9',
                    marginBottom: 'var(--space-8)',
                    textAlign: 'center'
                }}>
                    <div className="container">
                        <div style={{ marginBottom: 'var(--space-10)' }}>
                            <p style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#2DD4BF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                marginBottom: 'var(--space-3)'
                            }}>Global Network</p>
                            <h2 style={{
                                fontSize: 'var(--text-3xl)',
                                fontWeight: 900,
                                color: '#1E293B',
                                marginBottom: 'var(--space-4)'
                            }}>Our Elite University Partners</h2>
                            <p style={{
                                fontSize: 'var(--text-md)',
                                color: '#64748B',
                                maxWidth: '700px',
                                margin: '0 auto',
                                lineHeight: 1.6
                            }}>
                                Access directly to the world's most prestigious institutions across Asia, Europe, and the Middle East.
                            </p>
                        </div>
                        <ElitePartnersSlider />
                    </div>
                </div>

                <div className="container" style={{ padding: '0 var(--space-8)' }}>
                    {/* Profile Progress Tracker */}
                    <ProfileProgress progress={dashboardStatus.profileProgress} />

                    {/* Weekly Spotlight Hero */}
                    <WeeklySpotlight
                        uni={spotlight}
                        onWatchVideo={(v) => {
                            addActivity('view', `Watched Spotlight video: ${v.name}`);
                            setSelectedVideo(v);
                        }}
                    />
                    {/* Zero-State Onboarding Checklist */}
                    {dashboardStatus.verificationPercent === 0 && (
                        <OnboardingChecklist />
                    )}
                </div>

                <div className="container" style={{ padding: 'var(--space-8)' }}>
                    {/* Command Center: Action Bar */}
                    <div style={{
                        background: '#1E293B',
                        borderRadius: '20px',
                        padding: '24px 32px',
                        marginBottom: '40px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '24px',
                        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    background: '#2DD4BF',
                                    color: '#1E293B',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    letterSpacing: '0.05em'
                                }}>ACTION CENTER</div>
                                <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.8 }}>{getMilestone(dashboardStatus.verificationPercent)}</span>
                                {(dashboardStatus.verificationPercent < 100) && (
                                    <div className="pulse-alert" style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#F43F5E',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 0 rgba(244, 63, 94, 0.4)',
                                        animation: 'pulse 2s infinite'
                                    }}></div>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${dashboardStatus.verificationPercent}%`,
                                        background: 'linear-gradient(90deg, #2DD4BF, #22D3EE)',
                                        borderRadius: '4px',
                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}></div>
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: 900, color: '#2DD4BF' }}>{dashboardStatus.verificationPercent}%</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setIsUploadModalOpen(true)} style={{
                                background: 'white',
                                color: '#1E293B',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                Complete Task
                            </button>
                            <Link to="/consultation" style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                fontSize: '13px',
                                transition: 'all 0.2s'
                            }}>
                                Book Expert
                            </Link>
                        </div>

                        <style>{`
                            @keyframes pulse {
                                0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
                                70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
                                100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                            }
                        `}</style>
                    </div>

                    <AdmissionsGuideCTA isLoggedIn={true} />

                    {/* Stats Cards Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
                        <div className="card" style={{ padding: '24px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Bookings</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', margin: 0 }}>{dashboardStatus.consultations || 2}</h3>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center' }}>
                                        <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} /> 12%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                                <svg width="48" height="48" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#2DD4BF" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * (dashboardStatus.verificationPercent || 85)) / 100} strokeLinecap="round" transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                </svg>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#1E293B' }}>
                                    {dashboardStatus.verificationPercent || 85}%
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Profile Strength</p>
                                <div style={{ background: '#F0FDFA', color: '#2DD4BF', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>ELITE STATUS</div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Matches</p>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', margin: 0 }}>42</h3>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Security</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F97316', fontSize: '12px', fontWeight: 700 }}>
                                    Verified <Check size={12} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Control Panel & Recent Updates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
                        <div>
                            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: '#1E293B', marginBottom: '4px' }}>Your Academic Control Panel</h2>
                            <p style={{ color: '#64748B', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Access core services and personalized guidance.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-6)' }}>
                                <ControlCard
                                    icon={<Calendar size={28} />}
                                    title="Consultation Services"
                                    desc="Book a session with our experts."
                                    link="/consultation"
                                />
                                <ControlCard
                                    icon={<ShieldCheck size={28} />}
                                    title="Document Verification"
                                    desc="Track your status or submit new docs."
                                    link="/verification"
                                />
                                <ControlCard
                                    icon={<Calendar size={28} />}
                                    title="My Bookings"
                                    desc="Manage your upcoming sessions."
                                    link="/my-bookings"
                                />
                                <ControlCard
                                    icon={<CreditCard size={28} />}
                                    title="Order History"
                                    desc="Access your receipts and invoices."
                                    link="/my-payments"
                                />
                            </div>
                        </div>

                        {/* Recent Activity / Real-time Alerts */}
                        <div style={{
                            background: 'white',
                            padding: 'var(--space-8)',
                            borderRadius: '24px',
                            border: '1px solid #F1F5F9',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-8)'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheck size={18} color="#F43F5E" />
                                    Urgent Alerts
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dashboardStatus.alerts && dashboardStatus.alerts.length > 0 ? (
                                        dashboardStatus.alerts.map(alert => (
                                            <div key={alert.id} style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: '#FEF2F2',
                                                borderLeft: '4px solid #EF4444'
                                            }}>
                                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', lineHeight: 1.4 }}>{alert.message}</p>
                                                <p style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', fontWeight: 800 }}>ACTION REQUIRED</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>No urgent alerts</p>
                                    )}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={18} color="#2DD4BF" />
                                    Recent Activity
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {recentActivity.map(act => (
                                        <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%', background: '#2DD4BF', marginTop: '6px',
                                                boxShadow: '0 0 0 4px #F0FDFA'
                                            }}></div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', margin: 0 }}>{act.message}</p>
                                                <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, marginTop: '2px' }}>{act.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button style={{
                                    width: '100%', padding: '10px', marginTop: '16px', borderRadius: '10px',
                                    background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B',
                                    fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                                }}>
                                    VIEW FULL LOG
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Trending News Bar */}
                    <div style={{
                        background: 'white',
                        padding: '12px 24px',
                        marginBottom: 'var(--space-12)',
                        borderRadius: '12px',
                        border: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2DD4BF', fontWeight: 800, fontSize: 'var(--text-xs)', whiteSpace: 'nowrap', zIndex: 1, background: 'white' }}>
                            <Globe size={16} />
                            <span>Trending News</span>
                        </div>
                        <div style={{ width: '1px', height: '20px', background: '#E2E8F0', zIndex: 1 }}></div>
                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                animation: 'scrollText 30s linear infinite',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                color: '#1E293B'
                            }}>
                                <span style={{ color: '#2DD4BF', marginRight: '8px' }}>NEW</span>
                                Tsinghua University announces new global robotics scholarship for 2026. &nbsp;&nbsp;&nbsp;&nbsp;
                                <span style={{ color: '#2DD4BF', marginRight: '8px' }}>UPDATE</span>
                                ITB (Indonesia) opens international undergraduate applications for Fall 2025. &nbsp;&nbsp;&nbsp;&nbsp;
                                <span style={{ color: '#2DD4BF', marginRight: '8px' }}>URGENT</span>
                                KAUST Scholarship deadline extended to March 15.
                            </div>
                        </div>
                    </div>

                    {/* Global University Discovery */}
                    <div id="university-discovery">
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1E293B', marginBottom: 'var(--space-2)' }}>Global University Discovery</h2>
                            <p style={{ color: '#64748B', fontSize: 'var(--text-md)' }}>Explore prestigious academic destinations across our partner regions.</p>
                        </div>

                        {/* CMS Discovery Highlights */}
                        {discoveryVideos.length > 0 && (
                            <div style={{ marginBottom: 'var(--space-12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                    <div style={{ width: '4px', height: '24px', background: '#2DD4BF', borderRadius: '4px' }}></div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1E293B' }}>Featured Selection</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                                    {discoveryVideos.map(video => (
                                        <VideoCard
                                            key={video.id}
                                            video={{
                                                ...video,
                                                thumbnail: `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`,
                                                description: video.title, // Use title as desc if empty
                                                author: 'Apex Global Guide'
                                            }}
                                            onWatchVideo={() => setSelectedVideo({ videoId: video.video_id, name: video.title, officialLink: '#' })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 'var(--space-3)',
                            marginBottom: 'var(--space-10)',
                            flexWrap: 'wrap',
                            position: 'sticky',
                            top: '80px',
                            zIndex: 10,
                            padding: '12px',
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px'
                        }}>
                            {['Indonesia', 'Saudi Arabia', 'Turkey', 'China'].map(country => (
                                <button
                                    key={country}
                                    onClick={() => fetchUniversities(country)}
                                    className={`btn`}
                                    style={{
                                        borderRadius: 'var(--radius-full)',
                                        padding: '10px 28px',
                                        fontSize: 'var(--text-xs)',
                                        fontWeight: 800,
                                        background: selectedCountry === country ? '#2DD4BF' : 'white',
                                        color: selectedCountry === country ? '#1E293B' : '#64748B',
                                        border: '1px solid #E2E8F0',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedCountry === country ? '0 4px 12px rgba(45, 212, 191, 0.2)' : 'none'
                                    }}
                                >
                                    {country}
                                </button>
                            ))}
                        </div>

                        <div className="uni-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-16)' }}>
                            {unis.map(uni => (
                                <UniversityCard
                                    key={uni.id}
                                    name={uni.name}
                                    location={uni.location}
                                    image={uni.imageUrl}
                                    officialLink={uni.officialLink}
                                    description={uni.description}
                                    country={uni.country}
                                    videoId={uni.videoId}
                                    onWatchVideo={() => {
                                        addActivity('view', `Watched video for ${uni.name}`);
                                        setSelectedVideo({ videoId: uni.videoId, name: uni.name, officialLink: uni.officialLink });
                                    }}
                                    onVisitSite={() => {
                                        addActivity('view', `Visited ${uni.name} official website`);
                                    }}
                                />
                            ))}
                            {unis.length === 0 && !loadingUnis && (
                                <p style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>No universities found for this region.</p>
                            )}
                        </div>
                    </div>

                    {/* Video Resource Library */}
                    <div style={{ paddingBottom: 'var(--space-16)' }}>
                        <div style={{ marginBottom: 'var(--space-10)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                    <Play size={20} />
                                </div>
                                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-slate)' }}>Student Success Stories & Guides</h2>
                            </div>
                            <p style={{ color: 'var(--color-text-dim)', fontSize: '15px' }}>Learn from real experiences of students who achieved their dreams.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-8)' }}>
                            {(successVideos.length > 0 ? successVideos : videos).map(video => (
                                <VideoCard
                                    key={video.id}
                                    video={{
                                        ...video,
                                        thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`,
                                        category: video.category?.replace('_', ' ') || 'Success Story',
                                        author: video.author || 'Global Alumni'
                                    }}
                                    onWatchVideo={() => setSelectedVideo({ 
                                        videoId: video.video_id || video.url, 
                                        name: video.title, 
                                        officialLink: '#' 
                                    })}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ height: 'var(--space-20)' }}></div>

            {/* Integrated Video Modal */}
            <VideoModal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                videoId={selectedVideo?.videoId}
                name={selectedVideo?.name}
                officialLink={selectedVideo?.officialLink}
            />

            {isUploadModalOpen && <UploadCenter isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />}
        </Layout>
    );
}

// --- SUB COMPONENTS ---


// --- INFINITE UNIVERSITY CAROUSEL DATA ---
const ELITE_UNIVERSITIES = [
    {
        name: 'University of Oxford',
        country: 'UK',
        flag: '🇬🇧',
        website: 'https://www.ox.ac.uk',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Harvard University',
        country: 'USA',
        flag: '🇺🇸',
        website: 'https://www.harvard.edu',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Tsinghua University',
        country: 'China',
        flag: '🇨🇳',
        website: 'https://www.tsinghua.edu.cn',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Universiti Malaya (UM)',
        country: 'Malaysia',
        flag: '🇲🇾',
        website: 'https://www.um.edu.my',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Universitas Indonesia',
        country: 'Indonesia',
        flag: '🇮🇩',
        website: 'https://www.ui.ac.id',
        image: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'University of Cambridge',
        country: 'UK',
        flag: '🇬🇧',
        website: 'https://www.cam.ac.uk',
        image: 'https://images.unsplash.com/photo-1569974498991-d3c12a504f86?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'MIT',
        country: 'USA',
        flag: '🇺🇸',
        website: 'https://www.mit.edu',
        image: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Peking University',
        country: 'China',
        flag: '🇨🇳',
        website: 'https://www.pku.edu.cn',
        image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=900&q=80'
    }
];

function ElitePartnersSlider() {
    const [paused, setPaused] = useState(false);
    // Triple the array for a seamless infinite loop
    const items = [...ELITE_UNIVERSITIES, ...ELITE_UNIVERSITIES, ...ELITE_UNIVERSITIES];

    return (
        <div style={{ position: 'relative', overflow: 'hidden', padding: '8px 0' }}>
            {/* Left gradient fade */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', zIndex: 2,
                background: 'linear-gradient(to right, #F8FAFC 0%, transparent 100%)',
                pointerEvents: 'none'
            }} />
            {/* Right gradient fade */}
            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', zIndex: 2,
                background: 'linear-gradient(to left, #F8FAFC 0%, transparent 100%)',
                pointerEvents: 'none'
            }} />

            <div
                style={{
                    display: 'flex',
                    gap: '20px',
                    width: 'max-content',
                    animation: paused ? 'none' : 'infiniteScroll 40s linear infinite',
                }}
            >
                {items.map((uni, i) => (
                    <div
                        key={i}
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                        style={{
                            width: '300px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'pointer',
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.18)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                        }}
                    >
                        {/* 16:9 campus image */}
                        <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', background: '#E2E8F0' }}>
                            <img
                                src={uni.image}
                                alt={uni.name}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                loading="lazy"
                            />
                        </div>

                        {/* Glassmorphism footer */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            background: 'rgba(15, 23, 42, 0.72)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                        }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: '13px', color: 'white', lineHeight: 1.2 }}>{uni.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>{uni.flag} {uni.country}</p>
                            </div>
                            <a
                                href={uni.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: '#2DD4BF',
                                    color: '#0F172A',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >
                                Official Website →
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes infiniteScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-${(100 / 3).toFixed(4)}%); }
                }
            `}</style>
        </div>
    );
}

function VideoCard({ video, onWatchVideo }) {
    return (
        <div className="card play-trigger" style={{
            padding: 0,
            overflow: 'hidden',
            background: 'white',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 30px 50px -15px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onClick={onWatchVideo}
        >
            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.3s'
                }}>
                    <div className="play-button-overlay" style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)', border: '2px solid rgba(255, 255, 255, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        transition: 'all 0.3s ease'
                    }}>
                        <Play size={24} fill="white" />
                    </div>
                </div>
                <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    fontSize: '10px', fontWeight: 900, color: '#2DD4BF'
                }}>
                    {video.category?.toUpperCase()}
                </div>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 900, color: 'var(--color-slate)', marginBottom: 'var(--space-2)', lineHeight: 1.3 }}>{video.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: '#64748B', lineHeight: 1.6, marginBottom: 'var(--space-4)', height: '44px', overflow: 'hidden' }}>{video.description}</p>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#2DD4BF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> Guided by {video.author || "Global Alumni"}
                </div>
            </div>
        </div>
    );
}

function ControlCard({ icon, title, desc, link }) {
    return (
        <div className="card" style={{
            padding: 'var(--space-8)',
            background: 'white',
            border: '1px solid #F1F5F9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
        >
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDFA',
                color: '#2DD4BF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--space-6)'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 900, color: '#1E293B', marginBottom: 'var(--space-3)' }}>{title}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: '#64748B', marginBottom: 'var(--space-6)', lineHeight: 1.6, flex: 1 }}>{desc}</p>
            <Link to={link} style={{ color: '#2DD4BF', fontWeight: 800, fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Open Service Panel <ChevronRight size={18} />
            </Link>
        </div>
    );
}

function CountryChip({ label }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            padding: '8px 20px',
            borderRadius: 'full',
            border: '1px solid #E2E8F0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1E293B',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <Globe size={14} color="#2DD4BF" />
            {label}
        </div>
    );
}

function ServiceCardDetailed({ icon, title, desc }) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            className="service-card"
            style={{
                padding: 'var(--space-10)',
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #F1F5F9',
                boxShadow: isHovered ? '0 30px 60px -12px rgba(15, 23, 42, 0.12)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                transform: isHovered ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(45, 212, 191, 0.3)'
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: '#1E293B', marginBottom: 'var(--space-2)' }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: '#64748B', lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>{desc}</p>
            </div>
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2DD4BF',
                fontWeight: 800,
                fontSize: 'var(--text-sm)',
                transition: 'all 0.3s'
            }}>
                <span>Learn More</span>
                <ChevronRight size={16} style={{
                    transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
                    transition: 'transform 0.3s'
                }} />
            </div>
        </div>
    );
}

function JourneyStep({ number, icon, title, desc }) {
    return (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#F0FDF4',
                color: '#2DD4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid #DCFCE7',
                position: 'relative'
            }}>
                {icon}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#1E293B',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 900,
                    border: '4px solid white'
                }}>{number}</div>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 900, color: '#1E293B', marginBottom: '12px' }}>{title}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: '#64748B', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>{desc}</p>
        </div>
    );
}

function Metric({ value, suffix, label, run }) {
    const [count, setCount] = useState(0);
    const target = parseInt(value);

    useEffect(() => {
        if (!run) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target, run]);

    return (
        <div>
            <div style={{ fontSize: '48px', fontWeight: 900, color: '#2DD4BF', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                <span>{count}</span>
                <span>{suffix}</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        </div>
    );
}

function TestimonialCarouselAdvanced() {
    const testimonials = [
        {
            name: "Amira Khalid",
            location: "Malaysia",
            img: "https://i.pravatar.cc/150?u=amira",
            text: "The scholarship guidance was a game-changer for my application to the UK. I secured a 100% tuition waiver.",
            rating: 5
        },
        {
            name: "John Doe",
            location: "Indonesia",
            img: "https://i.pravatar.cc/150?u=john",
            text: "Fast and reliable document verification. I felt secure throughout the entire process and got accepted to NUS.",
            rating: 5
        },
        {
            name: "Sarah Lim",
            location: "Saudi Arabia",
            img: "https://i.pravatar.cc/150?u=sarah",
            text: "Expert advice that actually works. I got my dream internship in China! The team was supportive at every step.",
            rating: 5
        },
        {
            name: "Ahmed Mousa",
            location: "Turkey",
            img: "https://i.pravatar.cc/150?u=ahmed",
            text: "Simple, transparent, and high-trust. Apex Horizons is truly the best partner for global education.",
            rating: 5
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 2) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const visibleItems = [testimonials[activeIndex], testimonials[(activeIndex + 1) % testimonials.length]];

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', transition: 'all 0.5s ease-in-out' }}>
                {visibleItems.map((t, i) => (
                    <div key={i} className="card" style={{
                        padding: '40px',
                        background: 'white',
                        border: '1px solid #F1F5F9',
                        borderRadius: '24px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
                            {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}
                        </div>
                        <p style={{ fontSize: '18px', color: '#1E293B', lineHeight: 1.6, marginBottom: '32px', fontStyle: 'italic' }}>"{t.text}"</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={t.img} alt={t.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2DD4BF' }} />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: 0 }}>{t.name}</h4>
                                    <div style={{ background: '#F0FDFA', color: '#0D9488', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: 'full', border: '1px solid #CCFBF1' }}>
                                        VERIFIED STUDENT
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>{t.location}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                {[0, 2].map((idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        style={{
                            width: activeIndex === idx ? '32px' : '8px',
                            height: '8px',
                            borderRadius: 'full',
                            background: activeIndex === idx ? '#2DD4BF' : '#E2E8F0',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}


function ServiceCard({ icon, title, desc }) {
    return (
        <div className="card" style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.3s ease'
        }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <div style={{ marginBottom: 'var(--space-2)' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-slate)', margin: 0 }}>{title}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-body)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </div>
    );
}

function NewsCard({ image, title, summary }) {
    return (
        <div style={{
            minWidth: '320px',
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.3s ease'
        }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-slate)' }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>{summary}</p>
            </div>
        </div>
    );
}

function TestimonialCarousel() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch(getApiUrl('/api/reviews/testimonials'));
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setTestimonials(data);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch testimonials:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    const defaultTestimonials = [
        { rating: 5, comment: "The scholarship guidance was a game-changer for my application to the UK.", authorName: "Amira K.", location: "Malaysia" },
        { rating: 5, comment: "Fast and reliable document verification. I felt secure throughout the entire process.", authorName: "John D.", location: "Indonesia" },
        { rating: 5, comment: "Expert advice that actually works. I got my dream internship in China!", authorName: "Sarah L.", location: "Saudi" },
        { rating: 5, comment: "Simple, transparent, and high-trust. Edu Global is the best in the market.", authorName: "Ahmed M.", location: "Egypt" },
    ];

    const displayData = testimonials.length > 0 ? testimonials.map(t => ({
        rating: t.rating,
        quote: t.comment,
        author: t.isAnonymous ? 'Anonymous Student' : (t.User?.name || 'Student'),
        location: t.ConsultantProfile?.User?.name ? `Reviewed ${t.ConsultantProfile.User.name}` : 'Global Learner'
    })) : defaultTestimonials.map(t => ({
        rating: t.rating,
        quote: t.comment,
        author: t.authorName,
        location: t.location
    }));

    // Duplicate for seamless loop if we have enough
    const doubled = [...displayData, ...displayData];

    if (loading && testimonials.length === 0) return (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            Loading testimonials...
        </div>
    );

    return (
        <div style={{ overflow: 'hidden', padding: 'var(--space-8) 0' }}>
            <div className="carousel-track" style={{ gap: 'var(--space-12)' }}>
                {doubled.map((t, i) => (
                    <div key={i} style={{ minWidth: '400px' }}>
                        <TestimonialCard {...t} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TestimonialCard({ rating, quote, author, location }) {
    return (
        <div className="card" style={{
            padding: 'var(--space-8)',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            textAlign: 'left',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            height: '100%'
        }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-4)' }}>
                {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#FBBF24" color="#FBBF24" />
                ))}
            </div>
            <p style={{
                fontSize: 'var(--text-md)',
                color: '#1E293B',
                fontStyle: 'italic',
                marginBottom: 'var(--space-6)',
                lineHeight: 1.6
            }}>
                "{quote}"
            </p>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {author[0]}
                </div>
                <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#1E293B', margin: 0 }}>{author}</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', margin: 0 }}>{location}</p>
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{
            background: isOpen ? '#F0FDFA' : 'white',
            border: isOpen ? '1px solid #2DD4BF' : '1px solid #E2E8F0',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: isOpen ? '0 10px 20px rgba(45, 212, 191, 0.05)' : 'none'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    color: '#1E293B',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontWeight: 800, fontSize: '16px' }}>{question}</span>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isOpen ? '#2DD4BF' : '#F1F5F9',
                    color: isOpen ? 'white' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                }}>
                    {isOpen ? <X size={16} /> : <ChevronDown size={18} />}
                </div>
            </button>
            <div style={{
                maxHeight: isOpen ? '300px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
            }}>
                <div style={{ padding: '0 24px 24px', color: '#64748B', fontSize: '15px', lineHeight: 1.6 }}>
                    {answer}
                </div>
            </div>
        </div>
    );
}

function ProgressCard({ label, value, status, percent, active }) {
    return (
        <div className="card" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-dim)', letterSpacing: '0.05em' }}>{label}</span>
                {status === "Action Required" && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-red)' }}></div>}
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text-header)', marginBottom: 'var(--space-4)' }}>
                {value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>{status}</div>

            <div style={{ width: '100%', height: '4px', background: '#F1F5F9', borderRadius: '2px' }}>
                <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: 'var(--color-primary)',
                    borderRadius: '2px'
                }}></div>
            </div>
        </div>
    );
}

function UniversityCard({ name, location, image, officialLink, description, country, videoId, onWatchVideo, onVisitSite }) {
    const [isFavorited, setIsFavorited] = useState(false);

    // Generate some dynamic categories based on university name for high-fidelity appearance
    const getCategories = () => {
        if (name.includes('Technology') || name.includes('Tsinghua') || name.includes('Institute'))
            return { cat: 'TECH', color: '#0D9488', bg: '#F0FDFA', badge: 'TOP NATIONAL', bColor: '#F59E0B', bBg: '#FFFBEB' };
        if (name.includes('Indonesia') || name.includes('Melbourne'))
            return { cat: 'LAW & BUSINESS', color: '#0369A1', bg: '#F0F9FF', badge: 'OLDEST UNIVERSITY', bColor: '#D97706', bBg: '#FFFBEB' };
        if (name.includes('BINUS'))
            return { cat: 'IT & CREATIVE', color: '#C2410C', bg: '#FFF7ED', badge: 'Top 5 Private', bColor: '#EA580C', bBg: '#FFF7ED' };
        return { cat: 'SOCIAL SCIENCES', color: '#059669', bg: '#F0FDF4', badge: 'TOP PUBLIC', bColor: '#D97706', bBg: '#FFFBEB' };
    };

    const categories = getCategories();

    return (
        <div className="card" style={{
            padding: 0,
            overflow: 'hidden',
            background: 'white',
            border: '1px solid #F1F5F9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            borderRadius: '24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
        >
            {/* Heart Button Overlay */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsFavorited(!isFavorited); }}
                style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 10,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isFavorited ? '#F43F5E' : '#94A3B8',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                <Heart size={20} fill={isFavorited ? "#F43F5E" : "none"} />
            </button>

            {/* Split Action: Top Area with Video Trigger */}
            <div
                className="play-trigger"
                style={{
                    height: '240px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer'
                }}
                onClick={onWatchVideo}
            >
                <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} />

                {/* Overlay with Content */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="play-button-overlay" style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#1E293B',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative'
                    }}>
                        <div className="pulse-button" style={{
                            position: 'absolute',
                            inset: '-8px',
                            border: '2px solid rgba(255,255,255,0.4)',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                        }}></div>
                        <Play size={28} fill="#1E293B" style={{ marginLeft: '4px', zIndex: 1 }} />
                    </div>
                </div>

                <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: '#1E293B', color: 'white', padding: '4px 12px', borderRadius: '6px',
                    fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                    {country}
                </div>
            </div>

            {/* Split Action: Bottom Info Area */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#2DD4BF', padding: '2px 8px', background: '#F0FDFA', borderRadius: '4px' }}>VERIFIED PARTNER</div>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1E293B', marginBottom: '8px', lineHeight: 1.3 }}>{name}</h3>
                <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6, flex: 1 }}>
                    {description || "Explore prestigious academic destinations across our partner regions."}
                </p>

                <div style={{ marginTop: 'auto' }}>
                    <a
                        href={officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onVisitSite}
                        className="btn"
                        style={{
                            width: '100%',
                            background: '#2DD4BF',
                            color: '#1E293B',
                            fontWeight: 800,
                            fontSize: '13px',
                            padding: '14px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(45, 212, 191, 0.2)'
                        }}
                    >
                        Visit Official Website
                    </a>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <Link to="/consultations" style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textDecoration: 'none' }}>
                            Ready to apply? <span style={{ color: '#2DD4BF' }}>Start Application here</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add scroll animation styles
const tickerStyles = `
@keyframes scrollText {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
@keyframes slideTrack {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
}
.status-pulse {
    animation: pulse 2s infinite ease-in-out;
}
.play-trigger:hover .play-button-overlay {
    transform: scale(1.1);
    background: var(--color-primary) !important;
    box-shadow: 0 0 30px rgba(45, 212, 191, 0.4);
}
.play-trigger:hover img {
    transform: scale(1.05);
}
`;
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = tickerStyles;
    document.head.appendChild(styleSheet);
}

function UploadCenter({ isOpen, onClose }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(10);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', 'Dashboard Upload');
        formData.append('category', 'scholarship');

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => (prev < 90 ? prev + 5 : prev));
            }, 100);

            const res = await fetch(getApiUrl('/api/documents/analyze'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    // Reset state
                    setFile(null);
                    setSuccess(false);
                    setProgress(0);
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="overlay" style={{ zIndex: 2000 }}>
            <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-8)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontWeight: 900, fontSize: '20px' }}>Upload Documents</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <X size={24} />
                    </button>
                </div>

                {!success ? (
                    <>
                        <div
                            className="dropzone"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                background: '#F8FAFC',
                                border: '2px dashed #E2E8F0',
                                borderRadius: '16px',
                                padding: '40px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2DD4BF'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <div style={{ width: '64px', height: '64px', background: '#F0FDFA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2DD4BF' }}>
                                <Upload size={32} />
                            </div>
                            <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>{file ? file.name : 'Click or Drag to Upload'}</h4>
                            <p style={{ fontSize: '14px', color: '#64748B' }}>Supports PDF, PNG, JPG (Max 10MB)</p>
                        </div>

                        {error && (
                            <div style={{ marginTop: '16px', padding: '12px', background: '#FEF2F2', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        {uploading && (
                            <div style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 800 }}>
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: '#2DD4BF', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            disabled={!file || uploading}
                            onClick={handleSubmit}
                            style={{
                                width: '100%',
                                marginTop: 'var(--space-8)',
                                padding: '16px',
                                borderRadius: '12px',
                                fontWeight: 900,
                                opacity: !file || uploading ? 0.5 : 1
                            }}
                        >
                            {uploading ? 'Processing...' : 'Submit Document'}
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ width: '80px', height: '80px', background: '#F0FDFA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#2DD4BF' }}>
                            <Check size={48} />
                        </div>
                        <h3 style={{ fontWeight: 900, fontSize: '24px', marginBottom: '8px' }}>Upload Successful!</h3>
                        <p style={{ color: '#64748B' }}>Your document has been sent for verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function WeeklySpotlight({ uni, onWatchVideo }) {
    if (!uni) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.2fr',
            minHeight: '240px',
            maxWidth: '960px',
            margin: '0 auto var(--space-16)',
            boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {/* Left Side: Featured Image */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                    src={uni.imageUrl}
                    alt={uni.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(30, 41, 59, 0), rgba(30, 41, 59, 0.4))'
                }}></div>
            </div>

            {/* Right Side: Content */}
            <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(45, 212, 191, 0.15)',
                    color: '#2DD4BF',
                    padding: '4px 12px',
                    borderRadius: 'full',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '12px',
                    width: 'fit-content',
                    border: '1px solid rgba(45, 212, 191, 0.3)'
                }}>
                    <Star size={12} fill="currentColor" /> University of the Week
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '8px', lineHeight: 1.2 }}>
                    {uni.name}
                </h2>

                <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', maxWidth: '500px' }}>
                    {uni.featuredPitch || uni.description}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => onWatchVideo({ videoId: uni.videoId, name: uni.name, officialLink: uni.officialLink })}
                        className="btn"
                        style={{
                            background: '#2DD4BF',
                            color: '#1E293B',
                            padding: '10px 20px',
                            fontWeight: 800,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px'
                        }}
                    >
                        <Play size={16} fill="currentColor" /> Watch Tour
                    </button>

                    <a
                        href={uni.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '10px 20px',
                            fontWeight: 700,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                    >
                        Guide <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}

function AdmissionsGuideCTA({ isLoggedIn }) {
    const handleDownload = () => {
        if (!isLoggedIn) {
            window.location.href = '/register?redirect=admissions-guide';
            return;
        }

        // Trigger download
        const link = document.createElement('a');
        link.href = '/api/resources/download/admissions-guide';
        link.setAttribute('download', 'Apex_Horizons_Admissions_Guide_2026.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="admissions-guide-card" style={{
            background: 'linear-gradient(135deg, #F0FDFA 0%, #E2E8F0 100%)',
            borderRadius: '24px',
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            border: '1px solid #CCFBF1',
            marginBottom: '48px',
            boxShadow: '0 4px 20px rgba(45, 212, 191, 0.08)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                <div className="book-icon" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                    color: '#2DD4BF'
                }}>
                    <BookOpen size={40} />
                </div>
                <div>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>
                        Free Resource: 2026 Global Admissions Guide
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6, maxWidth: '600px' }}>
                        Master your international application with our complete PDF guide. Includes checklists, regional visa specifics, and a 12-month success roadmap.
                    </p>
                </div>
            </div>

            <button
                onClick={handleDownload}
                style={{
                    background: '#1E293B',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '15px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                Download 2026 Guide (PDF) <ChevronRight size={20} />
            </button>
        </div>
    );
}

function OnboardingChecklist() {
    const checklistItems = [
        { id: 1, label: 'Complete your Profile', icon: <Users size={18} />, completed: true },
        { id: 2, label: 'Upload your Passport/ID', icon: <Upload size={18} />, completed: false, link: '/verification' },
        { id: 3, label: 'Watch a University Tour Video', icon: <Play size={18} />, completed: false, link: '#university-discovery' }
    ];

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            padding: '32px',
            borderRadius: '24px',
            marginBottom: 'var(--space-10)',
            color: 'white',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Accent */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: '#2DD4BF',
                filter: 'blur(80px)',
                opacity: 0.2
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#2DD4BF', color: '#1E293B', padding: '6px', borderRadius: '8px' }}>
                        <FileCheck size={20} />
                    </div>
                    Quick Start Checklist
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px' }}>
                    Complete these steps to unlock your full admissions potential.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {checklistItems.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '20px',
                                borderRadius: '16px',
                                border: `1px solid ${item.completed ? '#2DD4BF44' : 'rgba(255,255,255,0.1)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'all 0.2s',
                                cursor: item.link ? 'pointer' : 'default'
                            }}
                            onClick={() => item.link && (item.link.startsWith('#') ? document.getElementById(item.link.substring(1))?.scrollIntoView({ behavior: 'smooth' }) : (window.location.href = item.link))}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: item.completed ? '#2DD4BF' : 'rgba(255,255,255,0.1)',
                                color: item.completed ? '#1E293B' : '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.completed ? <ShieldCheck size={20} /> : item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: item.completed ? '#2DD4BF' : 'white',
                                    margin: 0
                                }}>
                                    {item.label}
                                </p>
                                {item.completed && (
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#2DD4BF', display: 'block', marginTop: '2px' }}>COMPLETED</span>
                                )}
                            </div>
                            {!item.completed && <ChevronRight size={18} color="#64748B" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function VideoModal({ isOpen, onClose, videoId, name, officialLink }) {
    console.log("VideoModal received:", { videoId, name, officialLink }); // Debugging

    if (!isOpen) return null;

    const getYouTubeEmbedUrl = (id) => {
        if (!id) return '';

        let vId = id;

        try {
            // Handle full YouTube watch URLs
            if (id.includes('youtube.com/watch?v=')) {
                const urlObj = new URL(id);
                vId = urlObj.searchParams.get('v');
            }
            // Handle short youtu.be URLs
            else if (id.includes('youtu.be/')) {
                vId = id.split('youtu.be/')[1].split('?')[0];
            }
            // Handle embed URLs
            else if (id.includes('youtube.com/embed/')) {
                vId = id.split('youtube.com/embed/')[1].split('?')[0];
            }
            // If it contains a slash but isn't a known domain, it might be a full URL we didn't catch
            else if (id.includes('/')) {
                const parts = id.split('/');
                vId = parts[parts.length - 1].split('?')[0];
            }
        } catch (e) {
            console.error("Error parsing YouTube URL:", e);
        }

        if (!vId) return '';

        // Fixed: No space in the URL, using proper parameters
        return `https://www.youtube.com/embed/${vId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                background: 'white',
                borderRadius: '32px',
                overflow: 'hidden',
                display: 'flex',
                maxHeight: '85vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        zIndex: 10,
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#1E293B',
                        transition: 'all 0.2s'
                    }}
                >
                    <X size={24} />
                </button>

                {/* Video Area */}
                <div style={{ flex: 1, background: 'black', position: 'relative', aspectRatio: '16/9' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={getYouTubeEmbedUrl(videoId)}
                        title="University Tour"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{ border: 'none', zIndex: 1 }}
                    ></iframe>
                </div>

                {/* Info Sidebar */}
                <div style={{ width: '320px', padding: '40px', display: 'flex', flexDirection: 'column', background: '#F8FAFC', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', marginBottom: '16px', lineHeight: 1.2 }}>{name}</h2>
                        <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                            Experience the campus, culture, and academic excellence of {name} through this curated tour.
                        </p>

                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 800, color: '#2DD4BF', textTransform: 'uppercase', marginBottom: '8px' }}>Official Portal</p>
                            <a
                                href={officialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#1E293B', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', wordBreak: 'break-all' }}
                            >
                                Visit University Website <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    <Link
                        to="/consultations"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: '#1E293B',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '14px',
                            textAlign: 'center'
                        }}
                    >
                        Start Application with Apex <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

const ExternalLink = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);
