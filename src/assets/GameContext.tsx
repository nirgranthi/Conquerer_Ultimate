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
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isDragging: boolean;
    nodes: Node[];
    troopsRef: RefObject<Troop[]>;
    dragSelected: Node[];
    dragCurrentRef: RefObject<{x: number; y: number}>;
    handleDoubleTapRef: RefObject<(x: number, y: number) => void>;
    sendTroops: (selectedNode: Node, target: Node, percent: number ) => void
}

const GameContext = createContext<GameContextProps | undefined>(undefined)

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')
    const [gameState, setGameState] = useState<GameState>('menu')
    const [isWon, setIsWon] = useState<boolean | null>(null)
    const [playCount, setPlayCount] = useState<number>(0)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    let isDragging: boolean = false
    const nodes: Node[] = []
    const troopsRef = useRef<Troop[]>([])
    let dragSelected: Node[] = []
    const dragCurrentRef = useRef<{"x": number, "y": number}>({x: 0, y: 0})
    const handleDoubleTapRef = useRef<(x: number, y: number) => void>(null)

    const sendTroops = (selectedNode: Node, target: Node, percent: number) => {
        if (selectedNode.population < 2) return;
        let noOfTroopsToSend = Math.floor(selectedNode.population * percent)
        selectedNode.population -= noOfTroopsToSend
        for (let i = 0; i < noOfTroopsToSend; i++) {
            setTimeout(() => {
                if (gameState === 'playing') {
                    troopsRef.current.push(new Troop(selectedNode.owner, selectedNode, target))
                }
            }, i * 30
            )
        }
    }

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
            isDragging,
            nodes,
            troopsRef,
            dragSelected,
            dragCurrentRef,
            handleDoubleTapRef,
            sendTroops
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
