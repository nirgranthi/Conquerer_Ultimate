import { MainMenu, PlayAgain } from "./Buttons";
import { useGameContext } from "./GameContext";

export function GameOverScreen() {
    const { isWon, gameTimeRef, difficulty } = useGameContext()

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (Math.floor(seconds) % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    const timeSurvived = formatTime(gameTimeRef.current);

    return (
        <div className="screen bg-opacity-85 backdrop-blur-md z-50 justify-center">
            <div className="bg-gray-900 p-10 rounded-2xl border-2 border-yellow-500 text-center shadow-2xl transform transition-all max-w-sm w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-white to-transparent opacity-5 pointer-events-none"></div>

                {isWon
                    ? (<>
                        <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">VICTORY</h2>
                        <p className="text-gray-300 mb-6 text-lg">The world is yours</p>
                    </>)
                    : (<>
                        <h2 className="text-5xl font-black text-red-600 mb-4 drop-shadow-lg">DEFEAT</h2>
                        <p className="text-gray-300 mb-6 text-lg" >Your empire has fallen</p>
                    </>)
                }
                <div className="text-yellow-400 font-bold mb-8 text-xl flex flex-col gap-2">
                    <div>Survived: <span className="font-mono text-white">{timeSurvived}</span></div>
                    <div className="text-sm text-gray-400 tracking-widest uppercase mt-1">Difficulty: <span className="text-white">{difficulty}</span></div>
                </div>

                <div className="flex flex-col gap-3">
                    <PlayAgain />
                    <MainMenu />
                </div>
            </div>
        </div>
    )
}