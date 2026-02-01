import React, { useState } from 'react';

const PromptOverlay: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Overlay Container */}
            <div
                className="glass"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    // Move down by 100% + tab height (approx 30px) so the tab is hidden too
                    transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% + 30px))',
                    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                }}
            >
                {/* Close Tab (Down Arrow) */}
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '-24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(30, 30, 30, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '4px 20px',
                        borderRadius: '12px 12px 0 0',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderBottom: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        // Simple opacity transition to help it blend if needed, though transform does most work
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out',
                        pointerEvents: isOpen ? 'auto' : 'none',
                    }}
                >
                    ▼
                </div>

                {/* Prompt Content */}
                <div className="prompt-content" style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                        🎙️
                    </div>
                    <input
                        type="text"
                        placeholder="Direct your AI team... (e.g., 'Make the product shot pop', 'Add cinematic flare')"
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', outline: 'none', fontFamily: 'var(--font-sans)' }}
                        autoFocus={isOpen}
                    />
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}>⚡</button>
                        <button className="primary-btn" style={{ padding: '10px 24px' }}>Send</button>
                    </div>
                </div>
            </div>

            {/* Open Tab (Up Arrow) */}
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    // Use transform to slide it down, and opacity to fade it out
                    transform: isOpen ? 'translate(-50%, 100%)' : 'translate(-50%, 0)',
                    zIndex: 900,
                    background: 'rgba(30, 30, 30, 0.9)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 24px',
                    borderRadius: '12px 12px 0 0',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderBottom: 'none',
                    color: 'var(--text-secondary)',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    fontSize: '13px',
                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    opacity: isOpen ? 0 : 1,
                    pointerEvents: isOpen ? 'none' : 'auto',
                }}
            >
                <span>AI Director</span>
                <span>▲</span>
            </div>
        </>
    );
};

export default PromptOverlay;
