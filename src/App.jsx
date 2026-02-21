import { useState, useRef } from "react"
import { Homepage } from "./assets/HomePage"
import { GameScreen } from "./assets/GameScreen"

function App() {
  const [difficulty, setDifficulty] = useState('medium')
  const [gameState, setGameState] = useState('menu') /* meun, playing, paused, gameover */

  const canvasRef = useRef(null)
  return (
    <div>
      {gameState === 'menu'
      ? <Homepage setDifficulty={setDifficulty} setGameState={setGameState} canvasRef={canvasRef} />
      : <GameScreen canvasRef={canvasRef} difficulty={difficulty} gameState={gameState} setGameState={setGameState} />
    }
    </div>
  )
}

export default App
