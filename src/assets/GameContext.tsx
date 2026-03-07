import React, { createContext, RefObject, useContext, useRef, useState } from "react";
import { Node, Troop } from "../components/configs";

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
    nodesRef: Node[];
    troopsRef: Troop[];
    dragSelectedRef: Node;
    dragCurrentRef: RefObject<{x: number; y: number}>;
    sendTroopsRef: RefObject<() => void>;
    handleDoubleTapRef: RefObject<(x: number, y: number) => void>;
    gameStateRef: RefObject<GameState>
}

const GameContext = createContext<GameContextProps | undefined>(undefined)

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')
    const [gameState, setGameState] = useState<GameState>('menu')
    const [isWon, setIsWon] = useState<boolean | null>(null)
    const [playCount, setPlayCount] = useState<number>(0)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const isDraggingRef = useRef<boolean>(false)
    const nodesRef = useRef<Node[]>([])
    const troopsRef = useRef<Troop[]>([])
    const dragSelectedRef = useRef<Node[]>([])
    const dragCurrentRef = useRef<{"x": number; "y": number}>({x: 0, y: 0})
    const sendTroopsRef = useRef<() => void>(null)
    const handleDoubleTapRef = useRef<(x: number, y: number) => void>(null)
    const gameStateRef = useRef<GameState>(gameState)

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
        }}>
            {children}
        </ GameContext.Provider >
    )
}

export const useGameContext = () => {
    const content = useContext(GameContext)
    if (!content) throw new Error ("use useGameContext inside provider")
    return content
}
