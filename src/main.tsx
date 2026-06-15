import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { GameProvider } from './contexts/GameContext'
import { SpeechBubbleProvider } from './components/common/SpeechBubble'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <GameProvider>
        <SpeechBubbleProvider>
          <App />
        </SpeechBubbleProvider>
      </GameProvider>
    </HashRouter>
  </React.StrictMode>,
)
