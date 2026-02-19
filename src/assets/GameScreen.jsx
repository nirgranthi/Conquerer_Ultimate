import { useState, useEffect } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen.jsx";
import { PauseMenuScreen } from "./PauseMenuScreen.jsx";
import { StartGame } from './scripts/startGame.jsx'

export function GameScreen({ canvasRef, difficulty, gameState }) {
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        StartGame({canvas, difficulty, ctx, gameState})
    }, [canvasRef, difficulty])

    return (
        <>
            <canvas ref={canvasRef} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} >
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