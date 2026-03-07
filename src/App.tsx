import { useState, useRef } from "react"
import { Homepage } from "./assets/HomePage"
import { GameScreen } from "./assets/GameScreen"


function App() {
  
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
