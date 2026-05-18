import Layout from '../components/Layout';
import ResourceLibrary from '../components/ResourceHub/ResourceLibrary';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';

export default function ProductsPage() {
    return (
        <Layout>
            <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', paddingBottom: '60px' }}>
                {/* ── Premium Hero Header ───────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0D9488 100%)',
                    padding: '80px 24px 60px',
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at 80% 20%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        background: 'rgba(45, 212, 191, 0.1)',
                        border: '1px solid rgba(45, 212, 191, 0.2)',
                        borderRadius: '30px',
                        color: '#2DD4BF',
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '20px'
                    }}>
                        <Sparkles size={14} /> Professional Document Templates
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(32px, 5vw, 54px)',
                        fontWeight: 900,
                        margin: '0 0 16px',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em'
                    }}>
                        Application <span style={{ color: '#2DD4BF' }}>Products & Toolkits</span>
                    </h1>

                    <p style={{
                        color: '#94A3B8',
                        fontSize: '17px',
                        maxWidth: '620px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Empower your international journey with our hand-crafted, high-impact curriculum vitae models, Statement of Purpose drafts, research outlines, and visa guides.
                    </p>
                </div>

                {/* ── Resource Library Section ─────────────────────────────── */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{
                        marginTop: '-30px',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            border: '1px solid #E2E8F0',
                            padding: '32px 24px',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.05)'
                        }}>
                            <ResourceLibrary />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
