import React, { createContext, RefObject, useContext, useRef, useState, useEffect, useCallback } from "react";
import { Node, Troop, setPlayerColorVar, setTroopSpeedVar } from "../components/configs";

type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type PlayerColorOption = 'blue' | 'red' | 'green' | 'yellow' | 'purple';

interface GameContextProps {
    difficulty: Difficulty;
    setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
    galaxyBgEnabled: boolean;
    setGalaxyBgEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    playerColor: PlayerColorOption;
    setPlayerColor: React.Dispatch<React.SetStateAction<PlayerColorOption>>;
    troopSpeedSetting: number;
    setTroopSpeedSetting: React.Dispatch<React.SetStateAction<number>>;
    gameState: GameState;
    gameStateRef: RefObject<GameState>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    isWon: boolean | null;
    setIsWon: React.Dispatch<React.SetStateAction<boolean | null>>;
    playCount: number;
    setPlayCount: React.Dispatch<React.SetStateAction<number>>;
    bgCanvasRef: RefObject<HTMLCanvasElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isDraggingRef: RefObject<boolean>;
    nodesRef: RefObject<Node[]>;
    troopsRef: RefObject<Troop[]>;
    dragSelectedRef: RefObject<Node[]>;
    dragCurrentRef: RefObject<{ x: number; y: number }>;
    handleDoubleTapRef: RefObject<(x: number, y: number) => void>;
    sendTroops: (selectedNode: Node, target: Node, percent: number) => void;
    gameTimeRef: RefObject<number>;
    troopPoolRef: RefObject<Troop[]>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [galaxyBgEnabled, setGalaxyBgEnabled] = useState<boolean>(true);
    const [playerColor, setPlayerColor] = useState<PlayerColorOption>('blue');
    const [troopSpeedSetting, setTroopSpeedSetting] = useState<number>(2.8);
    const [gameState, setGameState] = useState<GameState>('menu');
    const [isWon, setIsWon] = useState<boolean | null>(null);
    const [playCount, setPlayCount] = useState<number>(0);

    const gameStateRef = useRef<GameState>(gameState);
    const playCountRef = useRef(playCount);

    useEffect(() => {
        const colorMap = {
            blue: { base: '#3B82F6', shadow: '#60A5FA', stroke: '#BFDBFE' },
            red: { base: '#EF4444', shadow: '#F87171', stroke: '#FECACA' },
            green: { base: '#10B981', shadow: '#34D399', stroke: '#A7F3D0' },
            yellow: { base: '#F59E0B', shadow: '#FBBF24', stroke: '#FDE68A' },
            purple: { base: '#8B5CF6', shadow: '#A78BFA', stroke: '#DDD6FE' }
        };
        const colors = colorMap[playerColor];
        setPlayerColorVar(colors.base, colors.shadow, colors.stroke);
    }, [playerColor]);

    useEffect(() => {
        setTroopSpeedVar(troopSpeedSetting);
    }, [troopSpeedSetting]);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        playCountRef.current = playCount;
    }, [playCount]);

    const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    const nodesRef = useRef<Node[]>([]);
    const troopsRef = useRef<Troop[]>([]);
    const dragSelectedRef = useRef<Node[]>([]);
    const dragCurrentRef = useRef<{ "x": number, "y": number }>({ x: 0, y: 0 });
    const handleDoubleTapRef = useRef<(x: number, y: number) => void>(() => { });
    const gameTimeRef = useRef<number>(0);
    const troopPoolRef = useRef<Troop[]>([]);

    const sendTroops = useCallback((selectedNode: Node, target: Node, percent: number) => {
        if (selectedNode.population < 2) return;

        selectedNode.lastTroopSentTime = gameTimeRef.current;

        const originalOwner = selectedNode.owner;
        let noOfTroopsToSend = Math.floor(selectedNode.population * percent);
        selectedNode.population -= noOfTroopsToSend;

        const sessionAtCall = playCountRef.current;

        for (let i = 0; i < noOfTroopsToSend; i++) {
            setTimeout(() => {
                if (gameStateRef.current === 'playing' && playCountRef.current === sessionAtCall) {
                    let troop = troopPoolRef.current.pop();
                    if (!troop) {
                        troop = new Troop();
                    }
                    troop.init(originalOwner, selectedNode, target);
                    troopsRef.current.push(troop);
                }
            }, i * 30);
        }
    }, []);

    return (
        <GameContext.Provider value={{
            difficulty,
            setDifficulty,
            galaxyBgEnabled,
            setGalaxyBgEnabled,
            playerColor,
            setPlayerColor,
            troopSpeedSetting,
            setTroopSpeedSetting,
            gameState,
            gameStateRef,
            setGameState,
            isWon,
            setIsWon,
            playCount,
            setPlayCount,
            bgCanvasRef,
            canvasRef,
            isDraggingRef,
            nodesRef,
            troopsRef,
            dragSelectedRef,
            dragCurrentRef,
            handleDoubleTapRef,
            sendTroops,
            gameTimeRef,
            troopPoolRef
        }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGameContext = () => {
    const content = useContext(GameContext);
    if (!content) throw new Error("use useGameContext inside the provider");
    return content;
}