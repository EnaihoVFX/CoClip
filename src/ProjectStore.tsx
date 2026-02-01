import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { VideoProject, Clip, Asset } from './types';

// --- HELPER FOR UUID ---
const generateId = () => crypto.randomUUID();

// --- INITIAL EMPTY STATE ---
const INITIAL_PROJECT: VideoProject = {
    id: 'project-1',
    name: 'New Masterpiece',
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 60, // Default duration
    scenes: [
        { id: 'scene-1', name: 'Intro' },
        { id: 'scene-2', name: 'Scene 1' },
        { id: 'scene-3', name: 'Transition' },
        { id: 'scene-4', name: 'Scene 2' },
    ],
    tracks: [
        { id: generateId(), type: 'text', name: 'Text Layer', clips: [] },
        { id: generateId(), type: 'video', name: 'Video Track 1', clips: [] },
        { id: generateId(), type: 'audio', name: 'Audio Track', clips: [] },
    ],
    assets: []
};

// --- CONTEXT SETUP ---

interface ProjectContextType {
    project: VideoProject;
    setProject: (project: VideoProject) => void;
    // Actions
    addAsset: (file: File, duration?: number, thumbnail?: string) => void;
    addClipToTrack: (assetId: string, trackId: string, time: number) => void;
    updateClipResult: (clipId: string, updates: Partial<Clip>) => void;
    splitClip: (clipId: string, splitTime: number) => void;
    removeClip: (clipId: string) => void;
    addTrack: (type: 'video' | 'audio' | 'text', insertBeforeTrackId?: string, name?: string) => string;
    // Playback
    currentTime: number;
    setCurrentTime: (time: number | ((prev: number) => number)) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    // Selection
    selectedClipId: string | null;
    selectClip: (id: string | null) => void;
    // Snapping
    // Snapping
    isSnapping: boolean;
    toggleSnapping: () => void;
    // Tooling
    splitSelectedClip: () => void;
    deleteSelectedClip: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [project, setProject] = useState<VideoProject>(INITIAL_PROJECT);

    // 1. Import Asset
    const addAsset = React.useCallback((file: File, duration?: number, thumbnail?: string) => {
        const newAsset: Asset = {
            id: generateId(),
            type: file.type.startsWith('audio') ? 'audio' : file.type.startsWith('image') ? 'image' : 'video',
            src: URL.createObjectURL(file),
            name: file.name,
            duration: duration,
            thumbnail: thumbnail
        };
        setProject(prev => ({
            ...prev,
            assets: [...prev.assets, newAsset]
        }));
    }, []);

    // 2. Add Clip to Timeline
    const addClipToTrack = React.useCallback((assetId: string, trackId: string, time: number) => {
        setProject(prev => {
            const asset = prev.assets.find(a => a.id === assetId);
            if (!asset) return prev;

            // Use asset duration if available (Video/Audio), else default 5s (Image/Text)
            const clipDuration = asset.duration || 5;

            const newClip: Clip = {
                id: generateId(),
                type: asset.type as any,
                trackId,
                start: time,
                duration: clipDuration,
                content: asset.src,
                name: asset.name,
                startInAsset: 0
            };

            // Check if we need to expand project duration
            const newClipEnd = time + clipDuration;
            const newDuration = Math.max(prev.duration, newClipEnd);

            return {
                ...prev,
                duration: newDuration,
                tracks: prev.tracks.map(t =>
                    t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
                )
            };
        });
    }, []);

    // 3. Update Clip (Move, Trim, etc)
    const updateClipResult = React.useCallback((clipId: string, updates: Partial<Clip>) => {
        setProject(prev => {
            let maxEndTime = prev.duration;

            const newTracks = prev.tracks.map(track => ({
                ...track,
                clips: track.clips.map(clip => {
                    if (clip.id === clipId) {
                        const updated = { ...clip, ...updates };
                        maxEndTime = Math.max(maxEndTime, updated.start + updated.duration);
                        return updated;
                    }
                    return clip;
                })
            }));

            return { ...prev, tracks: newTracks, duration: maxEndTime };
        });
    }, []);

