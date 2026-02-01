import React from 'react';
import { AbsoluteFill, Sequence, Video, Audio, Img } from 'remotion';
import { useProject } from '../ProjectStore';
import type { Clip } from '../types';

const ClipItem: React.FC<{ clip: Clip }> = ({ clip }) => {
    // Basic rendering switch
    if (clip.type === 'video') {
        return (
            <Video
                src={clip.content}
                startFrom={clip.startInAsset * 30} // Remotion uses frames? No, startFrom is in seconds usually for <Video>, wait. 
                // Correction: Remotion <Video> startFrom is in frames? 
                // Checking docs: <Video> accepts startFrom in frames.
                // Our project uses 30fps.
                style={clip.style}
            // We need to handle trimming.
            // Sequence handles the timeline position.
            // startFrom handles the offset into the asset.
            />
        );
    }
    if (clip.type === 'audio') {
        return <Audio src={clip.content} volume={clip.volume ?? 1} />;
    }
    if (clip.type === 'image') {
        return <Img src={clip.content} style={clip.style} />;
    }
    if (clip.type === 'text') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                fontSize: '5rem',
                color: 'white',
                fontFamily: 'sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                ...clip.style
            }}>
                {clip.content}
            </div>
        );
    }
    return null;
};

export const MainComposition: React.FC = () => {
    const { project } = useProject();

    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
            {[...project.tracks].reverse().map((track) => {
                // Determine z-index or order.
                // In generic video editors, top tracks are usually "on top".
                // We map them in order of the array.
                // If the array is ordered Top -> Bottom visually, the top one should be z-index highest.
                // or generic HTML layering: last element is on top.
                // Typically "Video Track 1" (bottom) is background, "Text Layer" (top) is overlay.
                // Let's assume the tracks array is ordered such that the LAST element is the TOP layer.
                // ProjectStore init: Text, Video, Audio. 
                // Text is top. Video is Middle. Audio is Bottom (invisible).
                // Wait, the Store has Text (0), Video (1), Audio (2).
                // If we map 0..2, Audio will be on top (visually irrelevant), Video, then Text.
                // We probably want to reverse or be explicit.
                // For now, let's just map.

                if (track.isMuted) return null;

                return React.Children.toArray(
                    track.clips.map((clip) => {
                        return (
                            <Sequence
                                key={clip.id}
                                from={clip.start * project.fps} // Sequence from is in frames
                                durationInFrames={clip.duration * project.fps}
                            >
                                <ClipItem clip={clip} />
                            </Sequence>
                        );
                    })
                );
            })}
        </AbsoluteFill>
    );
};
