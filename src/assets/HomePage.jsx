import { ShareIcon, Twitter, Facebook, Whatsapp } from "./SVGs.jsx"
import { startGame } from "./scripts/startGame.js"
import { useRef } from "react"


export function Homepage({ setDifficulty, setGameState }) {
    const canvasRef = useRef(null)

    const difficultySelector = (difficulty) => {
        setDifficulty(difficulty)
    }
    const handleStart = () => {
        if (canvasRef) {
            setGameState('playing')
            startGame()
        }
    }
    return (
        <div className="screen bg-gray-900 text-white">

            {/* <!-- Particles Background --> */}
            <div className="absolute inset-0 z-0"></div>

            <div className="max-w-md w-full p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl text-center relative overflow-hidden my-auto shrink-0">
                <div className="absolute top-0 left-0 w-full h-2 rainbow-strip"></div>

                <h1 className="text-5xl font-black mb-2 gradient-text tracking-tighter">CONQUEST IO</h1>
                <p className="text-gray-400 mb-8 text-sm tracking-widest uppercase">Total Domination Simulator</p>

                <div className="bg-gray-900 rounded-lg p-6 text-left mb-6 border border-gray-700 shadow-inner">
                    <h3 className="text-yellow-500 font-bold mb-3 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">How to Conquer</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-start"><span className="mr-2">🔵</span> <span><b>Drag</b> from base to attack.</span></li>
                        <li className="flex items-start"><span className="mr-2">🔗</span> <span><b>Drag Through</b> allies to chain attack.</span></li>
                        <li className="flex items-start"><span className="mr-2">⚡</span> <span><b>Double Tap</b> any node to Nuke (50% from all).</span></li>
                        <li className="flex items-start"><span className="mr-2">💀</span> <span>Troops die on collision!</span></li>
                    </ul>
                </div>

                <div className="mb-8">
                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">Difficulty Level</label>
                    <div className="relative">
                        {/* <!-- From Uiverse.io by m1her --> */}
                        <div className="radio-input">
                            <label className="label">
                                <input value='easy' name="value-radio" id="value-1" type="radio" onClick={(e) => {difficultySelector(e.target.value)}} />
                                <span className="text">Easy</span>
                            </label>
                            <label className="label">
                                <input value='medium' name="value-radio" id="value-2" type="radio" defaultChecked onClick={(e) => {difficultySelector(e.target.value)}} />
                                <span className="text">Medium</span>
                            </label>
                            <label className="label">
                                <input value='hard' name="value-radio" id="value-3" type="radio" onClick={(e) => {difficultySelector(e.target.value)}} />
                                <span className="text">Hard</span>
                            </label>
                        </div>
                    </div>
                </div>

                <button onClick={handleStart} className="nicebutton">
                    ⚔️ START WAR
                </button>
            </div>
            <div className="tooltip-container">
                <div className="button-content">
                    <span className="text">Share</span>
                    <ShareIcon />
                </div>
                <div className="tooltip-content">
                    <div className="social-icons">
                        <Twitter />
                        <Facebook />
                        <Whatsapp />
                    </div>
                </div>
            </div>
        </div>
    )
}