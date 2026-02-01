import React from 'react';
import './Header.css';

interface HeaderProps {
    title?: string;
    lastEdited?: string;
    onExport?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title = "New Masterpiece",
    lastEdited = "Edited 2m ago",
    onExport
}) => {
    return (
        <header className="app-header">

            <div className="header-left">

                <div className="app-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                        <rect width="100" height="100" rx="20" ry="20" fill="#1a1a1a" />
                        <g fill="none" stroke="white" strokeLinecap="square">
                            <path d="M 10 80 A 40 40 0 0 1 90 80" strokeWidth="10" />
                            <path d="M 25 80 A 25 25 0 0 1 75 80" strokeWidth="6" />
                            <path d="M 40 80 A 10 10 0 0 1 60 80" strokeWidth="4" />
                        </g>
                    </svg>
                </div>

                <div className="vertical-divider"></div>

                <div className="project-info">
                    <div className="project-title">{title}</div>
                    <div className="project-status">
                        <span className="status-dot"></span> Saved
                        <span style={{ margin: '0 4px', color: '#333' }}>•</span>
                        {lastEdited}
                    </div>
                </div>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    <span>Search assets, commands...</span>
                    <span className="kbd-shortcut">⌘K</span>
                </div>
            </div>

            <div className="header-right">

                <div className="collaborators">
                    <div className="avatar" style={{ background: '#e91e63', zIndex: 3 }}></div>
                    <div className="avatar" style={{ background: '#00bcd4', zIndex: 2 }}></div>
                    <div className="avatar" style={{ background: '#8bc34a', zIndex: 1 }}></div>
                    <div className="avatar add-new">+</div>
                </div>

                <div className="icon-action">
                    <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" /></svg>
                </div>

                <button className="export-btn" onClick={onExport}>
                    Export Video
                    <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                </button>

                <div className="profile-menu">
                    <div className="profile-avatar">JP</div>
                </div>

            </div>

        </header>
    );
};

export default Header;
