import { QuitToMenu, RestartMap, ResumeGame } from "./Buttons";

export function PauseMenuScreen ({ setGameState }) {
    function handleResumeGame () {

    }
    return (
        <div className="screens bg-black bg-opacity-80 backdrop-blur-sm z-50 justify-center">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-600 text-center shadow-2xl min-w-75">
                <h2 className="text-3xl font-black text-white mb-8 tracking-widest">PAUSED</h2>
                <div className="flex flex-col gap-4">
                    <ResumeGame onClick={() => setGameState('playing')} />
                    <RestartMap onClick={() => setGameState('')} />
                    <QuitToMenu />
                </div>
            </div>
        </div>
    )
}