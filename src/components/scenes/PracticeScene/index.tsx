// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { useRhythm } from '@/hooks/useRhythm'
import { useHeatControl } from '@/hooks/useHeatControl'
import { useSoundFX } from '@/hooks/useSoundFX'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { StarRating } from '@/components/common/StarRating'
import { ProgressBar } from '@/components/common/ProgressBar'
import type { PracticeType, PracticeRecord } from '@/types/game'
import { genId, formatTime, avg, clamp } from '@/utils/scoring'

type Page = 'select' | 'practice' | 'result'

interface PracticeResult {
  type: PracticeType
  totalScore: number
  accuracy: number
  stars: number
  roundScores: number[]
  durationSeconds: number
}

const practiceInfo: Record<PracticeType, {
  icon: string
  title: string
  description: string
  color: string
  bgColor: string
  tips: string[]
}> = {
  chop: {
    icon: '🔪',
    title: '切菜节奏练习',
    description: '练习看准时机下刀的感觉',
    color: '#FF9F43',
    bgColor: 'from-orange-100 to-amber-50',
    tips: [
      '盯着绿色的最佳区域，等指针到中间再点击',
      '不要着急，稳比快更重要',
      '试着找到节奏，每次都在同一个时机下手'
    ]
  },
  season: {
    icon: '🧂',
    title: '调味时机练习',
    description: '练习找到最佳调味时机',
    color: '#A29BFE',
    bgColor: 'from-purple-100 to-lavender-50',
    tips: [
      '金色区域是最佳时机，越接近中心分数越高',
      '指针会来回移动，预判它的位置',
      '不要太早也不要太晚，刚刚好才是真的好'
    ]
  },
  heat: {
    icon: '🔥',
    title: '火候控制练习',
    description: '练习观察温度、调整火力',
    color: '#FF6B6B',
    bgColor: 'from-red-100 to-orange-50',
    tips: [
      '温度会自己漂移，要随时关注',
      '绿色区域是安全区，尽量保持在里面',
      '慢慢调整，不要一下加太多火'
    ]
  }
}