    // 4. Split Clip
    const splitClip = React.useCallback((clipId: string, splitTime: number) => {
        setProject(prev => {
            // Find the clip
            let targetClip: Clip | undefined;
            let trackId: string | undefined;

            for (const track of prev.tracks) {
                const found = track.clips.find(c => c.id === clipId);
                if (found) {
                    targetClip = found;
                    trackId = track.id;
                    break;
                }
            }

            if (!targetClip || !trackId) return prev;

            // Verify split time is within clip
            if (splitTime <= targetClip.start || splitTime >= targetClip.start + targetClip.duration) return prev;

            const relativeSplit = splitTime - targetClip.start;
            const firstDuration = relativeSplit;
            const secondDuration = targetClip.duration - relativeSplit;

            // Update first clip
            const updatedFirstClip = { ...targetClip, duration: firstDuration };

            // Create second clip
            const secondClip: Clip = {
                ...targetClip,
                id: generateId(),
                start: splitTime,
                duration: secondDuration,
                startInAsset: targetClip.startInAsset + firstDuration
            };

            return {
                ...prev,
                tracks: prev.tracks.map(t =>
                    t.id === trackId ? {
                        ...t,
                        clips: t.clips.map(c => c.id === clipId ? updatedFirstClip : c).concat(secondClip)
                    } : t
                )
            };
        });
    }, []);

    // 5. Add Track
    const addTrack = React.useCallback((type: 'video' | 'audio' | 'text', insertBeforeTrackId?: string, name?: string) => {
        const newTrackId = generateId();
        setProject(prev => {
            const newTrack: { id: string; type: 'video' | 'audio' | 'text'; name: string; clips: Clip[] } = {
                id: newTrackId,
                type,
                name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${prev.tracks.filter(t => t.type === type).length + 1}`,
                clips: []
            };

            let newTracks = [...prev.tracks];
            if (insertBeforeTrackId) {
                const index = newTracks.findIndex(t => t.id === insertBeforeTrackId);
                if (index !== -1) {
                    newTracks.splice(index, 0, newTrack);
                } else {
                    newTracks.push(newTrack);
                }
            } else {
                newTracks.push(newTrack);
            }

            return {
                ...prev,
                tracks: newTracks
            };
        });
        return newTrackId; // Note: State updates are async, so this ID is valid but track might not be in state immediately for sync usage if accessed from state directly
    }, []);

    // 6. Playback State
    const [currentTime, setCurrentTime] = useState(0); // In seconds
    const [isPlaying, setIsPlaying] = useState(false);

    // 7. Selection State
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

    const selectClip = React.useCallback((id: string | null) => {
        setSelectedClipId(id);
    }, []);

    // Modified removeClip to handle selection
    const removeClip = React.useCallback((clipId: string) => {
        setProject(prev => ({
            ...prev,
            tracks: prev.tracks.map(t => ({
                ...t,
                clips: t.clips.filter(c => c.id !== clipId)
            }))
        }));
        setSelectedClipId(prev => prev === clipId ? null : prev);
    }, []);

    // 8. Snapping State
    const [isSnapping, setIsSnapping] = useState(false);
    const toggleSnapping = React.useCallback(() => setIsSnapping(prev => !prev), []);

    // 9. Tooling Helpers (Split/Delete Selected)
    const splitSelectedClip = React.useCallback(() => {
        if (!selectedClipId) return;
        splitClip(selectedClipId, currentTime);
    }, [selectedClipId, currentTime, splitClip]);

    const deleteSelectedClip = React.useCallback(() => {
        if (!selectedClipId) return;
        removeClip(selectedClipId);
    }, [selectedClipId, removeClip]);

    return (
        <ProjectContext.Provider value={{
            project,
            setProject,
            addAsset,
            addClipToTrack,
            updateClipResult,
            splitClip,
            removeClip,
            addTrack,
            currentTime,
            setCurrentTime,
            isPlaying,
            setIsPlaying,
            selectedClipId,
            selectClip,
            isSnapping,
            toggleSnapping,
            splitSelectedClip,
            deleteSelectedClip
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
