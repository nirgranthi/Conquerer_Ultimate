import { MainMenu, PlayAgain } from "./Buttons";
import { useGameContext } from "./GameContext";
import { colors } from "../components/configs";

export function GameOverScreen() {
    const { isWon, gameTimeRef, difficulty, chaosModeEnabled, imposterModeEnabled, monopolyModeEnabled, spyModeEnabled, equalityModeEnabled, spyOwnerId, hexToRGBA, spectatorModeEnabled, winnerId } = useGameContext()

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (Math.floor(seconds) % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    const timeSurvived = formatTime(gameTimeRef.current);

    const spyColorHex = spyOwnerId !== -1 ? colors[spyOwnerId] : null;

    const activeModes = [
        { name: 'Chaos', enabled: chaosModeEnabled, className: 'text-red-400 bg-red-900/30 border-red-500/30' },
        { name: 'Imposter', enabled: imposterModeEnabled, className: 'text-purple-400 bg-purple-900/30 border-purple-500/30' },
        { name: 'Monopoly', enabled: monopolyModeEnabled, className: 'text-amber-400 bg-amber-900/30 border-amber-500/30' },
        { 
            name: 'Spy', 
            enabled: spyModeEnabled, 
            className: spyColorHex ? '' : 'text-teal-400 bg-teal-900/30 border-teal-500/30',
            style: spyColorHex ? { color: spyColorHex, backgroundColor: hexToRGBA(spyColorHex, 0.3), borderColor: hexToRGBA(spyColorHex, 0.5) } : undefined
        },
        { name: 'Equality', enabled: equalityModeEnabled, className: 'text-indigo-400 bg-indigo-900/30 border-indigo-500/30' },
        { name: 'Spectator', enabled: spectatorModeEnabled, className: 'text-pink-400 bg-pink-900/30 border-pink-500/30' },
    ].filter(m => m.enabled);

    return (
        <div className="screen bg-opacity-85 backdrop-blur-md z-50 justify-center">
            <div className="bg-gray-900 p-10 rounded-2xl border-2 border-yellow-500 text-center shadow-2xl transform transition-all max-w-sm w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-white to-transparent opacity-5 pointer-events-none"></div>

                {spectatorModeEnabled ? (
                    <>
                        <h2 className="text-5xl font-black mb-4 drop-shadow-lg" style={winnerId !== null ? { color: colors[winnerId] } : { color: '#888' }}>
                            {winnerId !== null ? 'WINNER!' : 'GAME OVER'}
                        </h2>
                        <p className="text-gray-300 mb-6 text-lg">
                            {winnerId !== null ? 'An empire has conquered the world.' : 'Total annihilation.'}
                        </p>
                    </>
                ) : isWon ? (
                    <>
                        <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">VICTORY</h2>
                        <p className="text-gray-300 mb-6 text-lg">The world is yours</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-5xl font-black text-red-600 mb-4 drop-shadow-lg">DEFEAT</h2>
                        <p className="text-gray-300 mb-6 text-lg">Your empire has fallen</p>
                    </>
                )}
                <div className="text-yellow-400 font-bold mb-8 text-xl flex flex-col gap-2">
                    <div>Survived: <span className="font-mono text-white">{timeSurvived}</span></div>
                    <div className="text-sm text-gray-400 tracking-widest uppercase mt-1">Difficulty: <span className="text-white">{difficulty}</span></div>
                    {activeModes.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {activeModes.map(mode => (
                                <span 
                                    key={mode.name} 
                                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${mode.className}`}
                                    style={mode.style}
                                >
                                    {mode.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <PlayAgain />
                    <MainMenu />
                </div>
            </div>
        </div>
    )
}