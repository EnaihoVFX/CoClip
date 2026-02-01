import React from 'react';
import type { Clip } from '../../types';
import ClipThumbnails from './ClipThumbnails';

const PIXELS_PER_SECOND = 20;

// Generic Clip Item Component
const ClipItemRenderer: React.FC<{
    clip: Clip,
    isSelected: boolean,
    onSelect: (e: React.MouseEvent) => void
}> = ({ clip, isSelected, onSelect }) => {
    const width = clip.duration * PIXELS_PER_SECOND;
    const left = clip.start * PIXELS_PER_SECOND;

    let bgColor = '#3b82f6'; // Default blue (video)
    if (clip.type === 'audio') bgColor = '#10b981'; // Green
    if (clip.type === 'text') bgColor = '#f59e0b'; // Amber
    if (clip.type === 'image') bgColor = '#8b5cf6'; // Purple

    // Darker colors for video to let thumbnails pop
    if (clip.type === 'video') bgColor = '#1f2937';

    return (
        <div
            className="clip-item"
            onClick={(e) => {
                e.stopPropagation();
                onSelect(e);
            }}
            style={{
                position: 'absolute',
                left: `${left}px`,
                width: `${width}px`,
                height: '100%',
                backgroundColor: bgColor,
                borderRadius: '4px',
                border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0', // Removed padding to let thumbnails fill
                overflow: 'hidden',
                cursor: 'pointer',
                color: 'white',
                fontSize: '0.8rem',
                zIndex: 10,
                boxShadow: isSelected ? '0 0 0 1px rgba(0,0,0,0.5)' : 'none'
            }}
            title={`${clip.name} (${clip.duration.toFixed(1)}s)`}
        >
            {/* THUMBNAILS LAYER (Only for video) */}
            {clip.type === 'video' && (
                <ClipThumbnails
                    src={clip.content}
                    width={width}
                    height={56} // Fixed height of video clip
                    clipDuration={clip.duration}
                    clipStartInAsset={clip.startInAsset}
                />
            )}

            {/* NAME OVERLAY */}
            <div style={{
                position: 'absolute',
                bottom: '2px',
                left: '4px',
                zIndex: 2,
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 600,
                maxWidth: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: '0 4px',
                borderRadius: '2px'
            }}>
                {clip.name || clip.type}
            </div>
        </div>
    );
};

interface TracksLayerProps {
    tracks: any[]; // Using any[] to avoid importing VideoProject['tracks'] complexity, but preferably shared type
    ghost: { trackId: string, start: number, duration: number, valid: boolean } | null;
    selectedClipId: string | null;
    selectClip: (id: string | null) => void;
    onDragOver: (e: React.DragEvent, trackId: string, trackType: string, clips: Clip[]) => void;
    onDrop: (e: React.DragEvent, trackId: string, trackType: string, clips: Clip[]) => void;
}

const TracksLayer: React.FC<TracksLayerProps> = React.memo(({
    tracks,
    ghost,
    selectedClipId,
    selectClip,
    onDragOver,
    onDrop
}) => {
    // Calculate total width based on clips? The parent container handles scrolling/width.
    // TracksLayer just fills 100% height and renders lanes.

    return (
        <div className="tracks-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {tracks.map(track => {
                const isGhostInTrack = ghost && ghost.trackId === track.id;

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

                        {track.clips.map((clip: Clip) => (
                            <ClipItemRenderer
                                key={clip.id}
                                clip={clip}
                                isSelected={selectedClipId === clip.id}
                                onSelect={() => selectClip(clip.id)}
                            />
                        ))}

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