// ==== 选择页 ====
const SelectPage: React.FC<{ onSelect: (type: PracticeType) => void }> = ({ onSelect }) => {
  const sound = useSoundFX()

  const handleSelect = (type: PracticeType) => {
    sound.playClick()
    onSelect(type)
  }

  const types: PracticeType[] = ['chop', 'season', 'heat']

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-happy text-3xl text-warm-500 mb-2">🎯 专项练习</h2>
        <p className="text-gray-500">选择你想练习的技能，多多练习就会越来越厉害哦！</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {types.map((type, idx) => {
          const info = practiceInfo[type]
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
            >
              <Card
                color={info.color}
                className={`cursor-pointer bg-gradient-to-br ${info.bgColor} hover:shadow-lg transition-all`}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(type)}
                  className="w-full text-left"
                >
                  <div className="text-6xl text-center mb-4">{info.icon}</div>
                  <h3 className="font-happy text-2xl text-center mb-2" style={{ color: info.color }}>
                    {info.title}
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    {info.description}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/80 text-gray-500">
                      点击开始练习 →
                    </span>
                  </div>
                </motion.button>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="text-center text-sm text-gray-400">
        💡 小提示：练习模式不会影响正式成绩，放心大胆地练吧！
      </div>
    </div>
  )
}

// ==== 切菜节奏练习游戏 ====
const ChopPracticeGame: React.FC<{
  onRoundComplete: (score: number) => void
  onAllComplete: (scores: number[]) => void
  currentRound: number
  totalRounds: number
}> = ({ onRoundComplete, onAllComplete, currentRound, totalRounds }) => {
  const sound = useSoundFX()
  const [scores, setScores] = useState<number[]>([])
  const [canHit, setCanHit] = useState(true)
  const scoresRef = useRef<number[]>([])

  const rhythm = useRhythm({
    durationMs: 3000,
    hitZones: [{ start: 0.4, end: 0.6, bonus: true }],
  })

  useEffect(() => {
    rhythm.start()
    return () => rhythm.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleHit = useCallback(() => {
    if (!canHit || !rhythm.isPlaying) return
    
    setCanHit(false)
    const result = rhythm.handleHit()
    
    if (result.accuracy === 'perfect' || result.accuracy === 'great') {
      sound.playChopPerfect()
    } else if (result.accuracy === 'good' || result.accuracy === 'ok') {
      sound.playChop()
    } else {
      sound.playFail()
    }

    const newScores = [...scoresRef.current, result.score]
    scoresRef.current = newScores
    setScores(newScores)
    onRoundComplete(result.score)

    if (newScores.length >= totalRounds) {
      rhythm.stop()
      setTimeout(() => {
        onAllComplete(newScores)
      }, 800)
    } else {
      setTimeout(() => setCanHit(true), 500)
    }
  }, [canHit, rhythm, sound, onRoundComplete, onAllComplete, totalRounds])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        handleHit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleHit])

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-happy">
          🔪 第 {Math.min(currentRound + 1, totalRounds)} / {totalRounds} 刀
        </div>
      </div>

      <div className="relative h-28 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100
                      rounded-3xl border-4 border-amber-200 overflow-hidden shadow-inner">
        <div 
          className="absolute inset-y-0 my-4 mx-12 rounded-xl"
          style={{
            left: `${rhythm.hitZones[0].start * 100}%`,
            right: `${(1 - rhythm.hitZones[0].end) * 100}%`,
            background: 'linear-gradient(90deg, rgba(127,209,174,0.5), rgba(127,209,174,0.8), rgba(127,209,174,0.5))',
            boxShadow: '0 0 30px rgba(127,209,174,0.4) inset'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-sm font-happy text-green-700">
            ✨ 最佳区域 ✨
          </div>
        </div>
        
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-2xl z-10"
          style={{
            left: `calc(${rhythm.position * 100}% - 24px)`,
            background: 'linear-gradient(135deg, #FFD93D, #FFB366)',
            boxShadow: '0 0 30px rgba(255,217,61,0.6), 0 6px 16px rgba(0,0,0,0.2)'
          }}
        >
          🔪
        </motion.div>

        <div className="absolute bottom-2 left-4 text-xl">🥕</div>
        <div className="absolute bottom-2 right-4 text-xl">🥕</div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: i < scores.length ? 1 : 0.8,
              opacity: i < scores.length ? 1 : 0.5
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-happy text-sm
              ${i < scores.length 
                ? scores[i] >= 80 
                  ? 'bg-mint-200 text-mint-700' 
                  : scores[i] >= 50 
                    ? 'bg-yolk-200 text-yolk-700' 
                    : 'bg-tomato-200 text-tomato-700'
                : 'bg-gray-100 text-gray-400'
              }`}
          >
            {i < scores.length ? scores[i] : '?'}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={canHit ? { scale: 1.05 } : undefined}
          whileTap={canHit ? { scale: 0.92, y: 4 } : undefined}
          onClick={handleHit}
          disabled={!canHit}
          className={`
            px-16 py-8 rounded-3xl font-happy text-3xl text-white shadow-candy
            bg-gradient-to-br from-orange-400 to-amber-500
            ${!canHit ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-center">
            <div>🔪 切！</div>
            <div className="text-sm opacity-80 font-body mt-1">（按空格 / 回车）</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

// ==== 调味时机练习游戏 ====
const SeasonPracticeGame: React.FC<{
  onRoundComplete: (score: number) => void
  onAllComplete: (scores: number[]) => void
  currentRound: number
  totalRounds: number
}> = ({ onRoundComplete, onAllComplete, currentRound, totalRounds }) => {
  const sound = useSoundFX()
  const [scores, setScores] = useState<number[]>([])
  const [canHit, setCanHit] = useState(true)
  const scoresRef = useRef<number[]>([])

  const rhythm = useRhythm({
    durationMs: 2500,
    hitZones: [{ start: 0.6, end: 0.85, bonus: true }],
  })

  useEffect(() => {
    rhythm.start()
    return () => rhythm.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleHit = useCallback(() => {
    if (!canHit || !rhythm.isPlaying) return
    
    setCanHit(false)
    const result = rhythm.handleHit()
    
    if (result.accuracy === 'perfect' || result.accuracy === 'great') {
      sound.playSeason()
    } else if (result.accuracy === 'good' || result.accuracy === 'ok') {
      sound.playWarn()
    } else {
      sound.playFail()
    }

    const newScores = [...scoresRef.current, result.score]
    scoresRef.current = newScores
    setScores(newScores)
    onRoundComplete(result.score)

    if (newScores.length >= totalRounds) {
      rhythm.stop()
      setTimeout(() => {
        onAllComplete(newScores)
      }, 800)
    } else {
      setTimeout(() => setCanHit(true), 600)
    }
  }, [canHit, rhythm, sound, onRoundComplete, onAllComplete, totalRounds])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        handleHit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleHit])

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-happy">
          🧂 第 {Math.min(currentRound + 1, totalRounds)} / {totalRounds} 次
        </div>
      </div>

      <div className="relative h-24 rounded-3xl bg-gradient-to-r from-cream-100 via-white to-cream-100
                      border-4 border-purple-200 overflow-hidden shadow-inner">
        <div 
          className="absolute inset-y-2 rounded-xl"
          style={{
            left: `${rhythm.hitZones[0].start * 100}%`,
            right: `${(1 - rhythm.hitZones[0].end) * 100}%`,
            background: 'linear-gradient(90deg, rgba(255,217,61,0.4), rgba(255,217,61,0.7), rgba(255,217,61,0.4))',
            boxShadow: '0 0 30px rgba(255,217,61,0.5) inset'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-sm font-happy text-amber-700">
            ✨ 最佳时机 ✨
          </div>
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-16 rounded-t-full"
          style={{
            left: `calc(${rhythm.position * 100}% - 20px)`,
            background: 'linear-gradient(135deg, #C9B1FF, #9B7ED6)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
            🧂
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: i < scores.length ? 1 : 0.8,
              opacity: i < scores.length ? 1 : 0.5
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-happy text-sm
              ${i < scores.length 
                ? scores[i] >= 80 
                  ? 'bg-mint-200 text-mint-700' 
                  : scores[i] >= 50 
                    ? 'bg-yolk-200 text-yolk-700' 
                    : 'bg-tomato-200 text-tomato-700'
                : 'bg-gray-100 text-gray-400'
              }`}
          >
            {i < scores.length ? scores[i] : '?'}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={canHit ? { scale: 1.05 } : undefined}
          whileTap={canHit ? { scale: 0.92, y: 4 } : undefined}
          onClick={handleHit}
          disabled={!canHit}
          className={`
            px-16 py-8 rounded-3xl font-happy text-3xl text-white shadow-candy
            bg-gradient-to-br from-purple-400 to-indigo-500
            ${!canHit ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-center">
            <div>🧂 撒！</div>
            <div className="text-sm opacity-80 font-body mt-1">（按空格 / 回车）</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

// ==== 火候控制练习游戏 ====
const HeatPracticeGame: React.FC<{
  onComplete: (score: number, durationSeconds: number) => void
  targetSeconds: number
}> = ({ onComplete, targetSeconds }) => {
  const sound = useSoundFX()
  const heat = useHeatControl({
    initial: 50,
    driftRate: 0.5,
    safeZone: [35, 70],
  })

  const [timeLeft, setTimeLeft] = useState(targetSeconds)
  const [safeTime, setSafeTime] = useState(0)
  const [started, setStarted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const completedRef = useRef(false)

  const startGame = useCallback(() => {
    setStarted(true)
    startTimeRef.current = Date.now()
    heat.startDrift()
    sound.playDing()

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          heat.stopDrift()
          return 0
        }
        return prev - 1
      })

      if (heat.inSafeZone) {
        setSafeTime(prev => prev + 1)
      }
    }, 1000)
  }, [heat, sound])

  useEffect(() => {
    if (timeLeft === 0 && started && !completedRef.current) {
      completedRef.current = true
      const accuracy = Math.round((safeTime / targetSeconds) * 100)
      const score = Math.round(30 + accuracy * 0.7)
      sound.playSuccess()
      setTimeout(() => {
        onComplete(score, targetSeconds)
      }, 1000)
    }
  }, [timeLeft, started, safeTime, targetSeconds, sound, onComplete])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      heat.stopDrift()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleIncrease = () => {
    heat.increase(8)
    sound.playClick()
  }

  const handleDecrease = () => {
    heat.decrease(8)
    sound.playClick()
  }

  if (!started) {
    return (
      <div className="space-y-6 py-8 text-center">
        <div className="text-6xl mb-4">🔥</div>
        <h3 className="font-happy text-2xl text-red-500">火候控制练习</h3>
        <p className="text-gray-600">
          在 {targetSeconds} 秒内，尽量将温度保持在绿色安全区
        </p>
        <div className="flex justify-center">
          <Button variant="success" size="xl" onClick={startGame} leftIcon="🔥">
            开始练习
          </Button>
        </div>
      </div>
    )
  }

  const safePercent = Math.round((safeTime / targetSeconds) * 100)
  const heatPercent = heat.heat

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 font-happy">
          🔥 火候练习
        </div>
        <div className="font-happy text-2xl" style={{ color: heat.status.color }}>
          {heat.status.emoji} {heat.status.label}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-100 text-cream-700 font-happy">
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="relative h-32 rounded-3xl overflow-hidden border-4 border-orange-200 shadow-inner">
        <div 
          className="absolute inset-y-0 left-0 transition-all duration-200"
          style={{
            width: `${heatPercent}%`,
            background: `linear-gradient(90deg, 
              ${heatPercent < 35 ? '#74B9FF' : heatPercent <= 70 ? '#81ECEC' : '#FF7675'},
              ${heatPercent < 35 ? '#0984E3' : heatPercent <= 70 ? '#00B894' : '#D63031'}
            )`
          }}
        />
        
        <div 
          className="absolute top-0 bottom-0 border-l-4 border-r-4 border-dashed border-green-400 z-10"
          style={{
            left: '35%',
            right: '30%',
          }}
        >
          <div className="absolute inset-0 bg-green-300/20" />
        </div>

        <motion.div
          animate={{ 
            scale: heat.inSafeZone ? [1, 1.1, 1] : 1,
            opacity: heat.inSafeZone ? 1 : 0.7
          }}
          transition={{ repeat: heat.inSafeZone ? Infinity : 0, duration: 0.8 }}
          className="absolute top-1/2 -translate-y-1/2 text-4xl z-20"
          style={{ left: `calc(${heatPercent}% - 20px)` }}
        >
          🌡️
        </motion.div>

        <div className="absolute bottom-2 left-4 text-xs text-gray-600 z-10">
          0°
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-green-700 font-bold z-10">
          安全区
        </div>
        <div className="absolute bottom-2 right-4 text-xs text-gray-600 z-10">
          100°
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar 
          value={safePercent} 
          color="#00B894" 
          showLabel 
          label="安全时间占比"
        />
        <p className="text-center text-sm text-gray-500">
          已保持安全区 {safeTime} / {targetSeconds} 秒
        </p>
      </div>

      <div className="flex justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleDecrease}
          className="w-24 h-24 rounded-3xl font-happy text-3xl text-white shadow-candy
                     bg-gradient-to-br from-sky-400 to-blue-500"
        >
          <div className="text-center">
            <div>❄️</div>
            <div className="text-sm mt-1">降温</div>
          </div>
        </motion.button>

        <div className="flex items-center justify-center w-32">
          <div className="text-center">
            <div className="text-4xl font-happy" style={{ color: heat.status.color }}>
              {Math.round(heat.heat)}°
            </div>
            <div className="text-xs text-gray-400">当前温度</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleIncrease}
          className="w-24 h-24 rounded-3xl font-happy text-3xl text-white shadow-candy
                     bg-gradient-to-br from-orange-400 to-red-500"
        >
          <div className="text-center">
            <div>🔥</div>
            <div className="text-sm mt-1">升温</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

// ==== 练习进行页 ====
const PracticePage: React.FC<{
  practiceType: PracticeType
  onBack: () => void
  onFinish: (result: PracticeResult) => void
}> = ({ practiceType, onBack, onFinish }) => {
  const sound = useSoundFX()
  const info = practiceInfo[practiceType]
  const [currentRound, setCurrentRound] = useState(0)
  const [roundScores, setRoundScores] = useState<number[]>([])
  const startTimeRef = useRef(Date.now())

  const totalRounds = practiceType === 'heat' ? 1 : practiceType === 'chop' ? 5 : 3
  const heatTargetSeconds = 30

  const handleRoundComplete = useCallback((score: number) => {
    setCurrentRound(prev => prev + 1)
    setRoundScores(prev => [...prev, score])
  }, [])

  const handleAllComplete = useCallback((scores: number[]) => {
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
    const totalScore = Math.round(avg(scores))
    const accuracy = totalScore
    
    let stars = 1
    if (totalScore >= 40) stars = 2
    if (totalScore >= 55) stars = 3
    if (totalScore >= 72) stars = 4
    if (totalScore >= 88) stars = 5

    onFinish({
      type: practiceType,
      totalScore,
      accuracy,
      stars,
      roundScores: scores,
      durationSeconds,
    })
  }, [practiceType, onFinish])

  const handleHeatComplete = useCallback((score: number, durationSeconds: number) => {
    let stars = 1
    if (score >= 40) stars = 2
    if (score >= 55) stars = 3
    if (score >= 72) stars = 4
    if (score >= 88) stars = 5

    onFinish({
      type: practiceType,
      totalScore: score,
      accuracy: score,
      stars,
      roundScores: [score],
      durationSeconds,
    })
  }, [practiceType, onFinish])

  const handleEndEarly = () => {
    if (confirm('确定要结束练习吗？本次练习不会保存成绩')) {
      sound.playClick()
      onBack()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (confirm('确定要返回吗？当前进度会丢失')) {
              sound.playClick()
              onBack()
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
                     bg-white/80 hover:bg-white text-gray-600 font-happy border-2 border-cream-200
                     transition-all hover:border-warm-300"
        >
          ← 返回
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.icon}</span>
          <h2 className="font-happy text-xl" style={{ color: info.color }}>
            {info.title}
          </h2>
        </div>

        <div className="w-[88px]"></div>
      </div>

      <Card color={info.color}>
        <AnimatePresence mode="wait">
          {practiceType === 'chop' && (
            <motion.div
              key="chop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ChopPracticeGame
                onRoundComplete={handleRoundComplete}
                onAllComplete={handleAllComplete}
                currentRound={currentRound}
                totalRounds={totalRounds}
              />
            </motion.div>
          )}

          {practiceType === 'season' && (
            <motion.div
              key="season"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SeasonPracticeGame
                onRoundComplete={handleRoundComplete}
                onAllComplete={handleAllComplete}
                currentRound={currentRound}
                totalRounds={totalRounds}
              />
            </motion.div>
          )}

          {practiceType === 'heat' && (
            <motion.div
              key="heat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HeatPracticeGame
                onComplete={handleHeatComplete}
                targetSeconds={heatTargetSeconds}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {practiceType !== 'heat' && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            进度：{Math.min(currentRound, totalRounds)} / {totalRounds} 轮
          </div>
          <Button variant="ghost" size="sm" onClick={handleEndEarly}>
            结束练习
          </Button>
        </div>
      )}
    </div>
  )
}

// ==== 结果页 ====
const ResultPage: React.FC<{
  result: PracticeResult
  onRetry: () => void
  onBack: () => void
}> = ({ result, onRetry, onBack }) => {
  const { addPracticeRecord } = useGame()
  const sound = useSoundFX()
  const info = practiceInfo[result.type]
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const record: PracticeRecord = {
      id: genId(),
      type: result.type,
      score: result.totalScore,
      accuracy: result.accuracy,
      stars: result.stars,
      date: new Date().toISOString(),
      durationSeconds: result.durationSeconds,
    }
    addPracticeRecord(record)
    sound.playSuccess()
  }, [result, addPracticeRecord, sound])

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const tip = info.tips[Math.floor(Math.random() * info.tips.length)]

  return (
    <div className="space-y-8 py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">{info.icon}</div>
        <h2 className="font-happy text-3xl mb-2" style={{ color: info.color }}>
          练习完成！
        </h2>
        <p className="text-gray-500">做得不错，继续加油哦~</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <StarRating stars={result.stars} size="xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card color={info.color} className="text-center">
          <div className="grid grid-cols-2 gap-6 py-2">
            <div>
              <div className="text-4xl font-happy" style={{ color: info.color }}>
                {result.totalScore}
              </div>
              <div className="text-sm text-gray-500 mt-1">总分</div>
            </div>
            <div>
              <div className="text-4xl font-happy text-mint-500">
                {result.accuracy}%
              </div>
              <div className="text-sm text-gray-500 mt-1">准确度</div>
            </div>
          </div>

          {result.roundScores.length > 1 && (
            <div className="mt-6 pt-6 border-t-2 border-dashed border-cream-200">
              <h4 className="font-happy text-lg text-gray-700 mb-3">各轮成绩</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {result.roundScores.map((score, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 300 }}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center font-happy text-base
                      ${score >= 80 
                        ? 'bg-mint-100 text-mint-600' 
                        : score >= 50 
                          ? 'bg-yolk-100 text-yolk-600' 
                          : 'bg-tomato-100 text-tomato-500'
                      }`}
                  >
                    {score}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t-2 border-dashed border-cream-200">
            <div className="bg-cream-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-left">
                  <h4 className="font-happy text-base text-warm-600 mb-1">小提示</h4>
                  <p className="text-sm text-gray-600">{tip}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="flex gap-4 justify-center flex-wrap"
      >
        <Button variant="primary" size="lg" onClick={onRetry} leftIcon="🔄">
          再来一次
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack} leftIcon="📋">
          返回选择
        </Button>
      </motion.div>

      <div className="text-center text-xs text-gray-400">
        📝 练习记录已保存，不会影响正式成绩
      </div>
    </div>
  )
}

// ==== 主场景组件 ====
const PracticeScene: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page>('select')
  const [practiceType, setPracticeType] = useState<PracticeType | null>(null)
  const [finalResult, setFinalResult] = useState<PracticeResult | null>(null)

  const handleSelect = (type: PracticeType) => {
    setPracticeType(type)
    setPage('practice')
  }

  const handleBackToSelect = () => {
    setPage('select')
    setPracticeType(null)
    setFinalResult(null)
  }

  const handleFinish = (result: PracticeResult) => {
    setFinalResult(result)
    setPage('result')
  }

  const handleRetry = () => {
    setFinalResult(null)
    setPage('practice')
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-cream-50 to-warm-50">
      <header className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-white/80 hover:bg-white text-gray-600 font-happy border-2 border-cream-200
                       transition-all hover:border-warm-300"
          >
            ← 返回主页
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            <h1 className="font-happy text-2xl md:text-3xl text-warm-500">
              专项练习
            </h1>
          </div>
          <div className="w-[100px]"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {page === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SelectPage onSelect={handleSelect} />
            </motion.div>
          )}

          {page === 'practice' && practiceType && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PracticePage
                practiceType={practiceType}
                onBack={handleBackToSelect}
                onFinish={handleFinish}
              />
            </motion.div>
          )}

          {page === 'result' && finalResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultPage
                result={finalResult}
                onRetry={handleRetry}
                onBack={handleBackToSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default PracticeScene
