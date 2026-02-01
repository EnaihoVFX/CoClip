import React from 'react';
import './SidebarPanel.css';
import type { ToolId } from './ToolSidebar';

interface SidebarPanelProps {
    activeTool: ToolId;
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({ activeTool }) => {

    const renderTextContent = () => (
        <>
            <div className="panel-header">
                <div className="header-left">
                    <div className="icon-t-square">T</div>
                    <div className="panel-title">Text</div>
                </div>
                <button className="add-textbox-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Add Textbox
                </button>
            </div>

            <div className="text-input-wrapper">
                <textarea className="text-input" defaultValue="Unwrap studio"></textarea>
                <svg className="resize-handle" width="8" height="8" viewBox="0 0 10 10">
                    <line x1="2" y1="10" x2="10" y2="2" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="10" x2="10" y2="6" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            <div className="section-title">Text Style</div>

            <div className="controls-grid">
                <div className="dropdown">
                    <span>Poppins</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div className="dropdown">
                    <span>75px</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>

            <div className="toggles-row">
                <div className="toggle-group">
                    <div className="toggle-btn">
                        <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '18px' }}>I</span>
                    </div>
                    <div className="toggle-btn active-glow">
                        <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                            <rect x="2" y="2" width="20" height="20" rx="8" fill="#152035"></rect>
                            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#3b82f6" fontFamily="sans-serif" fontWeight="900" fontSize="14">B</text>
                        </svg>
                    </div>
                    <div className="toggle-btn">
                        <span style={{ fontFamily: 'sans-serif', textDecoration: 'underline', fontSize: '16px' }}>U</span>
                    </div>
                </div>

                <div className="toggle-group">
                    <div className="toggle-btn">
                        <svg className="stroked" viewBox="0 0 24 24">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="15" y2="12"></line>
                            <line x1="3" y1="18" x2="19" y2="18"></line>
                        </svg>
                    </div>
                    <div className="toggle-btn active-glow">
                        <svg className="stroked" viewBox="0 0 24 24" style={{ stroke: '#3b82f6' }}>
                            <line x1="3" y1="6" x2="21" y2="6" stroke="#4b5563"></line>
                            <line x1="7" y1="12" x2="17" y2="12" stroke="#3b82f6" strokeWidth="3"></line>
                            <line x1="3" y1="18" x2="21" y2="18" stroke="#4b5563"></line>
                        </svg>
                    </div>
                    <div className="toggle-btn">
                        <svg className="stroked" viewBox="0 0 24 24">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="9" y1="12" x2="21" y2="12"></line>
                            <line x1="5" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </div>
                </div>
            </div>

            <div className="section-title">Extensions</div>

            <div className="extension-item">
                <div className="ext-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M4 4h4l4 6 4-6h4v16h-4v-8l-4 6-4-6v8H4z" />
                        <circle cx="18" cy="18" r="4" fill="#4ade80" stroke="#202126" strokeWidth="2" />
                    </svg>
                </div>
                <div className="ext-name">Motion Bro</div>
                <div className="badge-new">New</div>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>

            <div className="extension-item">
                <div className="ext-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12c0-3 2-5 5-5 2 0 3 2 3 2s1-2 3-2c3 0 5 2 5 5s-2 5-5 5c-2 0-3-2-3-2s-1 2-3 2c-3 0-5-2-5-5z" />
                    </svg>
                </div>
                <div className="ext-name">Motion Factory</div>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </>
    );

    const renderPlaceholderContent = (title: string, icon: React.ReactNode) => (
        <>
            <div className="panel-header">
                <div className="header-left">
                    <div className="icon-t-square" style={{ borderColor: '#4fa5fa' }}>{icon}</div>
                    <div className="panel-title">{title}</div>
                </div>
            </div>
            <div className="text-input-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No properties available
            </div>
        </>
    );

    return (
        <aside className="sidebar-panel-container">
            {activeTool === 'text' && renderTextContent()}
            {activeTool === 'audio' && renderPlaceholderContent('Audio', '♪')}
            {activeTool === 'media' && renderPlaceholderContent('Media', '□')}
            {activeTool === 'pen' && renderPlaceholderContent('Pen', '✎')}
        </aside>
    );
};

export default SidebarPanel;
