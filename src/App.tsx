import { useState, useRef } from "react"
import { Homepage } from "./assets/HomePage"
import { GameScreen } from "./assets/GameScreen"

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [gameState, setGameState] = useState<GameState>('menu')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  return (
    <div>
      {gameState === 'menu'
        ? <Homepage setDifficulty={setDifficulty} setGameState={setGameState} />
        : <GameScreen canvasRef={canvasRef} difficulty={difficulty} gameState={gameState} setGameState={setGameState} />
      }
    </div>
  )
}

export default App
