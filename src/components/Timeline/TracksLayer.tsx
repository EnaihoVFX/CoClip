import React from 'react';
import type { Clip } from '../../types';
import ClipThumbnails from './ClipThumbnails';
import AudioWaveform from './AudioWaveform';

const PIXELS_PER_SECOND = 20;

// Reusable wrapper that adds selection and resize handles
const ResizableClip: React.FC<{
    clip: Clip;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent) => void;
    onResizeStart: (e: React.MouseEvent, clipId: string, edge: 'left' | 'right') => void;
    children: React.ReactNode;
    className?: string; // extra classes
}> = ({ clip, isSelected, onSelect, onResizeStart, children, className = '' }) => {
    const width = clip.duration * PIXELS_PER_SECOND;
    const left = clip.start * PIXELS_PER_SECOND;

    return (
        <div
            className={className}
            onClick={(e) => { e.stopPropagation(); onSelect(e); }}
            style={{
                position: 'absolute',
                left: `${left}px`,
                width: `${width}px`,
                border: isSelected ? '2px solid #fff' : 'none', // Override base styles if needed or handle logic inside
                zIndex: isSelected ? 50 : 'auto', // Ensure selected clip is above others (and transition handles)
            }}
            title={`${clip.name} (${clip.duration.toFixed(1)}s)`}
        >
            {children}

            {/* RESIZE HANDLES - Only visible/active if selected? Or always? Usually always for easier access, but maybe only if selected to avoid clutter. Let's make it always interaction-ready but visually subtle (css opacity 0) */}
            {isSelected && (
                <>
                    <div
                        className="resize-handle left"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart(e, clip.id, 'left');
                        }}
                    />
                    <div
                        className="resize-handle right"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart(e, clip.id, 'right');
                        }}
                    />
                </>
            )}
        </div>
    );
};

// Text Clip Content
const TextClipRenderer: React.FC<{ clip: Clip }> = ({ clip }) => {
    const width = clip.duration * PIXELS_PER_SECOND;
    return (
        <div className={`clip-text ${width < 150 ? 'short' : 'long'}`} style={{ width: '100%', left: 0, position: 'relative' }}>
            <span className="text-icon">T</span>
            {clip.name || 'Text...'}
        </div>
    );
};

// Video Clip Content
const VideoClipRenderer: React.FC<{ clip: Clip, isSelected: boolean }> = ({ clip, isSelected }) => {
    const width = clip.duration * PIXELS_PER_SECOND;
    return (
        <div className={`clip-video placeholder ${isSelected ? 'active' : ''}`} style={{ width: '100%', left: 0, position: 'relative' }}>
            {clip.content && (
                <ClipThumbnails
                    src={clip.content}
                    width={width}
                    height={56}
                    clipDuration={clip.duration}
                    clipStartInAsset={clip.startInAsset}
                />
            )}
        </div>
    );
};

// Audio Clip Content
const AudioClipRenderer: React.FC<{ clip: Clip }> = ({ clip }) => {
    const width = clip.duration * PIXELS_PER_SECOND;
    return (
        <div className="clip-audio" style={{ width: '100%', left: 0, position: 'relative', border: 'none' }}>
            <span className="audio-label">
                <svg className="icon-white" width="10" height="10" viewBox="0 0 24 24">
                    <path fill="#fff" d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                </svg>
                {clip.name || 'Audio'}
            </span>
            <AudioWaveform width={width} height={40} color="rgba(168, 230, 207, 0.5)" />
        </div>
    );
};

// Generic fallback state style helper
// ... actually easier to just style generic div

interface TracksLayerProps {
    tracks: any[];
    ghost: { trackId: string, start: number, duration: number, valid: boolean } | null;
    selectedClipId: string | null;
    selectClip: (id: string | null) => void;
    onDragOver: (e: React.DragEvent, trackId: string, trackType: string, clips: Clip[]) => void;
    onDrop: (e: React.DragEvent, trackId: string, trackType: string, clips: Clip[]) => void;
    onResizeStart: (e: React.MouseEvent, clipId: string, edge: 'left' | 'right') => void;
}

