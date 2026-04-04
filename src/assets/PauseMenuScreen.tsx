import { QuitToMenu, RestartMap, ResumeGame } from "./Buttons";
import { useGameContext } from "./GameContext";
import { colors } from "../components/configs";

interface PauseMenuScreenProps {
    onShowStats: () => void;
}

export function PauseMenuScreen({ onShowStats }: PauseMenuScreenProps) {
    const { chaosModeEnabled, imposterModeEnabled, monopolyModeEnabled, spyModeEnabled, equalityModeEnabled, spyOwnerId, hexToRGBA } = useGameContext();

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
    ].filter(m => m.enabled);

    return (
        <div className="screen bg-opacity-80 backdrop-blur-md z-50 justify-center">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-600 text-center shadow-2xl min-w-75">
                <h2 className={`text-3xl font-black text-white ${activeModes.length > 0 ? 'mb-4' : 'mb-8'} tracking-widest`}>PAUSED</h2>

                {activeModes.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
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

                <div className="flex flex-col gap-4">
                    <ResumeGame />
                    <button
                        onClick={onShowStats}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        📊 Show Stats
                    </button>
                    <RestartMap />
                    <QuitToMenu />
                </div>
            </div>
        </div>
    );
}