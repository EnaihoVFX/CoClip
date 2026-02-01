export interface Clip {
    id: string;
    type: 'video' | 'audio' | 'text' | 'image';
    trackId: string;

    // Timeline Position
    start: number; // Start time on timeline (seconds)
    duration: number; // Duration on timeline (seconds)

    // Media Properties
    content: string; // Source URL (blob:...) or text content
    name?: string;

    // Trimming / Editing
    startInAsset: number; // Offset from beginning of source file (seconds)
    volume?: number; // 0 to 1

    // Visuals
    style?: React.CSSProperties; // For text/positioning
    isActive?: boolean; // Selection state
}

export interface Track {
    id: string;
    type: 'video' | 'audio' | 'text' | 'image';
    name: string;
    clips: Clip[];
    isMuted?: boolean;
    isLocked?: boolean;
}

export interface SceneSegment {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
}

export interface VideoProject {
    id: string;
    name: string;
    width: number;
    height: number;
    fps: number;
    duration: number; // Total duration in seconds
    scenes: SceneSegment[];
    tracks: Track[];

    // Asset Management
    assets: Asset[];
}

export interface Asset {
    id: string;
    type: 'video' | 'audio' | 'image';
    src: string; // Blob URL
    name: string;
    duration?: number; // Native duration
    thumbnail?: string; // Data URL
}
