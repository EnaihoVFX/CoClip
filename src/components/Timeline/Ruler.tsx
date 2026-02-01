import React from 'react';

interface RulerProps {
    duration: number;
}

// Helper to format seconds to MM:SS
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Ruler: React.FC<RulerProps> = React.memo(({ duration }) => {
    const pixelsPerSecond = 20; // Matches our TrackContent logic

    // Generate markers every 5 seconds
    const markers = Array.from({ length: Math.floor(duration / 5) + 1 }, (_, i) => i * 5);

    return (
        <div className="ruler">
            <div className="ruler-ticks">
                {markers.map(second => (
                    <span key={second}>{formatTime(second)}</span>
                ))}
            </div>
        </div>
    );
});

export default Ruler;
