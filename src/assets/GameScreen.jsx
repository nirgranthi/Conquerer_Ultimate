import { useState, useEffect } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen.jsx";
import { PauseMenuScreen } from "./PauseMenuScreen.jsx";
import { StartGame } from './scripts/startGame.jsx'

export function GameScreen({ canvasRef, difficulty }) {
    const [isPaused, setIsPaused] = useState(false)
    const [nodes, setNodes] = useState([])

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const node = StartGame({canvas, difficulty})
        setNodes(node)
    }, [canvasRef, difficulty])

    useEffect(() => {
        console.log(nodes)
    }, [nodes])

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