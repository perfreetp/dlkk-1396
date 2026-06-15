import React, { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface BubbleMessage {
  id: string
  text: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

type AddMessageFn = (text: string, type?: BubbleMessage['type'], duration?: number) => void

const SpeechBubbleContext = React.createContext<AddMessageFn | null>(null)

export const useSpeechBubble = (): AddMessageFn => {
  const ctx = React.useContext(SpeechBubbleContext)
  if (!ctx) throw new Error('useSpeechBubble must be used within SpeechBubbleProvider')
  return ctx
}

export const SpeechBubbleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<BubbleMessage[]>([])

  const addMessage = useCallback<AddMessageFn>((text, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setMessages(prev => [...prev, { id, text, type, duration }])
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, duration)
  }, [])

  const typeColors: Record<NonNullable<BubbleMessage['type']>, string> = {
    info: 'bg-lavender-300 border-lavender-400 text-purple-900',
    success: 'bg-mint-300 border-mint-400 text-green-900',
    warning: 'bg-yolk-400 border-warm-400 text-amber-900',
    error: 'bg-tomato-400 border-tomato-600 text-white',
  }

  const typeIcon: Record<NonNullable<BubbleMessage['type']>, string> = {
    info: '💬',
    success: '✨',
    warning: '⚠️',
    error: '❗',
  }

  return (
    <SpeechBubbleContext.Provider value={addMessage}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ x: 200, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 200, opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`
                ${typeColors[msg.type || 'info']}
                px-5 py-3 rounded-2xl shadow-lg border-4
                font-happy text-base flex items-start gap-2 backdrop-blur-sm
              `}
              style={{ borderRadius: '24px 24px 4px 24px' }}
            >
              <span className="text-2xl shrink-0">{typeIcon[msg.type || 'info']}</span>
              <span className="pt-0.5">{msg.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SpeechBubbleContext.Provider>
  )
}

export default SpeechBubbleProvider
