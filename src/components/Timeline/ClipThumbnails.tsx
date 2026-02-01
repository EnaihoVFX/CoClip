import React, { useEffect, useState, useRef } from 'react';
import { getCachedThumbnail, setCachedThumbnail } from './ThumbnailCache';

interface ClipThumbnailsProps {
    src: string;
    width: number;
    height: number;
    clipDuration: number;
    clipStartInAsset: number; // Time in seconds where the clip starts in the source video
}

const THUMBNAIL_WIDTH = 60;
const PIXELS_PER_SECOND = 20;
const TIME_STEP = THUMBNAIL_WIDTH / PIXELS_PER_SECOND; // 3 seconds per thumbnail

const ClipThumbnails: React.FC<ClipThumbnailsProps> = React.memo(({
    src,
    width,
    height,
    clipDuration,
    clipStartInAsset
}) => {
    const [thumbnails, setThumbnails] = useState<{ time: number, url: string }[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);

    // Quantization Logic
    // We want thumbnails at fixed intervals: 0, 3, 6, 9...
    // Find the range covering [clipStartInAsset, clipStartInAsset + duration]
    const startQuantized = Math.floor(clipStartInAsset / TIME_STEP) * TIME_STEP;
    const endQuantized = Math.ceil((clipStartInAsset + clipDuration) / TIME_STEP) * TIME_STEP;

    // Calculate visual offset
    // If clip starts at 4s, and first thumb is 3s, offset is (3-4) * PPS = -20px.
    const leftOffset = (startQuantized - clipStartInAsset) * PIXELS_PER_SECOND;

    // Use a ref to ensure we don't try to set state on unmounted component
    const isMounted = useRef(true);
    // Ref to track if we allow generation (to avoid regenerating if props change slightly but effectively same - actually React.memo handles prop changes, but if width changes slightly during resize, we might want to debounce or just accept re-gen).
    // For now, simple effect dependency.

    useEffect(() => {
        isMounted.current = true;
        // Do NOT clear thumbnails immediately to prevent flashing.
        // setThumbnails([]); 

        const generateThumbnails = async () => {
            if (!src) return;

            // 1. Calculate required timestamps
            const requiredTimestamps: number[] = [];
            for (let t = startQuantized; t < endQuantized; t += TIME_STEP) {
                requiredTimestamps.push(t);
            }

            // 2. Check Cache & Reuse
            // We map timestamps to {time: t, url: string}
            let newThumbnails: { time: number, url: string }[] = [];
            let missingIndices: number[] = [];

            requiredTimestamps.forEach((time, index) => {
                const cached = getCachedThumbnail(src, time);
                if (cached) {
                    newThumbnails.push({ time, url: cached });
                } else {
                    newThumbnails.push({ time, url: '' }); // Placeholder
                    missingIndices.push(index);
                }
            });

            // Immediate update with what we have
            setThumbnails([...newThumbnails]);

            if (missingIndices.length === 0) {
                setIsGenerated(true);
                return;
            }

            // 3. Generate Missing
            const video = document.createElement('video');
            video.src = src;
            video.crossOrigin = "anonymous";
            video.muted = true;
            video.preload = "metadata";

            await new Promise((resolve, reject) => {
                video.onloadedmetadata = () => resolve(true);
                video.onerror = (e) => reject(e);
            });

            const canvas = document.createElement('canvas');
            // Fixed sizing for cache consistency
            // Aspect ratio might vary per video, but let's assume standard or scale?
            // Actually better to respect aspect.
            const aspect = video.videoWidth / video.videoHeight;
            const drawHeight = height;
            const drawWidth = drawHeight * aspect;
            // NOTE: If drawWidth != THUMBNAIL_WIDTH (60), we might have gaps or overlaps.
            // But we display with flex:1 or fixed width?
            // "Filmstrip" usually implies fixed visual width (60px) represents fixed time (3s).
            // So we should enforce canvas width = 60px?
            // If aspect ratio implies 60px width = X height, we might crop?
            // For now, let's keep drawing full aspect, but display logic handles sizing.

            canvas.width = drawWidth;
            canvas.height = drawHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            for (const index of missingIndices) {
                if (!isMounted.current) break;

                const time = requiredTimestamps[index];

                // Seek
                // Ensure we don't seek past duration? Browsers handle it usually.
                video.currentTime = Math.min(time, video.duration || 99999);

                await new Promise((resolve) => {
                    video.onseeked = () => resolve(true);
                    setTimeout(() => resolve(true), 500);
                });

                if (!isMounted.current) break;

                // Draw
                ctx.drawImage(video, 0, 0, drawWidth, drawHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

                // Update Cache
                setCachedThumbnail(src, time, dataUrl);

                // Update State Locally
                newThumbnails[index] = { time, url: dataUrl };

                // Batched update could go here if list is long
            }

            if (isMounted.current) {
                setThumbnails([...newThumbnails]);
                setIsGenerated(true);
            }

            // Cleanup
            video.src = "";
            video.load();
        };

        generateThumbnails().catch(err => {
            console.error("Error generating thumbnails", err);
        });

        return () => {
            isMounted.current = false;
        };
    }, [src, width, height, clipDuration, clipStartInAsset, startQuantized, endQuantized]);
    // width/duration changed dependencies to quantized numbers

    return (
        <div
            className="clip-thumbnails"
            style={{
                position: 'absolute',
                top: 0,
                left: leftOffset, // Shift the strip to align time
                width: `${thumbnails.length * THUMBNAIL_WIDTH}px`, // Explicit width based on grid
                height: '100%',
                display: 'flex',
                overflow: 'hidden',
                pointerEvents: 'none',
                opacity: 0.6,
                filter: 'grayscale(0.3) contrast(1.1)',
            }}
        >
            {thumbnails.map((item, idx) => (
                <div
                    key={item.time}
                    style={{
                        width: THUMBNAIL_WIDTH,
                        minWidth: THUMBNAIL_WIDTH,
                        height: '100%',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {item.url && (
                        <img
                            src={item.url}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
});

export default ClipThumbnails;
