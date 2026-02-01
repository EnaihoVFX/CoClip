import React, { useRef, useState, useEffect } from 'react';
import DirectEditOverlay from './DirectEditOverlay';
import { Player, type PlayerRef } from '@remotion/player';
import { MainComposition } from '../remotion/Composition';
import { useProject } from '../ProjectStore';
import OptimisticTimeCode from './OptimisticTimeCode';
import './SmartPreview.css';

const SmartPreview: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerRef = useRef<PlayerRef>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isAnnotationMode, setIsAnnotationMode] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const { project, currentTime, setCurrentTime, isPlaying, setIsPlaying } = useProject();

    const handleFrameUpdate = React.useCallback((e: { frame: number }) => {
        const newTime = e.frame / project.fps;
        setCurrentTime(newTime);
    }, [project.fps, setCurrentTime]);

    // Sync Player to currentTime when it changes externally (e.g. Timeline click)
    useEffect(() => {
        if (!playerRef.current) return;

        const currentFrame = playerRef.current.getCurrentFrame();
        const targetFrame = Math.round(currentTime * project.fps);

        // Only seek if significantly different to avoid fighting the player's own loop
        if (Math.abs(currentFrame - targetFrame) > 1) {
            playerRef.current.seekTo(targetFrame);
        }
    }, [currentTime, project.fps]);

    // Cleanup: pause if we unmount
    useEffect(() => {
        return () => {
            // Optional cleanup
        };
    }, []);

    // Toggle Play/Pause
    const togglePlayback = () => {
        if (playerRef.current) {
            if (playerRef.current.isPlaying()) {
                playerRef.current.pause();
                setIsPlaying(false);
            } else {
                playerRef.current.play();
                setIsPlaying(true);
            }
        }
    };


    const getCanvasCoordinates = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        if (!isAnnotationMode) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            // We do NOT clear rect here anymore so we can draw multiple strokes if needed,
            // or we might want to clear it if it's a "single gesture" annotation.
            // For now, let's clear it to keep it simple as per previous logic
            // (or maybe we keep it to allow complex shapes? Let's stick to clearing for a fresh start for now logic)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            const { x, y } = getCanvasCoordinates(e);
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !isAnnotationMode) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { x, y } = getCanvasCoordinates(e);
            ctx.lineTo(x, y);
            // Use the gradient color or a bright color for visibility
            ctx.strokeStyle = '#5856D6';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    };

    const endDrawing = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setIsAnnotationMode(false);

        // Capture position for the overlay
        // We use client coordinates relative to the viewport or handle it inside the overlay 
        // But the previous logic used nativeEvent.offsetX. 
        // Let's rely on the mouse event to position the overlay locally within the video stage if possible,
        // or just pass a relative position.

        // However, DirectEditOverlay usually expects coordinates. 
        // Let's use the click position relative to the nearest positioned ancestor (video-stage).
        // The event target might be the canvas.

        setCursorPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
        setShowPrompt(true);
    };

    const toggleAnnotationMode = () => {
        setIsAnnotationMode(!isAnnotationMode);
        setShowPrompt(false);
        // Clear canvas when toggling
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleApplyEdit = (text: string) => {
        console.log("Applied edit:", text);
        // Sync logic would go here
        setShowPrompt(false);
    };

    return (
        <div className="playback-container" style={{ flex: 1.2 }}>

            <div className="playback-header">
                <div className="header-left">
                    Playback
                    <svg className="sp-icon-sm" viewBox="0 0 24 24" style={{ marginLeft: '6px' }}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
                </div>

                <div className="header-right">
                    <button className="tool-btn" title="Edit">
                        <svg className="sp-icon" viewBox="0 0 24 24">
                            <path d="M17.66 5.41l.92.92c.78.78.78 2.05 0 2.83l-8.49 8.49c-.2.2-.47.33-.75.38L4.9 18.9c-.65.13-1.25-.48-1.12-1.13l.86-4.44c.05-.28.18-.54.38-.75L13.51 4.1c.78-.78 2.05-.78 2.83 0l.92.92.01.01.39.38zM6.9 13.92l-1.07 1.07.45-2.34 2.34-.45-1.07 1.07-1.07 1.07.42-.42z" />
                        </svg>
                    </button>

                    <button className="tool-btn" title="Cut">
                        <svg className="sp-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="m11 4-.5-1-.5 1-1 .125.834.708L9.5 6l1-.666 1 .666-.334-1.167.834-.708zm8.334 10.666L18.5 13l-.834 1.666-1.666.209 1.389 1.181L16.834 18l1.666-1.111L20.166 18l-.555-1.944L21 14.875zM6.667 6.333 6 5l-.667 1.333L4 6.5l1.111.944L4.667 9 6 8.111 7.333 9l-.444-1.556L8 6.5zM3.414 17c0 .534.208 1.036.586 1.414L5.586 20c.378.378.88.586 1.414.586s1.036-.208 1.414-.586L20 8.414c.378-.378.586-.88.586-1.414S20.378 5.964 20 5.586L18.414 4c-.756-.756-2.072-.756-2.828 0L4 15.586c-.378.378-.586.88-.586 1.414zM17 5.414 18.586 7 15 10.586 13.414 9 17 5.414z" />
                        </svg>
                    </button>

                    <button
                        className={`tool-btn ${isAnnotationMode ? 'active' : ''}`}
                        onClick={toggleAnnotationMode}
                        title="Annotate"
                    >
                        <svg className="sp-icon" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                            <defs>
                                <linearGradient id="pro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#FF3B30', stopOpacity: 1 }} />
                                    <stop offset="50%" style={{ stopColor: '#FF9500', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#5856D6', stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                            <circle cx="12" cy="12" r="7" stroke="url(#pro-gradient)" strokeWidth="4.5" fill="none" />
                            <circle cx="12" cy="12" r="2.5" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="video-stage">
                <div className="video-content">
                    <Player
                        ref={playerRef}
                        component={MainComposition}
                        durationInFrames={Math.ceil(project.duration * project.fps)}
                        compositionWidth={project.width}
                        compositionHeight={project.height}
                        fps={project.fps}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#000'
                        }}
                        controls={false} // We provide custom controls
                        clickToPlay={false} // handled by our logic
                        inputProps={{
                            // Pass current project state to Remotion composition
                            tracks: project.tracks,
                            assets: project.assets,
                            scenes: project.scenes
                        }}
                        onFrameUpdate={(e) => {
                            // Sync global time state with player's current frame
                            const newTime = e.detail.frame / project.fps;

                            // We don't want to trigger a seek back loop
                            // The useEffect checks for diff > 1 frame, so fine-grained updates here are safe
                            if (isPlaying) {
                                setCurrentTime(newTime);
                            }
                        }}
                    />

                    {/* Invisible overlay for click-to-play if needed, or rely on controls */}

                    {/* The Canvas for drawing overlays */}
                    <canvas
                        className="video-canvas"
                        ref={canvasRef}
                        width={1280}
                        height={720}
                        style={{
                            pointerEvents: isAnnotationMode ? 'auto' : 'none',
                            cursor: isAnnotationMode ? 'crosshair' : 'default'
                        }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                    />

                    {/* Render the Overlay inside the video stage so it's positioned correctly */}
                    {showPrompt && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 50, pointerEvents: 'none' }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <DirectEditOverlay
                                    position={cursorPos}
                                    onClose={() => setShowPrompt(false)}
                                    onApply={handleApplyEdit}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="playback-footer">
                <OptimisticTimeCode />

                <div className="controls-center">
                    <svg className="sp-icon control-icon" viewBox="0 0 24 24" onClick={() => {
                        // Skip back 5 seconds
                        setCurrentTime(Math.max(0, currentTime - 5));
                    }}><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>

                    <svg className="sp-icon control-icon" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }} onClick={togglePlayback}>
                        {isPlaying ?
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> :
                            <path d="M8 5v14l11-7z" />
                        }
                    </svg>

                    <svg className="sp-icon control-icon" viewBox="0 0 24 24" onClick={() => {
                        // Skip forward 5 seconds
                        setCurrentTime(Math.min(project.duration, currentTime + 5));
                    }}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </div>

                <div className="fullscreen-btn">
                    <svg className="sp-icon control-icon" viewBox="0 0 24 24" style={{ fill: '#888', width: '14px', height: '14px' }}><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                </div>
            </div>

        </div>
    );
};

export default SmartPreview;