const TracksLayer: React.FC<TracksLayerProps> = React.memo(({
    tracks,
    ghost,
    selectedClipId,
    selectClip,
    onDragOver,
    onDrop,
    onResizeStart
}) => {
    return (
        <div className="tracks-layer" style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
            {tracks.map(track => {
                const isGhostInTrack = ghost && ghost.trackId === track.id;
                // Sort clips by start time for transition rendering
                const sortedClips = [...track.clips].sort((a: Clip, b: Clip) => a.start - b.start);

                return (
                    <div
                        key={track.id}
                        className="track-lane"
                        onDragOver={(e) => onDragOver(e, track.id, track.type, track.clips)}
                        onDrop={(e) => onDrop(e, track.id, track.type, track.clips)}
                    >
                        {/* Track Label Overlay */}
                        <div style={{ position: 'absolute', top: 0, left: 0, padding: '4px', fontSize: '0.7rem', color: '#666', pointerEvents: 'none', zIndex: 0 }}>
                            {track.name}
                        </div>

                        {/* Render clips based on type */}
                        {sortedClips.map((clip: Clip, index: number) => {
                            const isSelected = selectedClipId === clip.id;
                            const onSelect = () => selectClip(clip.id);

                            // Video track: render transition handles between clips
                            let transitionElement = null;
                            if (track.type === 'video' && index > 0) {
                                const prevClip = sortedClips[index - 1];
                                const prevEndSeconds = prevClip.start + prevClip.duration;
                                const currentStartSeconds = clip.start;

                                // Only show handle if clips are effectively adjacent (gap < 0.2s)
                                if (currentStartSeconds - prevEndSeconds < 0.2) {
                                    const prevEndPx = prevEndSeconds * PIXELS_PER_SECOND;
                                    const currentStartPx = currentStartSeconds * PIXELS_PER_SECOND;
                                    const transitionLeft = (prevEndPx + currentStartPx) / 2 - 7;

                                    transitionElement = (
                                        <div
                                            key={`trans-${clip.id}`}
                                            className="transition-handle"
                                            style={{ position: 'absolute', left: `${transitionLeft}px`, zIndex: 15 }}
                                        />
                                    );
                                }
                            }

                            return (
                                <React.Fragment key={clip.id}>
                                    {transitionElement}
                                    <ResizableClip
                                        clip={clip}
                                        isSelected={isSelected}
                                        onSelect={onSelect}
                                        onResizeStart={onResizeStart}
                                        // For video we handle active class inside renderer, so standard border is fine or specific
                                        className={clip.type !== 'video' && clip.type !== 'text' ? 'clip-item' : ''}
                                    >
                                        {clip.type === 'text' && <TextClipRenderer clip={clip} />}
                                        {clip.type === 'video' && <VideoClipRenderer clip={clip} isSelected={isSelected} />}
                                        {clip.type === 'audio' && <AudioClipRenderer clip={clip} />}
                                        {/* Generic fallback styling */}
                                        {clip.type !== 'text' && clip.type !== 'video' && clip.type !== 'audio' && (
                                            <div style={{ padding: '0 8px', color: 'white', backgroundColor: '#8b5cf6', height: '100%', display: 'flex', alignItems: 'center', borderRadius: '4px' }}>
                                                {clip.name || clip.type}
                                            </div>
                                        )}
                                    </ResizableClip>
                                </React.Fragment>
                            );
                        })}

                        {/* GHOST CLIP */}
                        {isGhostInTrack && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${ghost!.start * PIXELS_PER_SECOND}px`,
                                    width: `${ghost!.duration * PIXELS_PER_SECOND}px`,
                                    height: '100%',
                                    backgroundColor: ghost!.valid ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.3)',
                                    border: `1px dashed ${ghost!.valid ? '#fff' : 'red'}`,
                                    borderRadius: '4px',
                                    zIndex: 5,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.7rem'
                                }}
                            >
                                {ghost!.valid ? 'Drop Here' : 'Overlap'}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

export default TracksLayer;
