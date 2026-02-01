import React from 'react';
import SceneBar from './SceneBar';
import Toolbar from './Toolbar';
import TrackHeaders from './TrackHeaders';
import TrackContent from './TrackContent';
import './Timeline.css';

const Timeline: React.FC = () => {
    return (
        <div className="timeline-container">
            <SceneBar />
            <Toolbar />

            <div className="timeline-grid">
                <TrackHeaders />
                <TrackContent />
            </div>
        </div>
    );
};

export default Timeline;
