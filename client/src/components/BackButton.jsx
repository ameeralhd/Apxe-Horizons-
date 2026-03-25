import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to = -1, label = 'Back' }) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(to)}
            className="btn btn-ghost" // Assuming you have a ghost/text button style, or use inline styles
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: '#666',
                padding: '0.5rem 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem'
            }}
        >
            <ArrowLeft size={18} />
            {label}
        </button>
    );
}
