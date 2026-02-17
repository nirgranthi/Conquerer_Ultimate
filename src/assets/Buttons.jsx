const PauseButton = ({ setIsPaused }) => {
    return (
        <button onClick={() => setIsPaused(true)} className="w-12 h-12 bg-gray-800 bg-opacity-60 hover:bg-opacity-90 text-white rounded-full shadow-lg backdrop-blur-sm border border-gray-600 flex items-center justify-center transition-all md:hover:scale-110 active:scale-95">
            <span className="text-xl font-bold">⏸️</span>
        </button>
    )
}

const QuitToMenu = () => {
    return (
        <button className="bg-red-900 hover:bg-red-800 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-lg border border-red-800 transition-transform active:scale-95">
            Quit to Menu
        </button>
    )
}

const RestartMap = () => {
    return (
        <button className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95">
            Restart Map
        </button>
    )
}

const ResumeGame = ({ setIsPaused }) => {
    return (
        <button onClick={() => setIsPaused(false)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95">
            Resume Game
        </button>
    )
}

const MainMenu = () => {
    return (
        <button className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Main Menu
        </button>
    )
}

const PlayAgain = () => {
    return (
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-8 rounded-xl text-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            PLAY AGAIN
        </button>
    )
}

export { PauseButton, QuitToMenu, RestartMap, ResumeGame, MainMenu, PlayAgain }