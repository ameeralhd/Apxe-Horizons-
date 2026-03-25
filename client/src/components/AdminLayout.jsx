import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    UserCog,
    DollarSign,
    LogOut,
    Menu,
    X,
    FolderTree,
    Video
} from 'lucide-react';
import { useState } from 'react';
import '../admin-enhanced.css';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

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
        { path: '/admin/resource-templates', icon: <FolderTree size={20} />, label: 'Resource Templates' },
        { path: '/admin/media-manager', icon: <Video size={20} />, label: 'Media Manager' },
        { path: '/admin/revenue', icon: <DollarSign size={20} />, label: 'Revenue' }
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="admin-sidebar-header">
                    <h2>Apex Horizons</h2>
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
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">{user?.name?.charAt(0)}</div>
                        <div>
                            <p className="admin-user-name">{user?.name}</p>
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
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 className="admin-page-title">Admin Command Center</h1>
                        <span className="interaction-heartbeat" title="Interface Active"></span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
