import { useGameContext } from "./GameContext";
import { colors, playerId } from "../components/configs";

interface StatsOverlayProps {
    onClose: () => void;
}

export function StatsOverlay({ onClose }: StatsOverlayProps) {
    const { nodesRef, globalPopulationRef } = useGameContext();

    const getStats = () => {
        const stats = [];
        for (let i = 0; i <= 10; i++) {
            const ownedNodes = nodesRef.current.filter(n => n.owner === i);
            const nodeCount = ownedNodes.length;
            const nodePopulation = ownedNodes.reduce((sum, n) => sum + Math.floor(n.population), 0);
            
            // Re-sync with actual values to eliminate any potential float drift from the engine
            const exactAirborne = Math.floor(globalPopulationRef.current[i] || 0) - nodePopulation;
            const totalTroops = nodePopulation + Math.max(0, exactAirborne);
            
            if (nodeCount > 0 || totalTroops > 0) {
                // Calculation inspired by ai logic: emphasizing node count and population
                const strategicScore = (nodeCount * 50) + nodePopulation;

                stats.push({
                    id: i,
                    color: colors[i],
                    name: i === playerId ? "YOU" : `Enemy ${i}`,
                    nodes: nodeCount,
                    score: Math.floor(strategicScore),
                    troops: Math.floor(totalTroops)
                });
            }
        }
        const sortedEnemies = stats
            .filter(s => s.id !== playerId)
            .sort((a, b) => b.score - a.score);
        
        const playerStat = stats.find(s => s.id === playerId);
        
        return playerStat ? [playerStat, ...sortedEnemies] : sortedEnemies;
    };

    const stats = getStats();

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-sm p-6 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white tracking-widest flex items-center gap-2">
                        <span className="text-blue-500 text-2xl">📊</span> BATTLE STATS
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors text-xl p-2"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {stats.map(player => (
                        <div key={player.id} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div 
                                    className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                                    style={{ backgroundColor: player.color }}
                                />
                                <span className={`text-xs font-black uppercase tracking-wider ${player.id === playerId ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {player.name}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-gray-900/50 p-2 rounded-lg">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Score</div>
                                    <div className="text-lg font-black text-blue-400">{player.score}</div>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded-lg">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Nodes</div>
                                    <div className="text-lg font-black text-white">{player.nodes}</div>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded-lg">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Troops</div>
                                    <div className="text-lg font-black text-gray-300">{player.troops}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 uppercase tracking-widest text-sm"
                >
                    Resume War
                </button>
                <div className="text-center mt-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    Press 'S' or 'Space' to return
                </div>
            </div>
        </div>
    );
}
