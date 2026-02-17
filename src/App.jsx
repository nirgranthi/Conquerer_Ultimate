import { useState, useEffect } from "react"
import { Homepage } from "./assets/HomePage"
import { GameScreen } from "./assets/GameScreen"

function App() {
  const [difficulty, setDifficulty] = useState('medium')
  const [gameState, setGameState] = useState('menu') /* meun, playing, paused, gameover */

  useEffect(() => {
    console.log(difficulty)
  }, [difficulty])
  return (
    <div>
      {gameState === 'menu'
      ? <Homepage setDifficulty={setDifficulty} setGameState={setGameState} />
      : <GameScreen />
    }
    </div>
  )
}

export default App
