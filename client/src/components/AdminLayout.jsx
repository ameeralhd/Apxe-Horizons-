import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    UserCog,
    LogOut,
    Menu,
    X,
    FolderTree,
    Video,
    GraduationCap,
    MessageSquare,
    ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';
import '../admin-enhanced.css';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Get user from localStorage
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        user = { name: 'Admin' };
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize(); // Initialize on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
        { path: '/admin/applicants', icon: <Users size={20} />, label: 'Applicants' },
        { path: '/admin/verification', icon: <FileCheck size={20} />, label: 'Verification Queue' },
        { path: '/admin/consultants', icon: <UserCog size={20} />, label: 'Consultants' },
        { path: '/admin/scholarships', icon: <GraduationCap size={20} />, label: 'Scholarships' },
        { path: '/admin/resource-templates', icon: <FolderTree size={20} />, label: 'Resource Templates' },
        { path: '/admin/media-manager', icon: <Video size={20} />, label: 'Media Manager' },
        { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Reviews' }
    ];

    const currentPage = navItems.find(item =>
        item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    const userInitial = (user?.name || 'A').charAt(0).toUpperCase();

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'active open' : 'closed'}`}>
                <div className="admin-sidebar-header">
                    <h2><span className="admin-logo-accent">Apex</span> Horizons</h2>
                    <span className="admin-badge">Admin</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">{userInitial}</div>
                        <div>
                            <p className="admin-user-name">{user?.name || 'Admin'}</p>
                            <p className="admin-user-role">Administrator</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`admin-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
                {/* Top Bar */}
                <header className="admin-topbar">
                    <button
                        className="admin-menu-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="admin-topbar-title">
                        <h1 className="admin-page-title">{currentPage?.label || 'Admin'}</h1>
                        <span className="interaction-heartbeat" title="Interface Active"></span>
                    </div>
                    <div className="admin-topbar-actions">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="admin-view-site-link">
                            <span>View Live Site</span> <ExternalLink size={14} />
                        </a>
                        <div className="admin-topbar-avatar" title={user?.name || 'Admin'}>{userInitial}</div>
                    </div>
                </header>

                <div
                    className="admin-sidebar-overlay mobile-only"
                    onClick={() => setSidebarOpen(false)}
                    style={{ visibility: sidebarOpen ? 'visible' : 'hidden', opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.3s ease' }}
                ></div>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
