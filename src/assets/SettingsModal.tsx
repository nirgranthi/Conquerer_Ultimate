import { monopolyLuckyNodePopulation, spyGrowthRate } from "../components/configs";
import { useGameContext, PlayerColorOption } from "./GameContext";

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const {
        playerColor, setPlayerColor,
        troopSpeedSetting, setTroopSpeedSetting,
        doubleTapPercent, setDoubleTapPercent,
        chaosModeEnabled, setChaosModeEnabled,
        imposterModeEnabled, setImposterModeEnabled,
        monopolyModeEnabled, setMonopolyModeEnabled,
        equalityModeEnabled, setEqualityModeEnabled,
        spyModeEnabled, setSpyModeEnabled,
        spectatorModeEnabled, setSpectatorModeEnabled
    } = useGameContext();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-sm w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>
                <h2 className="text-2xl font-black mb-6 text-white text-center">SETTINGS</h2>

                <div className="space-y-6">
                    {/* Player Color */}
                    <div>
                        <label className="block text-gray-400 text-xs font-bold mb-3 uppercase tracking-wide">Player Color</label>
                        <div className="flex justify-between">
                            {(['blue', 'red', 'green', 'yellow', 'purple'] as PlayerColorOption[]).map(color => (
                                <button
                                    key={color}
                                    onClick={() => setPlayerColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform ${playerColor === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}`}
                                    style={{
                                        backgroundColor:
                                            color === 'blue' ? '#3B82F6' :
                                                color === 'red' ? '#EF4444' :
                                                    color === 'green' ? '#10B981' :
                                                        color === 'yellow' ? '#F59E0B' : '#8B5CF6'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Troop Speed */}
                    <div>
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">
                            Troop Speed ({troopSpeedSetting.toFixed(1)}x)
                        </label>
                        <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={troopSpeedSetting}
                            onChange={(e) => setTroopSpeedSetting(parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>

                    {/* Double Tap Send % */}
                    <div>
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">
                            Double Tap: Send {Math.round(doubleTapPercent * 100)}% of troops
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={Math.round(doubleTapPercent * 100)}
                            onChange={(e) => setDoubleTapPercent(parseInt(e.target.value) / 100)}
                            className="w-full accent-yellow-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>10%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Chaos Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Chaos Mode</label>
                        <button
                            onClick={() => setChaosModeEnabled(!chaosModeEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${chaosModeEnabled ? 'bg-red-600' : 'bg-gray-600'}`}
                            title="Disable Hard Homing"
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${chaosModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Imposter Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Imposter Mode</label>
                        <button
                            onClick={() => setImposterModeEnabled(!imposterModeEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${imposterModeEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
                            title="Disguise enemies as player"
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${imposterModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Monopoly Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Monopoly Mode</label>
                        <button
                            onClick={() => setMonopolyModeEnabled(!monopolyModeEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${monopolyModeEnabled ? 'bg-amber-600' : 'bg-gray-600'}`}
                            title={`Random enemy starts with ${monopolyLuckyNodePopulation} troops`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${monopolyModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Spy Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Spy Mode</label>
                        <button
                            onClick={() => setSpyModeEnabled(!spyModeEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${spyModeEnabled ? 'bg-teal-600' : 'bg-gray-600'}`}
                            title={`A random enemy node grows troops ${spyGrowthRate}× faster`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${spyModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Equality Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Equality Mode</label>
                        <button
                            onClick={() => setEqualityModeEnabled(!equalityModeEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${equalityModeEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}
                            title="AI treats all nodes equally"
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${equalityModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Spectator Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Spectator Mode</label>
                        <button
                            onClick={() => setSpectatorModeEnabled(!spectatorModeEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${spectatorModeEnabled ? 'bg-pink-600' : 'bg-gray-600'}`}
                            title="Watch enemies fight each other without playing"
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${spectatorModeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
