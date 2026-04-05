import React, { createContext, RefObject, useContext, useRef, useState, useEffect, useCallback } from "react";
import { Node, Troop, setPlayerColorVar, setTroopSpeedVar, setChaosModeVar, maxTroopPoolSize } from "../components/configs";
import { setImposterModeVar, setMonopolyModeVar, setEqualityModeVar, setSpyModeVar, setSpyOwnerIdVar, setSpectatorModeVar } from "../components/configs";
import { buttonClickSound } from "./scripts/soundEngine";


type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type PlayerColorOption = 'blue' | 'red' | 'green' | 'yellow' | 'purple';

interface GameContextProps {
    difficulty: Difficulty;
    setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
    playerColor: PlayerColorOption;
    setPlayerColor: React.Dispatch<React.SetStateAction<PlayerColorOption>>;
    troopSpeedSetting: number;
    setTroopSpeedSetting: React.Dispatch<React.SetStateAction<number>>;
    chaosModeEnabled: boolean;
    setChaosModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    imposterModeEnabled: boolean;
    setImposterModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    monopolyModeEnabled: boolean;
    setMonopolyModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    equalityModeEnabled: boolean;
    setEqualityModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    spyModeEnabled: boolean;
    setSpyModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    spyOwnerId: number;
    setSpyOwnerId: React.Dispatch<React.SetStateAction<number>>;
    spectatorModeEnabled: boolean;
    setSpectatorModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    doubleTapPercent: number;
    setDoubleTapPercent: React.Dispatch<React.SetStateAction<number>>;

    gameState: GameState;
    gameStateRef: RefObject<GameState>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    isWon: boolean | null;
    setIsWon: React.Dispatch<React.SetStateAction<boolean | null>>;
    winnerId: number | null;
    setWinnerId: React.Dispatch<React.SetStateAction<number | null>>;
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
    globalPopulationRef: RefObject<Record<number, number>>;
    hexToRGBA: (hex: string, alpha: number) => string
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [playerColor, setPlayerColor] = useState<PlayerColorOption>('blue');
    const [troopSpeedSetting, setTroopSpeedSetting] = useState<number>(2.8);
    const [chaosModeEnabled, setChaosModeEnabled] = useState<boolean>(false);
    const [imposterModeEnabled, setImposterModeEnabled] = useState<boolean>(false);
    const [monopolyModeEnabled, setMonopolyModeEnabled] = useState<boolean>(false);
    const [equalityModeEnabled, setEqualityModeEnabled] = useState<boolean>(false);
    const [spyModeEnabled, setSpyModeEnabled] = useState<boolean>(false);
    const [spyOwnerId, setSpyOwnerId] = useState<number>(-1);
    const [spectatorModeEnabled, setSpectatorModeEnabled] = useState<boolean>(false);
    const [doubleTapPercent, setDoubleTapPercent] = useState<number>(0.5);

    const [gameState, setGameState] = useState<GameState>('menu');
    const [isWon, setIsWon] = useState<boolean | null>(null);
    const [winnerId, setWinnerId] = useState<number | null>(null);
    const [playCount, setPlayCount] = useState<number>(0);

    const gameStateRef = useRef<GameState>(gameState);
    const playCountRef = useRef(playCount);
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
    const globalPopulationRef = useRef<Record<number, number>>({});

    const hexToRGBA = (hex: string, alpha: number) => {
        let r = 0, g = 0, b = 0;
        if (hex.length >= 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

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
        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('button')) {
                buttonClickSound()
            }
        };

        window.addEventListener('mousedown', handleGlobalClick);
        return () => window.removeEventListener('mousedown', handleGlobalClick);
    }, []);

    useEffect(() => {
        setTroopSpeedVar(troopSpeedSetting);
    }, [troopSpeedSetting]);

    useEffect(() => {
        setChaosModeVar(chaosModeEnabled);
    }, [chaosModeEnabled]);

    useEffect(() => {
        setImposterModeVar(imposterModeEnabled);
    }, [imposterModeEnabled]);

    useEffect(() => {
        setMonopolyModeVar(monopolyModeEnabled);
    }, [monopolyModeEnabled]);

    useEffect(() => {
        setEqualityModeVar(equalityModeEnabled);
    }, [equalityModeEnabled]);

    useEffect(() => {
        setSpyModeVar(spyModeEnabled);
    }, [spyModeEnabled]);

    useEffect(() => {
        setSpyOwnerIdVar(spyOwnerId);
    }, [spyOwnerId]);

    useEffect(() => {
        setSpectatorModeVar(spectatorModeEnabled);
    }, [spectatorModeEnabled]);


    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        playCountRef.current = playCount;
    }, [playCount]);

    const populateTroopPool = useCallback(() => {
        if (troopPoolRef.current.length >= maxTroopPoolSize) return;
        const remaining = maxTroopPoolSize - troopPoolRef.current.length;
        for (let i = 0; i < remaining; i++) {
            troopPoolRef.current.push(new Troop());
        }
    }, []);

    useEffect(() => {
        populateTroopPool();
    }, [populateTroopPool]);

    const sendTroops = useCallback((selectedNode: Node, target: Node, percent: number) => {
        if (selectedNode.population < 2) return;

        selectedNode.lastTroopSentTime = gameTimeRef.current;

        const originalOwner = selectedNode.owner;
        let noOfTroopsToSend = Math.floor(selectedNode.population * percent);
        const sessionAtCall = playCountRef.current;

        for (let i = 0; i < noOfTroopsToSend; i++) {
            setTimeout(() => {
                if (playCountRef.current === sessionAtCall) {
                    // Only dispatch if still owned by the sender and pop hasn't drained
                    if (selectedNode.owner === originalOwner && selectedNode.population > 1) {
                        selectedNode.population -= 1;
                        let troop = troopPoolRef.current.pop();
                        if (!troop) {
                            troop = new Troop();
                        }
                        troop.init(originalOwner, selectedNode, target);
                        troopsRef.current.push(troop);
                    }
                }
            }, i * 30);
        }
    }, []);

    return (
        <GameContext.Provider value={{
            difficulty,
            setDifficulty,
            playerColor,
            setPlayerColor,
            troopSpeedSetting,
            setTroopSpeedSetting,
            chaosModeEnabled,
            setChaosModeEnabled,
            imposterModeEnabled,
            setImposterModeEnabled,
            monopolyModeEnabled,
            setMonopolyModeEnabled,
            equalityModeEnabled,
            setEqualityModeEnabled,
            spyModeEnabled,
            setSpyModeEnabled,
            spyOwnerId,
            setSpyOwnerId,
            spectatorModeEnabled,
            setSpectatorModeEnabled,
            doubleTapPercent,
            setDoubleTapPercent,

            gameState,
            gameStateRef,
            setGameState,
            isWon,
            setIsWon,
            winnerId,
            setWinnerId,
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
            troopPoolRef,
            globalPopulationRef,
            hexToRGBA
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