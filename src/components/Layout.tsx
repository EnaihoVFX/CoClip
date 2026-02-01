import React from 'react';
import { useAgents } from '../hooks/useAgents';
import '../index.css';
import './Sidebar.css';

const Layout: React.FC<{ children: React.ReactNode; header?: React.ReactNode }> = ({ children, header }) => {
    const { agents } = useAgents();

    return (
        <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-color)' }}>
            {header}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside className="sidebar-container" style={{ margin: '12px', marginTop: '12px', marginBottom: '12px', height: 'auto' }}>

                    <div className="sidebar-header">
                        <span className="header-title">Collaborative Studio</span>
                        <div className="header-icon">
                            <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                        </div>
                    </div>

                    <div className="agent-feed">
                        {agents.map(agent => {
                            let bubbleClass = 'bubble-editor'; // Default (Grey)
                            let iconPath = "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"; // Default User

                            if (agent.name === 'Director') {
                                bubbleClass = 'bubble-director';
                                iconPath = "M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z";
                            } else if (agent.name === 'Producer') {
                                bubbleClass = 'bubble-producer';
                                iconPath = "M7 2v11h3v9l7-12h-4l4-8z";
                            } else if (agent.name === 'Editor') {
                                bubbleClass = 'bubble-editor';
                                iconPath = "M17.66 5.41l.92.92c.78.78.78 2.05 0 2.83l-8.49 8.49c-.2.2-.47.33-.75.38L4.9 18.9c-.65.13-1.25-.48-1.12-1.13l.86-4.44c.05-.28.18-.54.38-.75L13.51 4.1c.78-.78 2.05-.78 2.83 0l.92.92.01.01.39.38zM6.9 13.92l-1.07 1.07.45-2.34 2.34-.45-1.07 1.07-1.07 1.07.42-.42z";
                            } else if (agent.name === 'Sound Engineer') {
                                bubbleClass = 'bubble-editor';
                                iconPath = "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z";
                            }

                            return (
                                <div key={agent.name} className={`agent-bubble ${bubbleClass}`}>
                                    <div className="avatar-container">
                                        <div className="avatar">
                                            <svg viewBox="0 0 24 24"><path d={iconPath} /></svg>
                                        </div>
                                        <div className="status-dot"><div className="dot-inner"></div></div>
                                    </div>
                                    <div className="bubble-content">
                                        <div className="agent-name">{agent.name}</div>
                                        <div className="agent-activity">{agent.activity || agent.status}</div>
                                        {agent.status === 'Working' && agent.name === 'Producer' && (
                                            <div className="progress-track">
                                                <div className="progress-fill"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="sidebar-footer">
                        <div className="user-widget">
                            <div className="user-avatar">
                                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                            <span className="user-text">Director Paul (Supervisor)</span>
                        </div>
                    </div>

                </aside>

                <main style={{ flex: 1, padding: '12px', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
