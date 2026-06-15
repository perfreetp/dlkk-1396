import { useCallback, useRef, useState } from 'react'

const VOICE_MESSAGES = {
  zh_cn: 'zh-CN',
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isEnabled] = useState(() => 
    typeof window !== 'undefined' && 'speechSynthesis' in window
  )
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, opts: { rate?: number; pitch?: number; volume?: number } = {}) => {
    if (!isEnabled) return
    const { rate = 1, pitch = 1.1, volume = 0.8 } = opts
    
    try {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = VOICE_MESSAGES.zh_cn
      utter.rate = rate
      utter.pitch = pitch
      utter.volume = volume
      
      const voices = window.speechSynthesis.getVoices()
      const zhVoice = voices.find(v => v.lang.toLowerCase().includes('zh'))
      if (zhVoice) utter.voice = zhVoice
      
      utter.onstart = () => setIsSpeaking(true)
      utter.onend = () => setIsSpeaking(false)
      utter.onerror = () => setIsSpeaking(false)
      
      currentUtterance.current = utter
      window.speechSynthesis.speak(utter)
    } catch {
      // ignore
    }
  }, [isEnabled])

  const cancel = useCallback(() => {
    if (!isEnabled) return
    try {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } catch {
      // ignore
    }
  }, [isEnabled])

  const quickPhrase = useCallback((type: 
    | 'start_cook' | 'good_job' | 'watch_heat' | 'need_flip' | 'hurry' | 'perfect' | 'oops' | 'well_done'
  ) => {
    const phrases: Record<string, string> = {
      start_cook: '开始做菜啦！大家准备好了吗？',
      good_job: '做得好！继续加油！',
      watch_heat: '注意火候哦！',
      need_flip: '该翻面啦！',
      hurry: '快一点，时间不多了！',
      perfect: '太完美了！',
      oops: '哎呀，小心一点~',
      well_done: '太棒了！完美收工！',
    }
    speak(phrases[type] || '')
  }, [speak])

  return { speak, cancel, quickPhrase, isSpeaking, isEnabled }
}
