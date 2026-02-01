import React from 'react';

const Toolbar: React.FC = () => {
    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <div className="timeline-label">
                    Timeline
                    <svg className="icon-sm" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                </div>

                <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                    Multicom
                </button>
                <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                    Volume
                </button>
                <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" transform="scale(0.8) translate(3,3)" /></svg>
                    Animation
                </button>
            </div>

            <div className="toolbar-right">
                <button className="btn btn-icon-only">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2zm-7 0v7h4V4h-4z" /></svg>
                </button>
                <button className="btn">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
