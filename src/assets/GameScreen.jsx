import { useState, useEffect, useRef } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen.jsx";
import { PauseMenuScreen } from "./PauseMenuScreen.jsx";
import { StartGame } from './scripts/startGame.jsx'
import { playerId } from "../components/configs.js";
import Galaxy from "./Galaxy/Galaxy.jsx";

export function GameScreen({ canvasRef, difficulty, gameState }) {
    const [isPaused, setIsPaused] = useState(false)
    const isDraggingRef = useRef(false)
    const nodesRef = useRef([])
    const troopsRef = useRef([])
    const dragSelectedRef = useRef([])
    const dragCurrentRef = useRef({ x: 0, y: 0 })
    const sendTroopsRef = useRef(null)
    const isWonRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        console.log(ctx)
        StartGame({ canvas, difficulty, ctx, gameState, isDraggingRef, nodesRef, sendTroopsRef, troopsRef, dragSelectedRef, dragCurrentRef, isWonRef })

        function handleMouseDown(x, y) {
            if (gameState !== 'playing') return;
            const selectedNode = nodesRef.current.find((node) => Math.hypot(node.x - x, node.y - y) < node.radius * 1.2 && node.owner === playerId)
            if (selectedNode) {
                isDraggingRef.current = true
                dragSelectedRef.current = [selectedNode]
                dragCurrentRef.current = { x, y }
            }
        }
        function handleMouseMove(x, y) {
            if (isDraggingRef.current) {
                dragCurrentRef.current = { x, y }
                console.log('commencing drag...')
                nodesRef.current.forEach(node => {
                    if (Math.hypot(node.x - x, node.y - y) < node.radius * 1.5 && node.owner === playerId) {
                        if (!dragSelectedRef.current.includes(node)) { dragSelectedRef.current.push(node) }
                    }
                })
            }
        }
        /* target is from where the troop wiil be sent */
        function handleMouseUp(x, y) {
            if (isDraggingRef.current && dragSelectedRef.current.length > 0) {
                let target = nodesRef.current.find(node => Math.hypot(node.x - x, node.y - y) < node.radius * 1.2)
                if (target) {
                    dragSelectedRef.current.forEach((selectedNode) => {
                        if (selectedNode !== target) {
                            sendTroopsRef.current(selectedNode, target, 0.5)
                        }
                    })
                }
                isDraggingRef.current = false
                dragSelectedRef.current = []
            }
        }

        canvas.addEventListener('mousedown', e => handleMouseDown(e.clientX, e.clientY))
        canvas.addEventListener('mousemove', e => handleMouseMove(e.clientX, e.clientY))
        canvas.addEventListener('mouseup', e => handleMouseUp(e.clientX, e.clientY))

        return () => {
            canvas.removeEventListener('mousedown', e => handleMouseDown(e.clientX, e.clientY))
            canvas.removeEventListener('mousemove', e => handleMouseMove(e.clientX, e.clientY))
            canvas.removeEventListener('mouseup', e => handleMouseUp(e.clientX, e.clientY))
        }
    }, [canvasRef, difficulty, gameState])

    return (
        <>
            <div>
                <div className="absolute w-full h-full z-0" >
                    <Galaxy
                        mouseRepulsion
                        mouseInteraction={false}
                        density={1}
                        glowIntensity={0.2}
                        saturation={0}
                        hueShift={140}
                        twinkleIntensity={0.3}
                        rotationSpeed={0.1}
                        repulsionStrength={2}
                        autoCenterRepulsion={0}
                        starSpeed={0.5}
                        speed={1}
                    />
                </div>

                <canvas ref={canvasRef} className="absolute top-0 left-0 z-10" />

                <div className="relative top-0 left-0 z-20" >
                    {!isPaused
                        ? <PauseButton setIsPaused={setIsPaused} />
                        : <PauseMenuScreen setIsPaused={setIsPaused} />
                    }
                </div>


                {/* GAME OVER SCREEN */}
                <div className="z-30">
                    <GameOverScreen />
                </div>
            </div>
        </>
    )
}