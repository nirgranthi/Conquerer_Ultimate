import { useState, useEffect } from 'react';
import { useGameContext } from "./GameContext";
import { colors } from "../components/configs";

export const PopulationBar = () => {
    const { gameState, globalPopulationRef } = useGameContext();
    const [stats, setStats] = useState<{ owner: number; width: number }[]>([]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const calculateStats = () => {
            const popTotals = globalPopulationRef.current;
            if (!popTotals) return;

            let totalTotal = 0;
            const validOwners: Record<number, number> = {};

            Object.entries(popTotals).forEach(([ownerStr, pop]) => {
                const owner = parseInt(ownerStr);
                const truePop = Math.max(0, Math.floor(pop));
                if (owner === 11) return; // Ignore neutral
                if (truePop > 0) {
                    validOwners[owner] = truePop;
                    totalTotal += truePop;
                }
            });

            if (totalTotal === 0) return;

            const newStats = Object.entries(validOwners)
                .map(([owner, pop]) => ({
                    owner: parseInt(owner),
                    width: (pop / totalTotal) * 100,
                }))
                .sort((a, b) => a.owner - b.owner);

            setStats(newStats);
        };

        const intervalId = setInterval(calculateStats, 150);
        return () => clearInterval(intervalId);
    }, [gameState, globalPopulationRef]);

    if (gameState === 'menu') return null;

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-3 flex z-50 rounded-full bg-black/40 backdrop-blur-md overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {stats.map((stat) => (
                <div
                    key={stat.owner}
                    className="h-full transition-all duration-700 ease-in-out relative group"
                    style={{
                        width: `${stat.width}%`,
                        backgroundColor: colors[stat.owner],
                        boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 10px ${colors[stat.owner]}44`
                    }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-white/10" />
                    
                    <div className="absolute inset-0 w-full h-full animate-pulse opacity-30 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                </div>
            ))}
        </div>
    );
};