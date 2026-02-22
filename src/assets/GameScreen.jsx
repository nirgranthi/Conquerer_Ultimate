import { useState, useEffect, useRef } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen.jsx";
import { PauseMenuScreen } from "./PauseMenuScreen.jsx";
import { StartGame } from './scripts/startGame.jsx'
import { playerId } from "../components/configs.js";
import Galaxy from "./Galaxy/Galaxy.jsx";

export function GameScreen({ canvasRef, difficulty, gameState, setGameState }) {
    const isDraggingRef = useRef(false)
    const nodesRef = useRef([])
    const troopsRef = useRef([])
    const dragSelectedRef = useRef([])
    const dragCurrentRef = useRef({ x: 0, y: 0 })
    const sendTroopsRef = useRef(null)
    const handleDoubleTapRef = useRef(null)
    const [isWon, setIsWon] = useState(null)
    const [playCount, setPlayCount] = useState(0)
    const gameStateRef = useRef(gameState)
    let lastTapTime = 0

    function handleSpaceKey() {
        if (gameStateRef.current === 'playing') { setGameState('paused') }
        else if (gameStateRef.current === 'paused') { setGameState('playing') }
        else if (gameStateRef.current === 'gameover') {
            setGameState('playing')
            setPlayCount(prev => prev + 1)
        }
    }

    function handleKeydown(e) {
        if (e.repeat) return
        if (['Space', 'Backspace', 'Delete', 'Escape'].includes(e.code)) e.preventDefault()
        if (e.code === 'Space') { handleSpaceKey() }
        else if (e.code === 'Escape') { handleSpaceKey() }
    }

    function handleMouseDown(x, y) {
        if (gameState !== 'playing') return;
        const selectedNode = nodesRef.current.find((node) => Math.hypot(node.x - x, node.y - y) < node.radius * 1.2 && node.owner === playerId)
        if (selectedNode) {
            isDraggingRef.current = true
            dragSelectedRef.current = [selectedNode]
            dragCurrentRef.current = { x, y }
        }
    }

    function handleTouchStart(e) {
        const currentTime = new Date().getTime()
        const timeDiff = currentTime - lastTapTime
        if (timeDiff < 300 && timeDiff > 0) { handleDoubleTapRef.current(e.changedTouches[0].clientX, e.changedTouches[0].clientY) }
        else handleMouseDown(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        lastTapTime = currentTime /* idk this error will cause any problems */
    }

    function handleMouseMove(x, y) {
        if (isDraggingRef.current) {
            dragCurrentRef.current = { x, y }
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

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        const stopGame = StartGame({ canvas, difficulty, ctx, gameStateRef, setGameState, isDraggingRef, nodesRef, sendTroopsRef, troopsRef, dragSelectedRef, dragCurrentRef, setIsWon, handleDoubleTapRef })

        canvas.addEventListener('mousedown', e => handleMouseDown(e.clientX, e.clientY))
        canvas.addEventListener('mousemove', e => handleMouseMove(e.clientX, e.clientY))
        canvas.addEventListener('mouseup', e => handleMouseUp(e.clientX, e.clientY))
        canvas.addEventListener('dblclick', e => handleDoubleTapRef.current(e.clientX, e.clientY))

        canvas.addEventListener('touchstart', handleTouchStart)
        canvas.addEventListener('touchmove', e => handleMouseMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY))
        canvas.addEventListener('touchend', e => handleMouseUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY))

        window.addEventListener('keydown', handleKeydown)

        return () => {
            stopGame()
            canvas.removeEventListener('mousedown', e => handleMouseDown(e.clientX, e.clientY))
            canvas.removeEventListener('mousemove', e => handleMouseMove(e.clientX, e.clientY))
            canvas.removeEventListener('mouseup', e => handleMouseUp(e.clientX, e.clientY))
            canvas.removeEventListener('dblclick', e => handleDoubleTapRef.current(e.clientX, e.clientY))

            canvas.removeEventListener('touchstart', handleTouchStart)
            canvas.removeEventListener('touchmove', e => handleMouseMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY))
            canvas.removeEventListener('touchend', e => handleMouseUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY))

            window.removeEventListener('keydown', handleKeydown)
        }
    }, [canvasRef, difficulty, playCount])

    useEffect(() => {
        gameStateRef.current = gameState
    }, [gameState])

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
                    {gameState !== 'paused'
                        ? <PauseButton setGameState={setGameState} />
                        : <PauseMenuScreen setGameState={setGameState} setPlayCount={setPlayCount} />
                    }
                </div>

                <div className="z-30">
                    {gameState === 'gameover'
                        ? <GameOverScreen isWon={isWon} setGameState={setGameState} setPlayCount={setPlayCount} />
                        : ''
                    }
                </div>
            </div>
        </>
    )
}