import React, { useCallback } from 'react';
import Ruler from './Ruler';
import Playhead from './Playhead';
import TracksLayer from './TracksLayer';
import { useProject } from '../../ProjectStore';
import type { Clip } from '../../types';

const PIXELS_PER_SECOND = 20;

const TrackContent: React.FC = () => {
    const {
        project,
        addClipToTrack,
        setCurrentTime,
        selectedClipId,
        selectClip,
        isSnapping
    } = useProject();

    // Note: We do NOT destructure currentTime here to prevent re-renders of the container
    // However, useProject() will trigger re-render anyway when context changes.
    // So the memoization in TracksLayer is key.

    const [ghost, setGhost] = React.useState<{ trackId: string, start: number, duration: number, type: string, valid: boolean } | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isScrubbing = React.useRef(false);

    // --- Timeline Interaction (Scrubbing) ---
    const updateTimeFromMouse = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const clickX = e.clientX - rect.left + scrollLeft;
        const newTime = Math.max(0, clickX / PIXELS_PER_SECOND);
        setCurrentTime(newTime);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only trigger on left click
        if (e.button !== 0) return;

        isScrubbing.current = true;
        updateTimeFromMouse(e);
        selectClip(null); // Deselect when clicking empty space
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isScrubbing.current) {
            updateTimeFromMouse(e);
        } else {
            // Only nullify ghost if we are NOT dragging playhead
            // Actually, ghost logic is for DragOver (files), distinct from this mouseMove.
            // We can keep ghost logic for when dragging files.
        }
    };

    const handleMouseUp = () => {
        isScrubbing.current = false;
    };

    const handleMouseLeave = () => {
        isScrubbing.current = false;
        setGhost(null);
    };

    // --- Drag & Drop Handlers ---
    const handleDragOver = useCallback((e: React.DragEvent, trackId: string, _trackType: string, clips: Clip[]) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let startTime = Math.max(0, offsetX / PIXELS_PER_SECOND);

        // Snapping Logic
        if (startTime < 0.2) {
            startTime = 0; // Magnetic Start
        } else if (isSnapping) {
            const SNAP_INTERVAL = 0.5; // 0.5 seconds grid
            startTime = Math.round(startTime / SNAP_INTERVAL) * SNAP_INTERVAL;
        }

        const duration = 5; // Default assumption for ghost

        const isOverlapping = clips.some(c => {
            return (startTime < c.start + c.duration) && ((startTime + duration) > c.start);
        });

        setGhost({
            trackId,
            start: startTime,
            duration,
            type: 'ghost',
            valid: !isOverlapping
        });
    }, [isSnapping]); // addClipToTrack is stable (useCallback'd in store) or we rely on it being present

    const handleDrop = useCallback((e: React.DragEvent, trackId: string, trackType: string, clips: Clip[]) => {
        e.preventDefault();
        e.stopPropagation();
        setGhost(null);

        try {
            const dataRaw = e.dataTransfer.getData('application/coclip-asset');
            if (!dataRaw) return;
            const data = JSON.parse(dataRaw);

            if (data.type !== trackType) {
                const compatible = (trackType === 'video' && (data.type === 'video' || data.type === 'image')) ||
                    (trackType === 'audio' && data.type === 'audio') ||
                    (trackType === 'text' && data.type === 'text');
                if (!compatible) return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            let startTime = Math.max(0, offsetX / PIXELS_PER_SECOND);

            // Snapping Logic
            if (startTime < 0.2) {
                startTime = 0; // Magnetic Start
            } else if (isSnapping) {
                const SNAP_INTERVAL = 0.5; // 0.5 seconds grid
                startTime = Math.round(startTime / SNAP_INTERVAL) * SNAP_INTERVAL;
            }

            const duration = data.duration || 5;

            const isOverlapping = clips.some(c => {
                return (startTime < c.start + c.duration) && ((startTime + duration) > c.start);
            });

            if (isOverlapping) return;

            addClipToTrack(data.id, trackId, startTime);

        } catch (err) {
            console.error("Drop error", err);
        }
    }, [isSnapping, addClipToTrack]);

    return (
        <div
            className="track-content"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <Playhead />
            <Ruler duration={project.duration} />

            <div style={{ position: 'relative', minWidth: `${project.duration * PIXELS_PER_SECOND}px`, height: '100%' }}>
                <TracksLayer
                    tracks={project.tracks}
                    ghost={ghost}
                    selectedClipId={selectedClipId}
                    selectClip={selectClip}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
            </div>
        </div>
    );
};

export default TrackContent;
