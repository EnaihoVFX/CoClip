import React, { useRef } from 'react';
import './MediaManager.css';
import { useProject } from '../../ProjectStore';
import type { Asset } from '../../types';

// --- ICONS (Inline for simplicity, as per request) ---
const IconGrid = () => (
    <svg className="media-manager-icon media-manager-icon-btn" viewBox="0 0 24 24">
        <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
);

const IconList = () => (
    <svg className="media-manager-icon media-manager-icon-btn" viewBox="0 0 24 24">
        <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
    </svg>
);

const IconFilter = () => (
    <svg className="media-manager-icon media-manager-icon-btn" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
);

const IconVideoType = () => (
    <svg className="media-manager-icon-sm" viewBox="0 0 24 24">
        <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z" />
    </svg>
);

const IconAudioType = () => (
    <svg className="media-manager-icon-sm" viewBox="0 0 24 24" style={{ fill: '#fff' }}>
        <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
);

const IconTrash = () => (
    <svg className="media-manager-icon-sm" viewBox="0 0 24 24">
        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
);

// --- COMPONENT ---

const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const generateThumbnail = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('video')) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.playsInline = true;
            video.currentTime = 1; // Seek to 1s mark

            video.onloadeddata = () => {
                // Wait for seek to complete if needed, usually onloadeddata is enough for frame
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 320; // Low res is fine for thumb
                canvas.height = 180;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                URL.revokeObjectURL(video.src);
                resolve(dataUrl);
            };

            video.onerror = () => {
                resolve(undefined);
            };
        });
    }
    return undefined;
};

const MediaManager: React.FC = () => {
    const { project, addAsset, addClipToTrack } = useProject();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            for (const file of files) {
                let duration = 0;
                let thumbnail: string | undefined = undefined;

                if (file.type.startsWith('video') || file.type.startsWith('audio')) {
                    try {
                        duration = await new Promise<number>((resolve) => {
                            const element = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
                            element.preload = 'metadata';
                            element.onloadedmetadata = () => {
                                resolve(element.duration);
                            };
                            element.onerror = () => resolve(0);
                            element.src = URL.createObjectURL(file);
                        });
                    } catch (err) {
                        console.error("Failed to load metadata", err);
                    }
                }

                if (file.type.startsWith('video')) {
                    thumbnail = await generateThumbnail(file);
                }

                // Check for image files to use as their own thumbnail
                if (file.type.startsWith('image')) {
                    thumbnail = URL.createObjectURL(file);
                }

                addAsset(file, duration, thumbnail);
            }
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Simple "Right Click" or "Click" to add to demo track for now, 
    // or better: Drag and Drop.
    // Let's implement a simple "Double Click to Add" to the first video track as a quick feature.
    const handleAssetClick = (asset: Asset) => {
        // Find a compatible track.
        const track = project.tracks.find(t => t.type === asset.type);
        if (track) {
            // Add to end of track
            const endTime = track.clips.length > 0
                ? Math.max(...track.clips.map(c => c.start + c.duration))
                : 0;

            addClipToTrack(asset.id, track.id, endTime);
        }
    };

    return (
        <div className="assets-manager">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                multiple
                accept="video/*,audio/*,image/*"
            />

            <div className="assets-header">
                <div className="header-left">
                    <span>Media</span>
                    <span className="add-btn" onClick={handleImportClick}>+</span>
                </div>
                <div className="header-right">
                    <IconGrid />
                    <IconList />
                    <IconFilter />
                </div>
            </div>

            <div className="assets-grid">
                {project.assets.map(asset => (
                    <div
                        key={asset.id}
                        className="asset-card"
                        draggable={true}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('application/coclip-asset', JSON.stringify({
                                id: asset.id,
                                type: asset.type,
                                duration: asset.duration || 5 // Use actual duration if present
                            }));
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onDoubleClick={() => handleAssetClick(asset)}
                        title="Drag to timeline or double click to add"
                    >
                        <div className={`thumbnail ${asset.type === 'audio' ? 'audio' : ''}`}>
                            <div className="thumbnail-bg">
                                {asset.thumbnail ? (
                                    <img src={asset.thumbnail} alt="" />
                                ) : (
                                    asset.type === 'audio' && <div className="audio-square"><IconAudioType /></div>
                                )}
                            </div>
                            {asset.type === 'video' && <div className="type-icon-overlay"><IconVideoType /></div>}
                            {asset.type === 'video' && <span className="duration-label">{formatDuration(asset.duration || 0)}</span>}
                        </div>
                        <span className="asset-name">{asset.name}</span>
                    </div>
                ))}

                {project.assets.length === 0 && (
                    <div style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', marginTop: '20px' }}>
                        No assets. Click + to import.
                    </div>
                )}
            </div>

            <div className="assets-footer">
                <div className="footer-check-icon">
                    <IconCheck />
                </div>
                <span>Total {project.assets.length}, 0 GB</span> {/* Placeholder for total size */}
                <div style={{ width: '20px' }}>
                    <IconTrash />
                </div>
            </div>

        </div>
    );
};

export default MediaManager;
