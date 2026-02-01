import React, { useState } from 'react';

interface DirectEditOverlayProps {
    position: { x: number; y: number };
    onClose: () => void;
    onApply: (text: string) => void;
}

const DirectEditOverlay: React.FC<DirectEditOverlayProps> = ({ position, onClose, onApply }) => {
    const [inputValue, setInputValue] = useState('');

    const handleApply = () => {
        onApply(inputValue);
        onClose();
    };

    return (
        <div className="glass" style={{
            position: 'absolute', // Changed from fixed to absolute
            top: position.y,
            left: position.x,
            zIndex: 40,
            padding: '16px',
            width: '280px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'scaleUp 0.2s ease-out',
            borderRadius: '12px', // Consistency
            border: '1px solid var(--glass-border)'
        }}>
            <h4 style={{ fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>Direct Edit</h4>
            <textarea
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What should the VFX Artist do here?"
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    resize: 'none',
                    height: '60px',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleApply}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'var(--accent-blue)',
                        color: 'white',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    Apply
                </button>
            </div>
            <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default DirectEditOverlay;
