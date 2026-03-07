import { Homepage } from "./assets/HomePage"
import { GameScreen } from "./assets/GameScreen"
import { useGameContext } from "./assets/GameContext"


function App() {
  const { gameState, setDifficulty, setGameState, canvasRef, difficulty } = useGameContext()

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
