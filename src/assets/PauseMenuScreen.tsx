import { QuitToMenu, RestartMap, ResumeGame } from "./Buttons";

interface PauseMenuScreenProps {
    onShowStats: () => void;
}

export function PauseMenuScreen({ onShowStats }: PauseMenuScreenProps) {
    return (
        <div className="screen bg-opacity-80 backdrop-blur-md z-50 justify-center">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-600 text-center shadow-2xl min-w-75">
                <h2 className="text-3xl font-black text-white mb-8 tracking-widest">PAUSED</h2>
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