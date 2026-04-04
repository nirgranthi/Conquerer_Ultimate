import { useEffect, useRef } from "react";
import { PauseButton, GameTimer } from "./Buttons";
import { StartGame } from './scripts/engine';
import { playerId } from "../components/configs";
import { GameOverScreen } from "./GameOverScreen";
import { PauseMenuScreen } from "./PauseMenuScreen";

import Galaxy from "./Galaxy/Galaxy";
import { useGameContext } from "./GameContext";
import { PopulationBar } from "./PopulationBar";
import { StatsOverlay } from "./StatsOverlay";
import { useState } from "react";

export function GameScreen() {
    const {
        gameState,
        gameStateRef,
        setGameState,
        bgCanvasRef,
        canvasRef,
        setPlayCount,
        nodesRef,
        isDraggingRef,
        dragCurrentRef,
        dragSelectedRef,
        handleDoubleTapRef,
        sendTroops
    } = useGameContext();

    const [showStats, setShowStats] = useState(false);
    const showStatsRef = useRef(false);
    const wasPlayingBeforeStats = useRef(false);

    const lastTapTimeRef = useRef(0);

    function handleSpaceKey() {
        if (gameStateRef.current === 'playing') { setGameState('paused'); }
        else if (gameStateRef.current === 'paused') { setGameState('playing'); }
        else if (gameStateRef.current === 'gameover') {
            setGameState('playing');
            setPlayCount(prev => prev + 1);
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.repeat) return;
        if (['Space', 'Backspace', 'Delete', 'Escape', 'KeyS'].includes(e.code)) e.preventDefault();

        if (e.code === 'Space' || e.code === 'Escape') {
            if (showStatsRef.current) {
                showStatsRef.current = false;
                setShowStats(false);
                if (wasPlayingBeforeStats.current) setGameState('playing');
            }
            else { handleSpaceKey(); }
        }

        if (e.code === 'KeyS') {
            const newShowStats = !showStatsRef.current;
            showStatsRef.current = newShowStats;
            if (newShowStats) {
                wasPlayingBeforeStats.current = gameStateRef.current === 'playing';
                setGameState('paused');
            } else if (wasPlayingBeforeStats.current) {
                setGameState('playing');
            }
            setShowStats(newShowStats);
        }
    }

    function handleMouseDown(x: number, y: number) {
        if (gameStateRef.current !== 'playing') return;
        const selectedNode = nodesRef.current.find((node: any) => ((node.x - x) ** 2 + (node.y - y) ** 2) < (node.radius * 1.2) ** 2 && node.owner === playerId);
        if (selectedNode) {
            isDraggingRef.current = true;
            dragSelectedRef.current = [selectedNode];
            dragCurrentRef.current = { x, y };
        }
    }

    function handleTouchStart(e: TouchEvent) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastTapTimeRef.current;
        if (timeDiff < 300 && timeDiff > 0) {
            handleDoubleTapRef.current(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        } else {
            handleMouseDown(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
        lastTapTimeRef.current = currentTime;
    }

    function handleMouseMove(x: number, y: number) {
        if (isDraggingRef.current) {
            dragCurrentRef.current = { x, y };
            nodesRef.current.forEach((node: any) => {
                if (((node.x - x) ** 2 + (node.y - y) ** 2) < (node.radius * 1.5) ** 2 && node.owner === playerId) {
                    if (!dragSelectedRef.current.includes(node)) { dragSelectedRef.current.push(node); }
                }
            });
        }
    }

    function handleMouseUp(x: number, y: number) {
        if (isDraggingRef.current && dragSelectedRef.current.length > 0) {
            let target = nodesRef.current.find((node: any) => ((node.x - x) ** 2 + (node.y - y) ** 2) < (node.radius * 1.2) ** 2);
            if (target) {
                dragSelectedRef.current.forEach((selectedNode) => {
                    if (selectedNode !== target) {
                        sendTroops(selectedNode, target, 0.5);
                    }
                });
            }
            isDraggingRef.current = false;
            dragSelectedRef.current = [];
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onMouseDown = (e: MouseEvent) => handleMouseDown(e.clientX, e.clientY);
        const onMouseMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
            handleMouseMove(clientX, clientY);
        };
        const onMouseUp = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
            handleMouseUp(clientX, clientY);
        };
        const onDoubleClick = (e: MouseEvent) => handleDoubleTapRef.current(e.clientX, e.clientY);

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('dblclick', onDoubleClick);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', onMouseMove);
        canvas.addEventListener('touchend', onMouseUp);
        window.addEventListener('keydown', handleKeydown);

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('dblclick', onDoubleClick);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', onMouseMove);
            canvas.removeEventListener('touchend', onMouseUp);
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    return (
        <>
            <div className="absolute w-full h-full z-0">
                <Galaxy
                    density={1}
                    saturation={1}
                />
            </div>

            <canvas ref={bgCanvasRef} className="absolute top-0 left-0 z-5" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 z-10" />

            <StartGame />

            <PopulationBar />

            <div className="relative top-0 left-0 z-20">
                {gameState !== 'paused' ? (
                    <>
                        <PauseButton />
                        <GameTimer />
                    </>
                ) : (
                    <PauseMenuScreen
                        onShowStats={() => {
                            wasPlayingBeforeStats.current = false;
                            showStatsRef.current = true;
                            setShowStats(true);
                        }}
                    />
                )}
            </div>

            {showStats && (
                <StatsOverlay
                    onClose={() => {
                        showStatsRef.current = false;
                        setShowStats(false);
                        if (wasPlayingBeforeStats.current) setGameState('playing');
                    }}
                />
            )}

            <div className="z-30">
                {gameState === 'gameover' && (<GameOverScreen />)}
            </div>
        </>
    );
}