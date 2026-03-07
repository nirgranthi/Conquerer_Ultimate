import React, { useState, useEffect, useRef, RefObject } from "react";
import { PauseButton } from "./Buttons";
import { GameOverScreen } from "./GameOverScreen.tsx";
import { PauseMenuScreen } from "./PauseMenuScreen.tsx";
import { StartGame } from './scripts/startGame.tsx'
import { playerId } from "../components/configs.ts";
import Galaxy from "./Galaxy/Galaxy.tsx";
import { useGameContext } from "./GameContext.tsx";

export function GameScreen({ canvasRef, difficulty, gameState, setGameState }: { canvasRef: HTMLCanvasElement | null; difficulty: Difficulty; gameState: GameState; setGameState: React.Dispatch<React.SetStateAction<GameState>>; }) {
    const { playCount, setPlayCount, nodesRef, gameStateRef, isDraggingRef, dragCurrentRef, dragSelectedRef, handleDoubleTapRef, isWon, troopsRef, setIsWon, sendTroops } = useGameContext()
    
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
        const selectedNode = nodesRef.current.find((node) => ((node.x - x)**2 + (node.y - y)**2) < (node.radius * 1.2)**2 && node.owner === playerId)
        if (selectedNode) {
            isDraggingRef.current = true
            dragSelectedRef.current = [selectedNode]
            console.log(selectedNode)
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
            /* console.log(dragCurrentRef.current) */
            nodesRef.current.forEach(node => {
                if (((node.x - x)**2 + (node.y - y)**2) < (node.radius * 1.5)**2 && node.owner === playerId) {
                    if (!dragSelectedRef.current.includes(node)) { dragSelectedRef.current.push(node) }
                }
            })
        }
    }

    /* target is from where the troop wiil be sent */
    function handleMouseUp(x, y) {
        if (isDraggingRef.current && dragSelectedRef.current.length > 0) {
            let target = nodesRef.current.find(node => ((node.x - x)**2+ (node.y - y)**2) < (node.radius * 1.2)**2)
            if (target) {
                dragSelectedRef.current.forEach((selectedNode) => {
                    if (selectedNode !== target) {
                        sendTroops(selectedNode, target, 0.5)
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
        const stopGame = StartGame({ canvas, difficulty, ctx, gameStateRef, setGameState, isDraggingRef, nodesRef, troopsRef, dragSelectedRef, dragCurrentRef, setIsWon, handleDoubleTapRef })

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
                        mouseRepulsion={false}
                        mouseInteraction={false}
                        density={1}
                        glowIntensity={0.7}
                        saturation={1}
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