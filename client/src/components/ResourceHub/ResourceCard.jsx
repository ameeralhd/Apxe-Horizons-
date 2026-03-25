import { FileText, Download, Star } from 'lucide-react';

export default function ResourceCard({ template, onToggleFavorite }) {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = template.url;
        link.download = template.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isFavorite = template.TemplateFavorites && template.TemplateFavorites.length > 0;

    return (
        <div className="resource-card" style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            <button 
                onClick={() => onToggleFavorite(template.id)}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: isFavorite ? '#F59E0B' : '#CBD5E1',
                    transition: 'color 0.2s'
                }}
            >
                <Star size={20} fill={isFavorite ? '#F59E0B' : 'none'} />
            </button>

            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
            }}>
                <FileText size={24} />
            </div>

            <div style={{ flex: 1 }}>
                <h4 style={{ 
                    margin: 0, 
                    fontSize: '15px', 
                    fontWeight: 800, 
                    color: '#1E293B',
                    lineHeight: 1.4
                }}>
                    {template.name}
                </h4>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginTop: '6px' 
                }}>
                    <span style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '20px', 
                        background: '#F0FDFA', 
                        color: '#0D9488',
                        fontWeight: 700
                    }}>
                        {template.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {template.fileType}
                    </span>
                </div>
            </div>

            <button 
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginTop: '4px'
                }}
            >
                <Download size={16} />
                Download Template
            </button>
        </div>
    );
}
