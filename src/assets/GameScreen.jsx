import { useState, useEffect, useRef } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen.jsx";
import { PauseMenuScreen } from "./PauseMenuScreen.jsx";
import { StartGame } from './scripts/startGame.jsx'
import { playerId } from "../components/configs.js";

export function GameScreen({ canvasRef, difficulty, gameState }) {
    const [isPaused, setIsPaused] = useState(false)
    const isDraggingRef = useRef(false)
    const nodesRef = useRef([])
    const dragSelectedRef = useRef([])
    const dragCurrentRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        StartGame({ canvas, difficulty, ctx, gameState, isDraggingRef, nodesRef })

        function handleMouseDown(x, y) {
            if (gameState !== 'playing') return;
            nodesRef.current.forEach((node) => {
                if (Math.hypot(node.x - x, node.y - y) < node.radius * 1.2 && node.owner === playerId) {
                    isDraggingRef.current = true
                    dragSelectedRef.current = [node]
                    dragCurrentRef.current = {x, y}
                    return
                }
            })
        }

        function handleMouseUp(x, y) {
            if (gameState !== 'playing') return;
            isDraggingRef.current = false
            console.log('end', x, y)
        }

        canvas.addEventListener('mousedown', e => handleMouseDown(e.clientX, e.clientY))
        canvas.addEventListener('mouseup', e => handleMouseUp(e.clientX, e.clientY))

        return () => {
            canvas.removeEventListener('mousedown', e => handleMouseDown(e.clientX, e.clientY))
            canvas.removeEventListener('mouseup', e => handleMouseUp(e.clientX, e.clientY))
        }
    }, [canvasRef, difficulty, gameState])

    return (
        <>
            <canvas ref={canvasRef} />
            <div style={{ position: 'absolute', top: 0, left: 0 }} >
                {!isPaused
                    ? <PauseButton setIsPaused={setIsPaused} />
                    : <PauseMenuScreen setIsPaused={setIsPaused} />
                }
            </div>


            {/* GAME OVER SCREEN */}
            <GameOverScreen />
        </>
    )
}