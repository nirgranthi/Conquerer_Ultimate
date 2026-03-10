import { lazy, Suspense } from 'react';
import { useGameContext } from "./assets/GameContext"

const Homepage = lazy(() => import('./assets/HomePage').then(module => ({ default: module.Homepage })));
const GameScreen = lazy(() => import('./assets/GameScreen').then(module => ({ default: module.GameScreen })));

function App() {
  const { gameState } = useGameContext()

  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">Loading...</div>}>
      <div>
        {gameState === 'menu'
          ? <Homepage />
          : <GameScreen />
        }
      </div>
    </Suspense>
  )
}

export default App
