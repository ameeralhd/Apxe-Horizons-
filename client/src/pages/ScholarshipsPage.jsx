import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import {
    Search, Filter, BookOpen, Clock, MapPin, DollarSign,
    Bookmark, BookmarkCheck, ChevronDown, ChevronUp, ExternalLink,
    Star, Zap, Globe, GraduationCap, AlertTriangle, SlidersHorizontal,
    X, Check
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SCHOLARSHIP DATA
// ─────────────────────────────────────────────────────────────────────────────
const SCHOLARSHIPS = [
    {
        id: 1,
        name: 'Rhodes Scholarship',
        university: 'University of Oxford',
        country: 'UK', flag: '🇬🇧',
        field: 'Any Field',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '£18,180 / year',
        amountNum: 18180,
        deadline: '2026-03-10',
        matchScore: 95,
        link: 'https://www.rhodeshouse.ox.ac.uk',
        logo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=80&q=80',
        description: 'The most prestigious international scholarship programme, covering all fees and living costs at Oxford.'
    },
    {
        id: 2,
        name: 'Harvard Merit Scholarship',
        university: 'Harvard University',
        country: 'USA', flag: '🇺🇸',
        field: 'Business',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '$78,000 / year',
        amountNum: 78000,
        deadline: '2026-04-01',
        matchScore: 88,
        link: 'https://www.harvard.edu/scholarships',
        logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=80&q=80',
        description: 'Need-based and merit awards for outstanding students admitted to Harvard graduate programs.'
    },
    {
        id: 3,
        name: 'Tsinghua Excellence Award',
        university: 'Tsinghua University',
        country: 'China', flag: '🇨🇳',
        field: 'Engineering',
        level: 'PhD',
        fundingType: 'Full Ride',
        amount: '¥120,000 / year',
        amountNum: 16500,
        deadline: '2026-02-28',
        matchScore: 72,
        link: 'https://www.tsinghua.edu.cn',
        logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=80&q=80',
        description: 'Fully-funded PhD scholarship for international students in STEM disciplines.'
    },
    {
        id: 4,
        name: 'UM International Scholarship',
        university: 'Universiti Malaya',
        country: 'Malaysia', flag: '🇲🇾',
        field: 'Any Field',
        level: 'Bachelors',
        fundingType: 'Partial',
        amount: 'RM 12,000 / year',
        amountNum: 2600,
        deadline: '2026-05-15',
        matchScore: 80,
        link: 'https://www.um.edu.my',
        logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=80&q=80',
        description: 'Partial scholarship for top-performing international undergraduates across all faculties.'
    },
    {
        id: 5,
        name: 'UI Beasiswa Unggulan',
        university: 'Universitas Indonesia',
        country: 'Indonesia', flag: '🇮🇩',
        field: 'Social Sciences',
        level: 'Bachelors',
        fundingType: 'Tuition Only',
        amount: 'Rp 50,000,000 / year',
        amountNum: 3100,
        deadline: '2026-03-20',
        matchScore: 65,
        link: 'https://www.ui.ac.id',
        logo: 'https://images.unsplash.com/photo-1523050338692-7b835a07973f?auto=format&fit=crop&w=80&q=80',
        description: 'Government-backed tuition scholarship for exemplary Indonesian and international students.'
    },
    {
        id: 6,
        name: 'Chevening Scholarship',
        university: 'UK Universities',
        country: 'UK', flag: '🇬🇧',
        field: 'Any Field',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '£28,000 / year',
        amountNum: 28000,
        deadline: '2026-02-26',
        matchScore: 91,
        link: 'https://www.chevening.org',
        logo: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=80&q=80',
        description: 'UK government flagship scholarship covering fees, living allowance, and flights.'
    },
    {
        id: 7,
        name: 'Fulbright Program',
        university: 'US Universities',
        country: 'USA', flag: '🇺🇸',
        field: 'Any Field',
        level: 'PhD',
        fundingType: 'Full Ride',
        amount: '$45,000 / year',
        amountNum: 45000,
        deadline: '2026-06-01',
        matchScore: 84,
        link: 'https://foreign.fulbrightonline.org',
        logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=80&q=80',
        description: 'Prestigious US government exchange program for graduate study, research, and teaching.'
    },
    {
        id: 8,
        name: 'Chinese Government Scholarship',
        university: 'Peking University',
        country: 'China', flag: '🇨🇳',
        field: 'Engineering',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '¥36,000 / year',
        amountNum: 4950,
        deadline: '2026-04-30',
        matchScore: 76,
        link: 'https://www.campuschina.org',
        logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=80&q=80',
        description: 'Funded by the Chinese Ministry of Education for outstanding international graduate students.'
    },
    {
        id: 9,
        name: 'UM Presidential Award',
        university: 'Universiti Malaya',
        country: 'Malaysia', flag: '🇲🇾',
        field: 'Technology',
        level: 'PhD',
        fundingType: 'Partial',
        amount: 'RM 24,000 / year',
        amountNum: 5200,
        deadline: '2026-07-01',
        matchScore: 70,
        link: 'https://www.um.edu.my',
        logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=80&q=80',
        description: 'Partial scholarship for PhD candidates in technology and innovation streams.'
    }
];

const COUNTRIES = ['UK', 'USA', 'Indonesia', 'Malaysia', 'China'];
const LEVELS = ['Bachelors', 'Masters', 'PhD'];
const FUNDING_TYPES = ['Full Ride', 'Partial', 'Tuition Only'];
const FIELDS = ['Any Field', 'Business', 'Engineering', 'Social Sciences', 'Technology'];

function daysUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ScholarshipsPage() {
    const [search, setSearch] = useState('');
    const [filterCountry, setFilterCountry] = useState([]);
    const [filterLevel, setFilterLevel] = useState([]);
    const [filterFunding, setFilterFunding] = useState([]);
    const [filterField, setFilterField] = useState([]);
    const [matchMeOn, setMatchMeOn] = useState(false);
    const [saved, setSaved] = useState([]);
    const [openSections, setOpenSections] = useState({ country: true, level: true, funding: true, field: false });
    const [animKey, setAnimKey] = useState(0);

    const toggleFilter = (arr, setArr, val) => {
        setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
        setAnimKey(k => k + 1);
    };

    const toggleSaved = (id) => setSaved(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);

    const filtered = useMemo(() => {
        let list = SCHOLARSHIPS;
        if (matchMeOn) list = list.filter(s => s.matchScore >= 80);
        if (search.trim()) list = list.filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.university.toLowerCase().includes(search.toLowerCase())
        );
        if (filterCountry.length) list = list.filter(s => filterCountry.includes(s.country));
        if (filterLevel.length) list = list.filter(s => filterLevel.includes(s.level));
        if (filterFunding.length) list = list.filter(s => filterFunding.includes(s.fundingType));
        if (filterField.length) list = list.filter(s => filterField.includes(s.field) || (filterField.includes('Any Field') && true));
        return list;
    }, [search, filterCountry, filterLevel, filterFunding, filterField, matchMeOn]);

    const activeFilters = filterCountry.length + filterLevel.length + filterFunding.length + filterField.length;

    return (
        <Layout>
            <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)' }}>

                {/* ── Hero Banner ───────────────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #134E4A 100%)',
                    padding: '60px 24px',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Scholarship Discovery Engine</p>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1 }}>
                        Find Your <span style={{ color: '#2DD4BF' }}>Perfect Scholarship</span>
                    </h1>
                    <p style={{ color: '#94A3B8', fontSize: '16px', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                        Browse curated opportunities across 5 countries. Filter by country, degree level, and funding type.
                    </p>

                    {/* Search bar */}
                    <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setAnimKey(k => k + 1); }}
                            placeholder="Search scholarships or universities…"
                            style={{
                                width: '100%', padding: '16px 16px 16px 48px',
                                borderRadius: '14px', border: 'none',
                                fontSize: '15px', fontWeight: 500,
                                background: 'white', color: '#1E293B',
                                boxSizing: 'border-box',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }}
                        />
                    </div>

                    {/* Match Me toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                        <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Match Me</span>
                        <button onClick={() => { setMatchMeOn(p => !p); setAnimKey(k => k + 1); }}
                            style={{
                                width: '48px', height: '26px', borderRadius: '13px',
                                background: matchMeOn ? '#2DD4BF' : '#334155',
                                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s'
                            }}>
                            <div style={{
                                position: 'absolute', top: '3px',
                                left: matchMeOn ? '25px' : '3px',
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'white', transition: 'left 0.25s',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                            }} />
                        </button>
                        <span style={{ fontSize: '12px', color: matchMeOn ? '#2DD4BF' : '#64748B', fontWeight: 700 }}>
                            {matchMeOn ? 'ON — Showing 80%+ matches' : 'OFF'}
                        </span>
                    </div>
                </div>

                {/* ── Body: Sidebar + Results ────────────────────────────────── */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

                    {/* ── Sidebar ─────────────────────────────────────────────── */}
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', position: 'sticky', top: '100px' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px', color: '#1E293B' }}>
                                <SlidersHorizontal size={16} color="#2DD4BF" /> Filters
                                {activeFilters > 0 && (
                                    <span style={{ padding: '2px 8px', background: '#2DD4BF', color: '#0F172A', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                                        {activeFilters}
                                    </span>
                                )}
                            </div>
                            {activeFilters > 0 && (
                                <button onClick={() => { setFilterCountry([]); setFilterLevel([]); setFilterFunding([]); setFilterField([]); setAnimKey(k => k + 1); }}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
                                    Clear all
                                </button>
                            )}
                        </div>

                        <FilterSection title="Target Country" icon={<Globe size={14} />} open={openSections.country}
                            onToggle={() => setOpenSections(p => ({ ...p, country: !p.country }))}>
                            {COUNTRIES.map(c => (
                                <FilterChip key={c} label={c} active={filterCountry.includes(c)}
                                    onToggle={() => toggleFilter(filterCountry, setFilterCountry, c)} />
                            ))}
                        </FilterSection>

                        <FilterSection title="Degree Level" icon={<GraduationCap size={14} />} open={openSections.level}
                            onToggle={() => setOpenSections(p => ({ ...p, level: !p.level }))}>
                            {LEVELS.map(l => (
                                <FilterChip key={l} label={l} active={filterLevel.includes(l)}
                                    onToggle={() => toggleFilter(filterLevel, setFilterLevel, l)} />
                            ))}
                        </FilterSection>

                        <FilterSection title="Funding Type" icon={<DollarSign size={14} />} open={openSections.funding}
                            onToggle={() => setOpenSections(p => ({ ...p, funding: !p.funding }))}>
                            {FUNDING_TYPES.map(f => (
                                <FilterChip key={f} label={f} active={filterFunding.includes(f)}
                                    onToggle={() => toggleFilter(filterFunding, setFilterFunding, f)} />
                            ))}
                        </FilterSection>

                        <FilterSection title="Field of Study" icon={<BookOpen size={14} />} open={openSections.field}
                            onToggle={() => setOpenSections(p => ({ ...p, field: !p.field }))}>
                            {FIELDS.map(f => (
                                <FilterChip key={f} label={f} active={filterField.includes(f)}
                                    onToggle={() => toggleFilter(filterField, setFilterField, f)} />
                            ))}
                        </FilterSection>
                    </div>

                    {/* ── Results ─────────────────────────────────────────────── */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                                Showing <strong style={{ color: '#1E293B' }}>{filtered.length}</strong> scholarships
                            </p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#94A3B8' }}>
                                <Zap size={13} color="#F59E0B" /> Results sorted by match score
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                <Search size={40} color="#CBD5E1" style={{ display: 'block', margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 700, color: '#1E293B', margin: '0 0 6px' }}>No scholarships found</p>
                                <p style={{ color: '#94A3B8', fontSize: '13px' }}>Try adjusting your filters or search term.</p>
                            </div>
                        ) : (
                            <div key={animKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {[...filtered].sort((a, b) => b.matchScore - a.matchScore).map((s, i) => (
                                    <ScholarshipCard
                                        key={s.id}
                                        scholarship={s}
                                        index={i}
                                        isSaved={saved.includes(s.id)}
                                        onSave={() => toggleSaved(s.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Layout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHOLARSHIP CARD
// ─────────────────────────────────────────────────────────────────────────────
function ScholarshipCard({ scholarship: s, index, isSaved, onSave }) {
    const [expanded, setExpanded] = useState(false);
    const days = daysUntil(s.deadline);
    const isUrgent = days >= 0 && days <= 7;
    const isExpired = days < 0;

    const deadlineLabel = isExpired ? 'Expired' : isUrgent ? `Closing in ${days} day${days === 1 ? '' : 's'}` : new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const fundingColors = {
        'Full Ride': { bg: '#DCFCE7', color: '#166534' },
        'Partial': { bg: '#FEF9C3', color: '#92400E' },
        'Tuition Only': { bg: '#EFF6FF', color: '#1E40AF' }
    };
    const fc = fundingColors[s.fundingType] || fundingColors['Partial'];

    return (
        <div style={{
            background: 'white',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.25s, box-shadow 0.25s',
            animation: `fadeInUp 0.35s ease both`,
            animationDelay: `${index * 60}ms`
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
        >
            {/* Header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#F1F5F9' }}>
                        <img src={s.logo} alt={s.university} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: fc.bg, color: fc.color }}>
                                {s.fundingType}
                            </span>
                            {s.matchScore >= 80 && (
                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', background: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={10} fill="#15803D" /> {s.matchScore}% Match
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: '#1E293B', lineHeight: 1.2 }}>{s.name}</h3>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>{s.flag} {s.university}</p>
                    </div>
                    <button onClick={onSave} style={{ border: 'none', background: 'none', cursor: 'pointer', color: isSaved ? '#2DD4BF' : '#CBD5E1', padding: '4px', flexShrink: 0, transition: 'color 0.2s' }}>
                        {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                    </button>
                </div>
            </div>

            {/* Body — key data points */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <DataRow icon={<DollarSign size={14} color="#2DD4BF" />} label="Value" value={s.amount} />
                <DataRow icon={<MapPin size={14} color="#64748B" />} label="Location" value={`${s.flag} ${s.country}`} />
                <DataRow
                    icon={isUrgent ? <AlertTriangle size={14} color="#EF4444" /> : <Clock size={14} color="#64748B" />}
                    label="Deadline"
                    value={deadlineLabel}
                    urgent={isUrgent}
                    expired={isExpired}
                />
                <DataRow icon={<GraduationCap size={14} color="#64748B" />} label="Level" value={`${s.level} — ${s.field}`} />
            </div>

            {/* Expanded description */}
            {expanded && (
                <div style={{ padding: '0 20px 16px', fontSize: '13px', color: '#475569', lineHeight: 1.6, borderTop: '1px dashed #F1F5F9', paddingTop: '14px' }}>
                    {s.description}
                </div>
            )}

            {/* Footer CTAs */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a href={s.link} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, padding: '10px 0', background: '#1E293B', color: 'white',
                    borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                    textDecoration: 'none', textAlign: 'center', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'background 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2DD4BF'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1E293B'}
                >
                    View Details <ExternalLink size={12} />
                </a>
                <button onClick={() => setExpanded(p => !p)} style={{
                    padding: '10px 14px', border: '1px solid #E2E8F0', background: 'white',
                    borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#475569',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button onClick={onSave} style={{
                    padding: '10px 14px', border: '1px solid #E2E8F0', background: isSaved ? '#F0FDFA' : 'white',
                    borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: isSaved ? '#2DD4BF' : '#475569',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                }}>
                    {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function DataRow({ icon, label, value, urgent, expired }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <div style={{ flexShrink: 0 }}>{icon}</div>
            <span style={{ color: '#94A3B8', fontWeight: 600, minWidth: '60px' }}>{label}</span>
            <span style={{
                fontWeight: 700,
                color: expired ? '#94A3B8' : urgent ? '#EF4444' : '#1E293B',
                textDecoration: expired ? 'line-through' : 'none'
            }}>
                {urgent && <AlertTriangle size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                {value}
            </span>
        </div>
    );
}

function FilterSection({ title, icon, open, onToggle, children }) {
    return (
        <div style={{ borderBottom: '1px solid #F1F5F9' }}>
            <button onClick={onToggle} style={{
                width: '100%', padding: '14px 20px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                fontWeight: 700, fontSize: '13px', color: '#1E293B'
            }}>
                <span style={{ color: '#2DD4BF' }}>{icon}</span>
                {title}
                <span style={{ marginLeft: 'auto', color: '#94A3B8' }}>
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
            </button>
            {open && (
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

function FilterChip({ label, active, onToggle }) {
    return (
        <button onClick={onToggle} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '8px', border: '1px solid',
            borderColor: active ? '#2DD4BF' : '#E2E8F0',
            background: active ? '#F0FDFA' : 'white',
            color: active ? '#0F766E' : '#475569',
            fontWeight: 700, fontSize: '12px', cursor: 'pointer',
            transition: 'all 0.15s', textAlign: 'left', width: '100%'
        }}>
            <div style={{
                width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                border: '1px solid', borderColor: active ? '#2DD4BF' : '#CBD5E1',
                background: active ? '#2DD4BF' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {active && <Check size={10} color="white" />}
            </div>
            {label}
        </button>
    );
}
