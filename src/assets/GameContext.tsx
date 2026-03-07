import React, { createContext, RefObject, useRef, useState } from "react";
import { Node } from "../components/configs";

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameContextProps {
    difficulty: Difficulty;
    setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    isWon: boolean | null;
    setIsWon: React.Dispatch<React.SetStateAction<boolean | null>>;
    playCount: number;
    setPlayCount: React.Dispatch<React.SetStateAction<number>>
    canvasRef: HTMLCanvasElement | null;
    isDraggingRef: RefObject<boolean>;
    nodesRef: Node[]
}

const GameContext = createContext<GameContextProps | undefined>(undefined)

const gameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')
    const [gameState, setGameState] = useState<GameState>('menu')
    const [isWon, setIsWon] = useState<boolean | null>(null)
    const [playCount, setPlayCount] = useState<number>(0)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const isDraggingRef = useRef<boolean>(false)
    const nodesRef = useRef<Node[]>([])
    const troopsRef = useRef([])
    const dragSelectedRef = useRef([])
    const dragCurrentRef = useRef({ x: 0, y: 0 })
    const sendTroopsRef = useRef(null)
    const handleDoubleTapRef = useRef(null)
    const gameStateRef = useRef(gameState)

    return (
        <GameContext.Provider value={{
            difficulty,
            setDifficulty,
            gameState,
            setGameState,
            isWon,
            setIsWon,
            playCount,
            setPlayCount,
            canvasRef,
            isDraggingRef,
            nodesRef,
            troopsRef,
            dragSelectedRef,
            dragCurrentRef,
            sendTroopsRef,
            handleDoubleTapRef,
            gameStateRef
        }} />
        {children}
        < GameContext.Provider/>
    )
}