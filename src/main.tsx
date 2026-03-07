import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GameContextProvider } from './assets/GameContext'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <GameContextProvider>
      <App />
    </GameContextProvider>
  </StrictMode>,
)
