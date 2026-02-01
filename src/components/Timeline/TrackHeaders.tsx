import React from 'react';
import { useProject } from '../../ProjectStore';

// Icons per track type
const TrackTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    if (type === 'text') {
        return <svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z" /></svg>;
    }
    if (type === 'video') {
        return <svg className="icon-sm" viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" /></svg>;
    }
    if (type === 'audio') {
        return <svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" /></svg>;
    }
    return null;
};

const TrackHeaders: React.FC = () => {
    const { project } = useProject();

    return (
        <div className="track-headers">
            {project.tracks.map(track => (
                <div key={track.id} className="track-control-row">
                    <div className="control-group">
                        <div className="control-icon-row">
                            <TrackTypeIcon type={track.type} />
                            <svg className="icon-sm" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3s3.1 1.29 3.1 3v2z" /></svg>
                        </div>
                        <div className="control-icon-row">
                            <svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrackHeaders;

