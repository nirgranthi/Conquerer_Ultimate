import { MainMenu, PlayAgain } from "./Buttons";

export function GameOverScreen({ isWon, setGameState, setPlayCount }) {
    console.log(isWon)
    return (
        <div className="screen bg-black bg-opacity-85 z-50 justify-center">
            <div className="bg-gray-900 p-10 rounded-2xl border-2 border-yellow-500 text-center shadow-2xl transform transition-all max-w-sm w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-white to-transparent opacity-5 pointer-events-none"></div>

                {isWon
                    ? (<>
                        <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">VICTORY</h2>
                        <p className="text-gray-300 mb-8 text-lg">The world is yours</p>
                    </>)
                    : (<>
                        <h2 className="text-5xl font-black text-red-600 mb-4 drop-shadow-lg">DEFEAT</h2>
                        <p className="text-gray-300 mb-8 text-lg" >Your empire has fallen</p>
                    </>)
                }

                <div className="flex flex-col gap-3">
                    <PlayAgain setGameState={setGameState} setPlayCount={setPlayCount} />
                    <MainMenu setGameState={setGameState} />
                </div>
            </div>
        </div>
    )
}