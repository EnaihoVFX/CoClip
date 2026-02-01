import React from 'react';
import './ToolSidebar.css';

export type ToolId = 'audio' | 'media' | 'text' | 'pen';

interface ToolSidebarProps {
    activeTool: ToolId;
    onToolChange: (tool: ToolId) => void;
}

const ToolSidebar: React.FC<ToolSidebarProps> = ({ activeTool, onToolChange }) => {

    const renderTool = (id: ToolId, content: React.ReactNode, isBottom: boolean = false) => {
        const isActive = activeTool === id;

        // Special handling for Pen tool: No wrapper, no background shift
        if (id === 'pen') {
            return (
                <div
                    className={`icon-btn ${isBottom ? 'pen-btn' : ''} ${isActive ? 'active-pen' : ''}`}
                    onClick={() => onToolChange(id)}
                >
                    {content}
                </div>
            );
        }

        if (isActive) {
            return (
                <div className="active-tool-wrapper">
                    <div className="active-tool-btn">
                        {content}
                    </div>
                </div>
            );
        }

        return (
            <div
                className={`icon-btn ${isBottom ? 'pen-btn' : ''}`}
                onClick={() => onToolChange(id)}
            >
                {content}
            </div>
        );
    };

    return (
        <div className="tool-sidebar">

            {/* AUDIO ICON */}
            {renderTool('audio', (
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect>
                    <path d="M9 17V10L15 8V15"></path>
                    <circle cx="9" cy="17" r="1.5" fill="none"></circle>
                    <circle cx="15" cy="15" r="1.5" fill="none"></circle>
                </svg>
            ))}

            {/* MEDIA ICON (Empty Rect) */}
            {renderTool('media', (
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect>
                </svg>
            ))}

            {/* TEXT TOOL (T) */}
            {renderTool('text', (
                <span>T</span>
            ))}

            {/* PEN ICON */}
            {renderTool('pen', (
                <svg viewBox="0 0 24 24">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.5 7.5"></path>
                </svg>
            ), true)}

        </div>
    );
};

export default ToolSidebar;
