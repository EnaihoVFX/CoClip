import React from 'react';
import { useProject } from '../../ProjectStore';

const SceneBar: React.FC = () => {
    const { project } = useProject();

    return (
        <div className="scene-bar">
            {project.scenes.map(scene => (
                <div
                    key={scene.id}
                    className="scene-segment"
                    data-name={scene.name}
                    style={{
                        // Optional: Calculate flexible width based on duration content if we wanted true proportional sizing, 
                        // but sticking to flex: 1 for equal distribution as per original CSS for now unless requested.
                    }}
                ></div>
            ))}
        </div>
    );
};

export default SceneBar;
