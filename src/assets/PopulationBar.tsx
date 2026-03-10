import { useState, useEffect } from 'react';
import { useGameContext } from "./GameContext";
import { colors } from "../components/configs";

export const PopulationBar = () => {
    const { nodesRef, gameState } = useGameContext();
    const [stats, setStats] = useState<{ owner: number; width: number }[]>([]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const calculateStats = () => {
            const nodes = nodesRef.current;
            if (!nodes || nodes.length === 0) return;

            const popTotals: Record<number, number> = {};
            let totalPopulation = 0;

            nodes.forEach((node) => {
                if (node.owner === 11) return;
                popTotals[node.owner] = (popTotals[node.owner] || 0) + node.population;
                totalPopulation += node.population;
            });

            const newStats = Object.entries(popTotals)
                .map(([owner, pop]) => ({
                    owner: parseInt(owner),
                    width: (pop / totalPopulation) * 100,
                }))
                .sort((a, b) => a.owner - b.owner);

            setStats(newStats);
        };

        const intervalId = setInterval(calculateStats, 150);
        return () => clearInterval(intervalId);
    }, [gameState, nodesRef]);

    if (gameState === 'menu') return null;

    return (
        <div className="fixed top-0 left-0 w-full h-2 flex z-50 bg-gray-900/40 backdrop-blur-sm overflow-hidden border-b border-white/5">
            {stats.map((stat) => (
                <div
                    key={stat.owner}
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                        width: `${stat.width}%`,
                        backgroundColor: colors[stat.owner],
                    }}
                />
            ))}
        </div>
    );
};