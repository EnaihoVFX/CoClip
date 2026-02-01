import React, { useMemo } from 'react';

interface AudioWaveformProps {
    width: number;
    height: number;
    color?: string;
    gap?: number;
    barWidth?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
    width,
    height,
    color = 'rgba(255, 255, 255, 0.5)',
    gap = 2,
    barWidth = 3
}) => {
    // Determine how many bars fit in the width
    const barCount = Math.floor(width / (barWidth + gap));

    // Generate pseudo-random heights for the bars
    // We use useMemo so they stay stable unless width changes
    const bars = useMemo(() => {
        const result = [];
        for (let i = 0; i < barCount; i++) {
            // Use sine wave + some randomness for a "natural" but aesthetic look
            const baseHeight = Math.sin(i * 0.2) * 0.3 + 0.5; // 0.2 to 0.8 range
            const noise = Math.random() * 0.2;
            const finalHeight = Math.min(0.9, Math.max(0.1, baseHeight + noise));
            result.push(finalHeight);
        }
        return result;
    }, [barCount]);

    return (
        <div
            className="audio-waveform"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${gap}px`,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                padding: '0 4px',
                pointerEvents: 'none',
                opacity: 0.8
            }}
        >
            {bars.map((h, i) => (
                <div
                    key={i}
                    style={{
                        width: `${barWidth}px`,
                        height: `${h * 100}%`,
                        backgroundColor: color,
                        borderRadius: '2px', // Rounded rectangle
                        transition: 'height 0.2s ease'
                    }}
                />
            ))}
        </div>
    );
};

export default AudioWaveform;
