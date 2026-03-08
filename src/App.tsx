import { Homepage } from "./assets/HomePage"
import { GameScreen } from "./assets/GameScreen"
import { useGameContext } from "./assets/GameContext"


function App() {
  const { gameState } = useGameContext()

  return (
    <div>
      {gameState === 'menu'
        ? <Homepage />
        : <GameScreen />
      }
    </div>
  )
}

export default App
