import React, { useCallback, useRef, useState } from 'react';
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
        selection: selectedClipId,
        selectClip,
        updateClipResult,
        isSnapping,
        addTrack
    } = useProject();

    // Ghost object for Drag & Drop
    const [ghost, setGhost] = React.useState<{ trackId: string, start: number, duration: number, type: string, valid: boolean } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Interaction Refs ---
    const isScrubbing = useRef(false);

    // Resize State
    const isResizing = useRef(false);
    const resizeState = useRef<{
        clipId: string;
        edge: 'left' | 'right';
        initialX: number;
        initialStart: number;
        initialDuration: number;
        initialStartInAsset: number;
        assetDuration?: number; // Constraints
        minStart?: number;
        maxEnd?: number;
    } | null>(null);

    // --- Timeline Interaction (Scrubbing & Resizing) ---
    const updateTimeFromMouse = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const clickX = clientX - rect.left + scrollLeft;
        const newTime = Math.max(0, clickX / PIXELS_PER_SECOND);
        setCurrentTime(newTime);
    }, [setCurrentTime]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only trigger on left click
        if (e.button !== 0) return;

        // If we are resizing, do not scrub
        if (isResizing.current) return;

        isScrubbing.current = true;
        updateTimeFromMouse(e.clientX);
        selectClip(null); // Deselect when clicking empty space
    };

    const handleResizeStart = useCallback((e: React.MouseEvent, clipId: string, edge: 'left' | 'right') => {
        // Find the clip
        let targetClip: Clip | undefined;
        let targetTrack: { id: string, clips: Clip[] } | undefined;

        for (const t of project.tracks) {
            const c = t.clips.find(clip => clip.id === clipId);
            if (c) {
                targetClip = c;
                targetTrack = t;
                break;
            }
        }
        if (!targetClip || !targetTrack) return;

        // Calculate Bounds (Collision Detection)
        const sortedClips = [...targetTrack.clips].sort((a, b) => a.start - b.start);
        const currentIndex = sortedClips.findIndex(c => c.id === clipId);

        let minStart = 0;
        let maxEnd = project.duration; // Or infinity, but project duration is a safe soft cap usually

        if (currentIndex > 0) {
            const prevClip = sortedClips[currentIndex - 1];
            minStart = prevClip.start + prevClip.duration;
        }

        if (currentIndex < sortedClips.length - 1) {
            const nextClip = sortedClips[currentIndex + 1];
            maxEnd = nextClip.start;
        }

        const asset = project.assets.find(a => a.src === targetClip?.content);
        const assetDuration = asset?.duration;

        isResizing.current = true;
        resizeState.current = {
            clipId,
            edge,
            initialX: e.clientX,
            initialStart: targetClip.start,
            initialDuration: targetClip.duration,
            initialStartInAsset: targetClip.startInAsset,
            assetDuration,
            minStart,
            maxEnd
        };
    }, [project.tracks, project.assets, project.duration]);

    // Global Mouse Listeners for Dragging
    React.useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            // 1. Resizing Logic
            if (isResizing.current && resizeState.current) {
                const {
                    clipId, edge, initialX, initialStart, initialDuration, initialStartInAsset,
                    assetDuration, minStart, maxEnd
                } = resizeState.current;

                const deltaX = e.clientX - initialX;
                const deltaSeconds = deltaX / PIXELS_PER_SECOND;

                let newStart = initialStart;
                let newDuration = initialDuration;
                let newStartInAsset = initialStartInAsset;

                if (edge === 'right') {
                    newDuration = Math.max(0.1, initialDuration + deltaSeconds);

                    // Asset bound check
                    if (assetDuration) {
                        const maxDuration = assetDuration - initialStartInAsset;
                        newDuration = Math.min(newDuration, maxDuration);
                    }

                    // Collision check (Next Clip)
                    // newStart + newDuration <= maxEnd
                    // initialStart + newDuration <= maxEnd => newDuration <= maxEnd - initialStart
                    if (maxEnd !== undefined) {
                        const maxAllowedDuration = maxEnd - initialStart;
                        newDuration = Math.min(newDuration, maxAllowedDuration);
                    }

                } else {
                    // Left Edge
                    const maxDeltaForDuration = initialDuration - 0.1;
                    const minDeltaForAsset = -initialStartInAsset;

                    // Collision check (Prev Clip)
                    // newStart >= minStart
                    // initialStart + delta >= minStart => delta >= minStart - initialStart
                    const minDeltaForCollision = minStart - initialStart;

                    let safeDelta = deltaSeconds;
                    safeDelta = Math.min(safeDelta, maxDeltaForDuration);
                    safeDelta = Math.max(safeDelta, minDeltaForAsset);
                    safeDelta = Math.max(safeDelta, minDeltaForCollision);

                    newStart = initialStart + safeDelta;
                    newDuration = initialDuration - safeDelta;
                    newStartInAsset = initialStartInAsset + safeDelta;

                    if (newStart < 0) {
                        const correction = 0 - newStart;
                        newStart += correction;
                        newDuration -= correction;
                        newStartInAsset += correction;
                    }
                }

                updateClipResult(clipId, {
                    start: newStart,
                    duration: newDuration,
                    startInAsset: newStartInAsset
                });
                return;
            }

            // 2. Scrubbing Logic
            if (isScrubbing.current) {
                updateTimeFromMouse(e.clientX);
            }
        };

        const handleWindowMouseUp = () => {
            isScrubbing.current = false;
            isResizing.current = false;
            resizeState.current = null;
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [updateClipResult, updateTimeFromMouse]); // Dependencies needed for resize logic

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
    }, [isSnapping]);

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

            if (isOverlapping) {
                // Determine compatible track type for the asset
                const newTrackType = (data.type === 'image' || data.type === 'video') ? 'video' :
                    (data.type === 'audio' ? 'audio' : 'text');

                // If the overlap is on a track that is compatible, we can create a new track of the same type "on top"
                // "On top" usually means earlier in the array if we render tracks top-down (index 0 is top),
                // but visually in timelines, "Track 1" is top. If our array is [Track 1, Track 2], inserting at index 0 makes it the new "Track 1".
                // Let's assume we want to insert it at the SAME index as the current track, pushing the current one down.
                // insertBeforeTrackId = trackId
                const newTrackId = addTrack(newTrackType, trackId);

                // Use a short timeout to allow state to update?
                // Actually, since state update is async, we can't depend on newTrackId existing in 'project.tracks' immediately
                // if we were to validate it inside addClipToTrack.
                // However, addClipToTrack generally just updates state. If we queue two state updates:
                // 1. setProject(addTrack)
                // 2. setProject(addClip)
                // React batching might work or the second one might miss the track if it relies on "prev" state finding the track.
                // addClipToTrack implementation: "prev.tracks.map..." -> if track isn't there, it does nothing.
                // Issue: addTrack creates the track, but addClipToTrack might run before the track exists in "prev.tracks" of the second setState?
                // Actually addTrack uses setProject(prev => ...). addClipToTrack uses setProject(prev => ...).
                // If we call them synchronously, the second 'setProject' callback might not see the result of the first?
                // No, React state updates from event handlers are batched usually, but if they are functional updates, they chain correctly IF they are the same state atom.
                // Here both modify 'project' atom. So:
                // Update 1 yields NewState1.
                // Update 2 receives NewState1 (if React batches) or it might receive OldState if not?
                // In React 18 auto-batching, usually fine.
                // BUT, addClipToTrack searches for trackId. If addTrack hasn't run its reducer yet?
                // Wait, functional updates queue. So Update 2's 'prev' WILL be the result of Update 1. Reference: React docs.
                // So this should work safely!

                addClipToTrack(data.id, newTrackId, startTime);
                return;
            }

            addClipToTrack(data.id, trackId, startTime);

        } catch (err) {
            console.error("Drop error", err);
        }
    }, [isSnapping, addClipToTrack, addTrack]);

    return (
        <div
            className="track-content"
            ref={containerRef}
            onMouseDown={handleMouseDown}
        >
            <Playhead />
            <Ruler duration={project.duration} />

            <div style={{ position: 'relative', minWidth: `${project.duration * PIXELS_PER_SECOND}px`, minHeight: '100%' }}>
                <TracksLayer
                    tracks={project.tracks}
                    ghost={ghost}
                    selectedClipId={selectedClipId}
                    selectClip={selectClip}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onResizeStart={handleResizeStart}
                />
            </div>
        </div>
    );
};

export default TrackContent;
