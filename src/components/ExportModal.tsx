import React from 'react';
import './ExportModal.css';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>

            <div className="export-modal" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <div className="modal-title">Export Settings</div>
                    <div className="close-btn" onClick={onClose}>
                        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                    </div>
                </div>

                <div className="modal-body">

                    <div className="preview-panel">
                        <div className="video-container">
                            <div className="center-play-btn">
                                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </div>
                        <div className="preview-meta">
                            <h3>Final_Landscape_Cut_v2.mp4</h3>
                            <p>1920 x 1080 • 24fps • H.264</p>
                        </div>
                    </div>

                    <div className="settings-panel">

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input type="text" className="form-input" defaultValue="Final_Landscape_Cut_v2" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" className="form-input" value="/Users/Creative/CoClip/Exports" readOnly style={{ color: '#666', cursor: 'default' }} />
                                <button style={{ width: '40px', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Format</label>
                            <div className="format-group">
                                <div className="format-option active">MP4</div>
                                <div className="format-option">MOV</div>
                                <div className="format-option">GIF</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Resolution</label>
                            <select className="form-select" defaultValue="1080p (Full HD)">
                                <option>720p (HD)</option>
                                <option>1080p (Full HD)</option>
                                <option>1440p (2K)</option>
                                <option>2160p (4K)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Codec</label>
                            <select className="form-select" defaultValue="H.264 (Recommended)">
                                <option>H.264 (Recommended)</option>
                                <option>H.265 (HEVC)</option>
                                <option>ProRes 422</option>
                            </select>
                        </div>

                    </div>
                </div>

                <div className="modal-footer">
                    <div className="stats-group">
                        <div className="stats-main">Est. Size: 142.5 MB</div>
                        <div className="stats-sub">Disk Space: 450 GB available</div>
                    </div>
                    <div className="action-group">
                        <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
                        <button className="btn btn-export">Export Video</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExportModal;
