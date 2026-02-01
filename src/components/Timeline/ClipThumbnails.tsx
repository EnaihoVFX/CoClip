import React, { useEffect, useState, useRef } from 'react';

interface ClipThumbnailsProps {
    src: string;
    width: number;
    height: number;
    clipDuration: number;
    clipStartInAsset: number; // Time in seconds where the clip starts in the source video
}

const THUMBNAIL_WIDTH = 60; // Desired width of each thumbnail

const ClipThumbnails: React.FC<ClipThumbnailsProps> = React.memo(({
    src,
    width,
    height,
    clipDuration,
    clipStartInAsset
}) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);

    // Calculate how many thumbnails we need to fill the width
    const count = Math.ceil(width / THUMBNAIL_WIDTH);

    // Use a ref to ensure we don't try to set state on unmounted component
    const isMounted = useRef(true);
    // Ref to track if we allow generation (to avoid regenerating if props change slightly but effectively same - actually React.memo handles prop changes, but if width changes slightly during resize, we might want to debounce or just accept re-gen).
    // For now, simple effect dependency.

    useEffect(() => {
        isMounted.current = true;
        setThumbnails([]);
        setIsGenerated(false);

        const generateThumbnails = async () => {
            if (!src) return;

            const video = document.createElement('video');
            video.src = src;
            video.crossOrigin = "anonymous";
            video.muted = true;
            video.preload = "metadata";

            // Wait for metadata to ensure we can seek
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = () => resolve(true);
                video.onerror = (e) => reject(e);
            });

            const canvas = document.createElement('canvas');
            // We'll draw at relatively low res for performance, assume aspect ratio of video
            const aspect = video.videoWidth / video.videoHeight;
            const drawHeight = height;
            const drawWidth = drawHeight * aspect;

            canvas.width = drawWidth;
            canvas.height = drawHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const generatedImages: string[] = [];

            // Calculate time interval
            // The clip represents [clipStartInAsset, clipStartInAsset + clipDuration]
            // We want 'count' thumbnails evenly spaced or just filling the space.
            // Actually, for a filmstrip, we want them to represent the video content over time spatially.
            // If width is 300px and we want 60px thumbs, we need 5 thumbs.
            // Each thumb represents (clipDuration / count) seconds? No, usually filmstrips are just sampling at regular visual intervals.

            // Let's implement evenly spaced samples across the clip duration.
            const timeStep = clipDuration / count;

            for (let i = 0; i < count; i++) {
                if (!isMounted.current) return; // Stop if unmounted

                // Time for this specific thumbnail
                // We offset by half interval to get center of the segment, or just start. Let's do start.
                const time = clipStartInAsset + (i * timeStep);

                // Seek
                video.currentTime = time;

                await new Promise((resolve) => {
                    video.onseeked = () => resolve(true);
                    // Timeout just in case
                    setTimeout(() => resolve(true), 1000);
                });

                if (!isMounted.current) return;

                // Draw
                ctx.drawImage(video, 0, 0, drawWidth, drawHeight);

                // To Data URL
                // quality 0.7 for compression
                generatedImages.push(canvas.toDataURL('image/jpeg', 0.6));

                // Update state progressively (optional, or just all at once)
                // Doing it progressively looks cooler but triggers more renders.
                // Let's do batches or just push updates every few.
                // For smoother feel, let's update every frame or so? 
                // Updating React state inside a loop might be too much. 
                // Let's update in chunks of 5? Or just all at end if small count.
            }

            if (isMounted.current) {
                setThumbnails(generatedImages);
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
    }, [src, width, height, clipDuration, clipStartInAsset, count]);

    return (
        <div
            className="clip-thumbnails"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: 'hidden',
                pointerEvents: 'none', // Allow clicks to pass through to clip selection
                opacity: 0.6, // Blend with background
                filter: 'grayscale(0.3) contrast(1.1)', // Aesthetic touch
            }}
        >
            {thumbnails.map((thumb, idx) => (
                <img
                    key={idx}
                    src={thumb}
                    alt=""
                    style={{
                        height: '100%',
                        // Force width to fill available space evenly or fixed?
                        // If we calculated count based on THUMBNAIL_WIDTH, we can just let flex handle it or force size.
                        // Flex: 1 ensures they fill the container exactly.
                        flex: 1,
                        objectFit: 'cover',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        display: 'block'
                    }}
                />
            ))}
        </div>
    );
});

export default ClipThumbnails;
