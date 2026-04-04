import { useState, lazy, Suspense } from 'react';
import { useGameContext } from "./GameContext";
import { ShareButton } from './Buttons';
import { SettingsModal } from './SettingsModal';
import { buttonClickSound } from './scripts/soundEngine';

const Hyperspeed = lazy(() => import('./hyperspeed/Hyperspeed'));

export function Homepage() {
    const { difficulty, setDifficulty, setGameState, doubleTapPercent } = useGameContext();
    const [showSettings, setShowSettings] = useState(false);
    const handleStart = () => {
        setGameState('playing')
    }
    return (
        <div className="screen bg-gray-900 text-white h-full w-full">

            <div className="absolute inset-0 z-0">
                <Suspense fallback={null}>
                    <Hyperspeed />
                </Suspense>
            </div>

            <div className="max-w-md w-full overflow-hidden p-8 bg-gray-800/70 rounded-2xl border border-gray-700 shadow-2xl text-center absolute shrink-0">
                <div className="absolute top-0 left-0 w-full h-2 rainbow-strip"></div>

                <ShareButton />
                <button 
                    onClick={() => setShowSettings(true)}
                    className="absolute top-4 left-4 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full border border-gray-600 transition-colors shadow-lg z-10"
                    title="Settings"
                >
                    ⚙️
                </button>

                <h1 className="text-5xl font-black mb-2 gradient-text tracking-tighter mt-4">CONQUEST IO</h1>
                <p className="text-gray-400 mb-8 text-sm tracking-widest uppercase">Total Domination Simulator</p>

                <div className="bg-gray-900/80 rounded-lg p-6 text-left mb-6 border border-gray-700 shadow-inner">
                    <h3 className="text-yellow-500 font-bold mb-3 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">How to Conquer</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-start"><span className="mr-2">🔵</span> <span><b>Drag</b> from base to attack.</span></li>
                        <li className="flex items-start"><span className="mr-2">🔗</span> <span><b>Drag Through</b> allies to chain attack.</span></li>
                        <li className="flex items-start"><span className="mr-2">⚡</span> <span><b>Double Tap</b> any node to Nuke ({Math.round(doubleTapPercent * 100)}% from all).</span></li>
                        <li className="flex items-start"><span className="mr-2">💀</span> <span>Troops die on collision!</span></li>
                    </ul>
                </div>

                <div className="mb-8">
                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">Difficulty Level</label>
                    <div className="relative">
                        {/* <!-- From Uiverse.io by m1her --> */}
                        <div className="radio-input">
                            <label className="label">
                                <input name="value-radio" id="value-1" onClick={buttonClickSound} type="radio" checked={difficulty === "easy"} onChange={() => setDifficulty("easy")} />
                                <span className="text">Easy</span>
                            </label>
                            <label className="label">
                                <input name="value-radio" id="value-2" onClick={buttonClickSound} type="radio" checked={difficulty === "medium"} onChange={() => setDifficulty("medium")} />
                                <span className="text">Medium</span>
                            </label>
                            <label className="label">
                                <input name="value-radio" id="value-3" onClick={buttonClickSound} type="radio" checked={difficulty === "hard"} onChange={() => setDifficulty("hard")} />
                                <span className="text">Hard</span>
                            </label>
                        </div>
                    </div>
                </div>

                <button onClick={handleStart} className="nicebutton">
                    ⚔️ START WAR
                </button>
            </div>
            
            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}
        </div>
    )
}