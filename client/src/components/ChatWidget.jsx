import { useState, useEffect, useRef } from 'react';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Apex Assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInput("");

        // Simulate Bot Response
        setTimeout(() => {
            let botResponse = "I'm not sure about that. Try asking about 'scholarships', 'consultation', or 'verification'.";
            const lowerInput = userMsg.toLowerCase();

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botResponse = "Hi there! Ready to explore global opportunities?";
            } else if (lowerInput.includes('scholarship')) {
                botResponse = "We offer expert guidance for scholarships in UK, USA, Canada, and more. Check out our Consultation page!";
            } else if (lowerInput.includes('consultation') || lowerInput.includes('book')) {
                botResponse = "You can book a session with our experts directly from the Dashboard. We offer online and face-to-face options.";
            } else if (lowerInput.includes('verification') || lowerInput.includes('document')) {
                botResponse = "We can verify your academic documents quickly. Visit the Verification section for details.";
            } else if (lowerInput.includes('thanks') || lowerInput.includes('thank you')) {
                botResponse = "You're welcome! Let me know if you need anything else.";
            }

            setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
        }, 1000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="animate-slide-up" style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '0',
                    width: '350px',
                    height: '450px',
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80' }} />
                            <span style={{ fontWeight: 'bold' }}>Apex Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>&times;</button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                                maxWidth: '80%',
                                background: msg.isBot ? 'white' : 'var(--color-primary)',
                                color: msg.isBot ? '#333' : 'white',
                                padding: '0.75rem 1rem',
                                borderRadius: '1rem',
                                borderBottomLeftRadius: msg.isBot ? '0' : '1rem',
                                borderBottomRightRadius: msg.isBot ? '1rem' : '0',
                                boxShadow: 'var(--shadow-sm)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Send</button>
                    </form>
                </div>
            )}

            {/* Floating Buton */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                className="btn-hover-effect"
            >
                {isOpen ? '↓' : '💬'}
            </button>
        </div>
    );
}
