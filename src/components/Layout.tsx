import React, { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import '../index.css';
import './Sidebar.css';
import ToolSidebar from './ToolSidebar';
import type { ToolId } from './ToolSidebar';
import SidebarPanel from './SidebarPanel';

const Layout: React.FC<{ children: React.ReactNode; header?: React.ReactNode }> = ({ children, header }) => {
    const { agents } = useAgents();
    const [activeTool, setActiveTool] = useState<ToolId>('text');

    return (
        <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-color)' }}>
            {header}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <ToolSidebar activeTool={activeTool} onToolChange={setActiveTool} />
                <SidebarPanel activeTool={activeTool} />

                <main style={{ flex: 1, padding: '12px', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
