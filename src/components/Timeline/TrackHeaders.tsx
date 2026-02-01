import React from 'react';
import { useProject } from '../../ProjectStore';

const TrackHeaders: React.FC = () => {
    const { project } = useProject();

    return (
        <div className="track-headers">
            {project.tracks.map(track => (
                <div key={track.id} className="track-control-row">
                    <div className="control-group">
                        <div className="control-icon-row">
                            <svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z" /></svg>
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
