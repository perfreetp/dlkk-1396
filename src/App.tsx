import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import MenuScene from './components/scenes/MenuScene'
import PrepScene from './components/scenes/PrepScene'
import CookScene from './components/scenes/CookScene'
import ResultScene from './components/scenes/ResultScene'
import GalleryScene from './components/scenes/GalleryScene'
import { useGame } from './contexts/GameContext'

const SceneWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen w-full"
    >
      {children}
    </motion.div>
  )
}

function App() {
  const location = useLocation()
  const { state } = useGame()

  const ProtectedRoute = ({ 
    children, 
    requiredScene 
  }: { 
    children: React.ReactNode
    requiredScene: 'menu' | 'prep' | 'cook' | 'result' | 'gallery'
  }) => {
    const allowed: Record<string, string[]> = {
      menu: ['menu', 'prep', 'cook', 'result', 'gallery'],
      prep: ['prep', 'cook', 'result', 'gallery', 'menu'],
      cook: ['cook', 'result', 'gallery', 'menu'],
      result: ['result', 'gallery', 'menu'],
      gallery: ['gallery', 'menu', 'prep', 'cook', 'result'],
    }
    const current = state.currentScene
    if (!allowed[current]?.includes(requiredScene) && requiredScene !== 'gallery' && requiredScene !== 'menu') {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <SceneWrapper>
              <MenuScene />
            </SceneWrapper>
          } 
        />
        <Route 
          path="/prep" 
          element={
            <ProtectedRoute requiredScene="prep">
              <SceneWrapper>
                <PrepScene />
              </SceneWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cook" 
          element={
            <ProtectedRoute requiredScene="cook">
              <SceneWrapper>
                <CookScene />
              </SceneWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/result" 
          element={
            <ProtectedRoute requiredScene="result">
              <SceneWrapper>
                <ResultScene />
              </SceneWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gallery" 
          element={
            <SceneWrapper>
              <GalleryScene />
            </SceneWrapper>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
