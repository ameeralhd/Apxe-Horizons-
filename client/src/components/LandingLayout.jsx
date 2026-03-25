import { Link } from 'react-router-dom';
import { MessageSquare, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingLayout({ children }) {
    const token = localStorage.getItem('token');
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') user = JSON.parse(storedUser);
    } catch (e) { user = {}; }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
            {/* Header / Navbar */}
            <header style={{
                padding: 'var(--space-6) 0',
                borderBottom: '1px solid #F1F5F9',
                background: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#1E293B' }}>
                            <span style={{ color: '#2DD4BF' }}>Apex</span> Horizons
                        </span>
                    </Link>

                    <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                        {!token ? (
                            <>
                                <Link to="/login" style={{ fontWeight: 600, color: '#4F46E5', fontSize: 'var(--text-sm)' }}>Login</Link>
                                <Link to="/register" className="btn" style={{
                                    background: '#2DD4BF',
                                    color: '#1E293B',
                                    padding: '10px 24px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 700
                                }}>
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                {/* Notification Bell */}
                                <div style={{ position: 'relative', cursor: 'pointer' }}>
                                    <Bell size={20} color="#64748B" />
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#F43F5E', borderRadius: '50%', border: '2px solid white' }}></div>
                                </div>

                                {/* User Dropdown */}
                                <div className="profile-dropdown-container" style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: '#2DD4BF',
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 900,
                                            fontSize: '12px'
                                        }}>
                                            {user.name ? user.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{user.name?.split(' ')[0]}</span>
                                        <ChevronDown size={14} />
                                    </div>
                                    <div className="dropdown-menu" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '12px',
                                        width: '200px',
                                        background: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        border: '1px solid #F1F5F9',
                                        padding: '8px',
                                        display: 'none',
                                        zIndex: 1001
                                    }}>
                                        <Link to="/" style={dropdownItemStyle}>Dashboard</Link>
                                        <Link to="/settings" style={dropdownItemStyle}>Settings</Link>
                                        <button onClick={handleLogout} style={{ ...dropdownItemStyle, width: '100%', border: 'none', background: 'none', color: '#F43F5E', cursor: 'pointer' }}>Logout</button>
                                    </div>
                                </div>
                                <style>{`
                                    .profile-dropdown-container:hover .dropdown-menu { display: block !important; }
                                `}</style>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {/* Sticky Chat Button (Floating) */}
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#1E293B',
                color: '#2DD4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                zIndex: 1000,
                transition: 'transform 0.2s ease'
            }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageSquare size={24} />
            </div>

            {/* Footer */}
            <footer style={{ background: '#0F172A', color: 'white', padding: 'var(--space-16) 0 var(--space-8)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-12)', marginBottom: 'var(--space-12)' }}>
                        <div style={{ maxWidth: '300px' }}>
                            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'white' }}>Apex Horizons</h3>
                            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                                Professional international consultancy providing elite guidance for scholarships, careers, and academic document verification.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <li><Link to="/" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Home</Link></li>
                                <li><Link to="/consultation" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Consultations</Link></li>
                                <li><Link to="/verification" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Document Verification</Link></li>
                                <li><Link to="/products" style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Products</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <li style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Email: info@apexhorizons.com</li>
                                <li style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>Phone: +1 234 567 890</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <p style={{ color: '#64748B', fontSize: 'var(--text-xs)' }}>© 2026 Apex Horizons Group — All Rights Reserved.</p>
                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                            <Link to="/privacy" style={{ color: '#2DD4BF', fontSize: 'var(--text-xs)' }}>Privacy Policy</Link>
                            <Link to="/terms" style={{ color: '#2DD4BF', fontSize: 'var(--text-xs)' }}>Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
