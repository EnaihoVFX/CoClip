import React, { useEffect, useRef } from 'react';
import { useProject } from '../ProjectStore';

const OptimisticTimeCode: React.FC = () => {
    const { currentTime, isPlaying } = useProject();
    const spanRef = useRef<HTMLSpanElement>(null);
    const frameRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const startVideoTimeRef = useRef<number>(0);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        // Optional: Add frames or milliseconds if desired for "high precision" feel, 
        // but user requested "matches playhead", so standard timecode logic for now.
        // If they want frame accuracy, we might add frames later.
        return `${minutes}:${seconds}`;
    };

    const updateDisplay = (time: number) => {
        if (spanRef.current) {
            spanRef.current.textContent = formatTime(time);
        }
    };

    // 1. Sync DOM when currentTime changes
    useEffect(() => {
        updateDisplay(currentTime);
        startVideoTimeRef.current = currentTime;
        startTimeRef.current = performance.now();
    }, [currentTime]);

    // 2. Optimistic Animation Loop
    useEffect(() => {
        if (!isPlaying) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }

        startTimeRef.current = performance.now();

        const animate = () => {
            const now = performance.now();
            const elapsed = (now - startTimeRef.current) / 1000;
            const predictedTime = startVideoTimeRef.current + elapsed;

            updateDisplay(predictedTime);

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isPlaying]);

    return (
        <span ref={spanRef} className="time-code">
            {formatTime(currentTime)}
        </span>
    );
};

export default OptimisticTimeCode;
