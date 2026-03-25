import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ShieldCheck, Calendar, Package, Home, ChevronRight, Menu, Bell, Settings, ExternalLink, ChevronDown, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import ChatWidget from './ChatWidget';

export default function Layout({ children }) {
    const token = localStorage.getItem('token');
    // Simple user parsing
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') user = JSON.parse(storedUser);
    } catch (e) { user = {}; }

    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
        { name: 'Scholarships', path: '/scholarships', icon: <GraduationCap size={20} /> },
        { name: 'Consultations', path: '/consultation', icon: <Calendar size={20} /> },
        { name: 'Verification', path: '/verification', icon: <ShieldCheck size={20} /> },
    ];

    const dropdownItemStyle = {
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 700,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        transition: 'all 0.2s'
    };

    return (
        <div className="layout" style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header & Navigation */}
            <header style={{
                height: '80px',
                background: 'white',
                borderBottom: '1px solid #E2E8F0',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '0 var(--space-4)',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Hamburger for Mobile */}
                    <button 
                        className="mobile-only" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ marginRight: 'var(--space-4)', color: '#1E293B' }}
                    >
                        <Menu size={24} />
                    </button>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'var(--space-12)' }}>
                    <div style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: '900',
                        color: '#1E293B'
                    }}>
                        <span style={{ color: '#2DD4BF' }}>Apex</span> Horizons
                    </div>
                </Link>

                {/* Nav Links - Desktop Only */}
                <nav className="desktop-only" style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
                    {navLinks.map(link => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 700,
                                    color: isActive ? '#2DD4BF' : '#64748B',
                                    padding: 'var(--space-2) 0',
                                    borderBottom: isActive ? '2px solid #2DD4BF' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="desktop-only" style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 var(--space-4)' }}></div>

                {/* Notifications & Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    {/* Notification Bell */}
                    <div style={{ position: 'relative', cursor: 'pointer' }} title="Notifications">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B',
                            background: '#F8FAFC',
                            transition: 'all 0.2s',
                            border: '1px solid #F1F5F9'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#1E293B'; e.currentTarget.style.background = '#F1F5F9'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = '#F8FAFC'; }}
                        >
                            <Bell size={20} />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '8px',
                                height: '8px',
                                background: '#F43F5E',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }}></div>
                        </div>
                    </div>

                    {/* User Dropdown */}
                    <div className="profile-dropdown-container" style={{ position: 'relative' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '6px 16px 6px 6px',
                                background: '#F8FAFC',
                                border: '1px solid #F1F5F9',
                                borderRadius: 'var(--radius-full)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: user.avatar ? `url(${user.avatar})` : 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '14px',
                                boxShadow: '0 4px 10px rgba(45, 212, 191, 0.2)',
                                overflow: 'hidden'
                            }}>
                                {!user.avatar && (user.name ? user.name[0].toUpperCase() : 'U')}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', margin: 0, lineHeight: 1 }}>{user.name?.split(' ')[0] || 'User'}</p>
                                <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, marginTop: '2px' }}>Verified Student</p>
                            </div>
                            <ChevronDown size={14} color="#94A3B8" />
                        </div>

                        {/* Dropdown Menu (Simplified for UX prototype) */}
                        <div className="dropdown-menu" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '12px',
                            width: '240px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                            border: '1px solid #F1F5F9',
                            padding: '8px',
                            display: 'none',
                            zIndex: 1001
                        }}>
                            <Link to="/settings" style={dropdownItemStyle}>
                                <Settings size={18} /> Settings
                            </Link>
                            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px' }}></div>
                            <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#F43F5E', width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>

                </div>

                {/* Mobile Menu Drawer */}
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderBottom: '1px solid #E2E8F0',
                    padding: 'var(--space-4)',
                    display: mobileMenuOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 999,
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '12px',
                                background: location.pathname === link.path ? '#F0FDFA' : 'transparent',
                                color: location.pathname === link.path ? '#2DD4BF' : '#1E293B',
                                fontWeight: 700,
                                textDecoration: 'none'
                            }}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    ))}
                    <div style={{ height: '1px', background: '#F1F5F9', margin: '8px 0' }}></div>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} style={{ ...dropdownItemStyle, padding: '12px' }}>
                        <Settings size={18} /> Settings
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ ...dropdownItemStyle, color: '#F43F5E', width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: '12px' }}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                <style>{`
                    .profile-dropdown-container:hover .dropdown-menu {
                        display: block !important;
                        animation: slideUp 0.2s ease-out;
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{
                paddingTop: '100px',
                paddingBottom: 'var(--space-16)',
                maxWidth: '1400px',
                margin: '0 auto',
                paddingLeft: 'var(--space-4)',
                paddingRight: 'var(--space-4)'
            }}>
                {children}
            </main>

            {/* Footer */}
            <footer style={{ background: '#0F172A', color: 'white', padding: 'var(--space-12) 0 var(--space-8)', marginTop: 'var(--space-16)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--space-8)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-12)', marginBottom: 'var(--space-12)' }}>
                        <div style={{ maxWidth: '300px' }}>
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 'var(--space-4)', color: 'white' }}>
                                <span style={{ color: '#2DD4BF' }}>Apex</span> Horizons
                            </h3>
                            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                                Professional international consultancy providing elite guidance for scholarships, careers, and academic document verification.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 0 }}>
                                <li><Link to="/" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Home</Link></li>
                                <li><Link to="/consultation" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Consultations</Link></li>
                                <li><Link to="/verification" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Document Verification</Link></li>
                                <li><Link to="/products" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Products</Link></li>
                                <li><Link to="/my-bookings" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Bookings &amp; Payments</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 0 }}>
                                <li style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Email: info@apexhorizons.com</li>
                                <li style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Phone: +1 234 567 890</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <p style={{ color: '#64748B', fontSize: 'var(--text-xs)' }}>© 2026 Apex Horizons Group — All Rights Reserved.</p>
                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                            <Link to="/privacy" style={{ color: '#2DD4BF', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>Privacy Policy</Link>
                            <Link to="/terms" style={{ color: '#2DD4BF', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </footer>

            <ChatWidget />
        </div>
    );
}
