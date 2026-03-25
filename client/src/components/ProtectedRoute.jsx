import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem('token');
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        user = {};
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }




    if (role && user.role !== role) {
        // Simple role check, can be expanded
        return <Navigate to="/" replace />;
    }

    return children;
}
