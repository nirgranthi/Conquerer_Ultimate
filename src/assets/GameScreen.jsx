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
        const ctx = canvas.getContext('2d')
        const newNodes = StartGame({canvas, difficulty, ctx})
        setNodes(newNodes)

        let animationFrameId;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#111827'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            newNodes.forEach((node) => {
                node.draw()
            })

            animationFrameId = requestAnimationFrame(render)
        }
        render()
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