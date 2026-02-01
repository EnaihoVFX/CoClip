import React, { useEffect, useRef } from 'react';
import { useProject } from '../../ProjectStore';

const PIXELS_PER_SECOND = 20;

const Playhead: React.FC = () => {
    const { currentTime, isPlaying } = useProject();
    const playheadRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const startVideoTimeRef = useRef<number>(0);

    // 1. Sync DOM when currentTime changes (scrubbing, initial load, or sync corrections)
    useEffect(() => {
        if (playheadRef.current) {
            playheadRef.current.style.left = `${currentTime * PIXELS_PER_SECOND}px`;
        }
        // Always update our "base" video time when currentTime changes
        startVideoTimeRef.current = currentTime;
        // And reset the local clock base
        startTimeRef.current = performance.now();
    }, [currentTime]);

    // 2. Optimistic Animation Loop
    useEffect(() => {
        if (!isPlaying) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }

        // Capture start time when Play begins
        startTimeRef.current = performance.now();
        // We trust startVideoTimeRef is up to date from the [currentTime] effect which fires 
        // initially or during scrub.

        const animate = () => {
            const now = performance.now();
            const elapsed = (now - startTimeRef.current) / 1000; // in seconds
            const predictedTime = startVideoTimeRef.current + elapsed;

            if (playheadRef.current) {
                playheadRef.current.style.left = `${predictedTime * PIXELS_PER_SECOND}px`;
            }

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isPlaying]);

    return (
        <div
            ref={playheadRef}
            className="playhead"
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: 'white',
                zIndex: 50,
                pointerEvents: 'none',
                // Initial render position
                left: `${currentTime * PIXELS_PER_SECOND}px`
            }}
        >
            {/* Top circle */}
            <div style={{
                position: 'absolute',
                top: '-5px',
                left: '-4px',
                width: '9px',
                height: '9px',
                backgroundColor: 'white',
                borderRadius: '50%'
            }} />
            {/* Bottom circle */}
            <div style={{
                position: 'absolute',
                bottom: '-5px',
                left: '-4px',
                width: '9px',
                height: '9px',
                backgroundColor: 'white',
                borderRadius: '50%'
            }} />
        </div>
    );
};

export default Playhead;
