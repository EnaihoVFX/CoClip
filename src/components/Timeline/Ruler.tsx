import React from 'react';

interface RulerProps {
    duration: number;
}

const Ruler: React.FC<RulerProps> = React.memo(({ duration }) => {
    const pixelsPerSecond = 20; // Matches our TrackContent logic

    // Generate markers every 1 second
    const markers = Array.from({ length: duration + 1 }, (_, i) => i);

    return (
        <div className="timeline-ruler" style={{ height: '30px', position: 'sticky', top: 0, zIndex: 5, background: '#161616', borderBottom: '1px solid #333' }}>
            <div style={{ position: 'relative', height: '100%', width: `${duration * pixelsPerSecond}px` }}>
                {markers.map(second => (
                    <div
                        key={second}
                        style={{
                            position: 'absolute',
                            left: `${second * pixelsPerSecond}px`,
                            height: '100%',
                            borderLeft: '1px solid #444',
                            paddingLeft: '4px',
                            fontSize: '0.75rem',
                            color: '#888'
                        }}
                    >
                        {second % 5 === 0 ? `${second}s` : ''}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Ruler;
