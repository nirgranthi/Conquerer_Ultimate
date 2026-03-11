import { useGameContext } from "./GameContext"
import { useState, useEffect } from "react"

export const PauseButton = () => {
    const { setGameState } = useGameContext()
    return (
        <button
            onClick={() => setGameState('paused')}
            className="absolute top-4 right-4 origin-top-right w-12 h-12 bg-gray-800 bg-opacity-60 hover:bg-opacity-90 text-white rounded-full shadow-lg backdrop-blur-sm border border-gray-600 flex items-center justify-center transition-all md:hover:scale-110 active:scale-95">
            <span className="text-xl font-bold">⏸️</span>
        </button>
    )
}

export const QuitToMenu = () => {
    const { setGameState } = useGameContext()
    return (
        <button onClick={() => setGameState('menu')} className="bg-red-900 hover:bg-red-800 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-lg border border-red-800 transition-transform active:scale-95">
            Quit to Menu
        </button>
    )
}

export const RestartMap = () => {
    const { setPlayCount, setGameState } = useGameContext()
    const handleRestartMap = () => {
        setPlayCount(prev => prev + 1)
        setGameState('playing')
    }
    return (
        <button onClick={handleRestartMap} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95">
            Restart Map
        </button>
    )
}

export const ResumeGame = () => {
    const { setGameState } = useGameContext()
    return (
        <button onClick={() => setGameState('playing')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95">
            Resume Game
        </button>
    )
}

export const MainMenu = () => {
    const { setGameState } = useGameContext()
    return (
        <button onClick={() => setGameState('menu')} className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Main Menu
        </button>
    )
}

export const PlayAgain = () => {
    const { setPlayCount, setGameState } = useGameContext()
    const handleRestartMap = () => {
        setPlayCount(prev => prev + 1)
        setGameState('playing')
    }
    return (
        <button onClick={handleRestartMap} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-8 rounded-xl text-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            PLAY AGAIN
        </button>
    )
}

export const GameTimer = () => {
    const { gameTimeRef } = useGameContext()
    const [time, setTime] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Math.floor(gameTimeRef.current))
        }, 100)
        return () => clearInterval(interval)
    }, [gameTimeRef])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    return (
        <div className="absolute top-20 right-4 w-12 text-center text-white font-mono font-bold text-sm drop-shadow-md bg-gray-800 bg-opacity-60 py-1 rounded-md shadow-lg backdrop-blur-sm border border-gray-600">
            {formatTime(time)}
        </div>
    )
}

export const ShareButton = () => {
    return (
        <button
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            aria-label='share'
            onClick={() => {
                if (navigator.share) {
                    navigator.share({ title: 'CONQUEST IO', url: window.location.href });
                }
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
        </button>
    )
}