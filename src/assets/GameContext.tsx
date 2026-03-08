import React, { createContext, RefObject, useContext, useRef, useState, useEffect, useCallback } from "react";
import { Node, Troop } from "../components/configs";

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameContextProps {
    difficulty: Difficulty;
    setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
    gameState: GameState;
    gameStateRef: React.MutableRefObject<GameState>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    isWon: boolean | null;
    setIsWon: React.Dispatch<React.SetStateAction<boolean | null>>;
    playCount: number;
    setPlayCount: React.Dispatch<React.SetStateAction<number>>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isDraggingRef: React.MutableRefObject<boolean>;
    nodesRef: React.MutableRefObject<Node[]>;
    troopsRef: React.MutableRefObject<Troop[]>;
    dragSelectedRef: React.MutableRefObject<Node[]>;
    dragCurrentRef: RefObject<{ x: number; y: number }>;
    handleDoubleTapRef: RefObject<(x: number, y: number) => void>;
    sendTroops: (selectedNode: Node, target: Node, percent: number) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [gameState, setGameState] = useState<GameState>('menu');
    const [isWon, setIsWon] = useState<boolean | null>(null);
    const [playCount, setPlayCount] = useState<number>(0);

    const gameStateRef = useRef<GameState>(gameState);
    const playCountRef = useRef(playCount);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        playCountRef.current = playCount;
    }, [playCount]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    const nodesRef = useRef<Node[]>([]);
    const troopsRef = useRef<Troop[]>([]);
    const dragSelectedRef = useRef<Node[]>([]);
    const dragCurrentRef = useRef<{ "x": number, "y": number }>({ x: 0, y: 0 });
    const handleDoubleTapRef = useRef<(x: number, y: number) => void>(() => { });

    const sendTroops = useCallback((selectedNode: Node, target: Node, percent: number) => {
        if (selectedNode.population < 2) return;

        const originalOwner = selectedNode.owner;
        let noOfTroopsToSend = Math.floor(selectedNode.population * percent);
        selectedNode.population -= noOfTroopsToSend;

        const sessionAtCall = playCountRef.current;

        for (let i = 0; i < noOfTroopsToSend; i++) {
            setTimeout(() => {
                if (gameStateRef.current === 'playing' && playCountRef.current === sessionAtCall) {
                    troopsRef.current.push(new Troop(originalOwner, selectedNode, target));
                }
            }, i * 30);
        }
    }, []);

    return (
        <GameContext.Provider value={{
            difficulty,
            setDifficulty,
            gameState,
            gameStateRef,
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
            handleDoubleTapRef,
            sendTroops
        }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGameContext = () => {
    const content = useContext(GameContext);
    if (!content) throw new Error("use useGameContext inside provider");
    return content;
}