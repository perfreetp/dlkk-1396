// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ProgressBar } from '@/components/common/ProgressBar'
import { TimerDisplay } from '@/components/common/TimerDisplay'
import { useSpeechBubble } from '@/components/common/SpeechBubble'
import { useSoundFX } from '@/hooks/useSoundFX'
import { useSpeech } from '@/hooks/useSpeech'
import { getPlayerLabel, formatTime } from '@/utils/scoring'
import { INCIDENTS_TEMPLATES } from '@/data/recipes'
import type { Player, Incident, RecipeTask } from '@/types/game'

// ==== 火候条组件 ====
const HeatMeter: React.FC<{
  heat: number
  safeZone: [number, number]
  status: { label: string; color: string; emoji: string }
  onIncrease: () => void
  onDecrease: () => void
  controlPlayer: Player
}> = ({ heat, safeZone, status, onIncrease, onDecrease, controlPlayer }) => {
  const gradient = `linear-gradient(to top, 
    #74B9FF 0%, 
    #7FD1AE ${safeZone[0] - 10}%, 
    #7FD1AE ${safeZone[0]}%, 
    #FFD93D ${safeZone[1]}%, 
    #FF9933 ${safeZone[1] + 15}%, 
    #FF6B6B 100%)`

  return (
    <div className="bg-white/60 rounded-3xl p-4 border-2 border-warm-200">
      <div className="text-center mb-3">
        <p className="font-happy text-sm text-gray-500">火候监控</p>
        <p className={`font-happy text-lg ${status.color}`}>
          {status.emoji} {status.label}
        </p>
      </div>
      
      <div className="flex justify-center gap-3 items-end">
        <div className="flex flex-col justify-between h-56 pb-1">
          <button
            onClick={onIncrease}
            className="w-12 h-12 rounded-2xl bg-tomato-400 text-white text-2xl shadow-md
                       hover:bg-tomato-500 active:scale-95 transition-all font-bold"
          >
            🔥
          </button>
          <div className="text-xs text-center text-gray-400 font-happy">
            加火
            <br />
            <span className={controlPlayer === 'p1' ? 'text-sky-500' : 'text-pink-500'}>
              {controlPlayer === 'p1' ? 'W键' : '↑键'}
            </span>
          </div>
        </div>
        
        <div className="relative w-20 h-56 rounded-b-full overflow-hidden border-4 border-amber-300 shadow-inner">
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: `${heat}%` }}
            transition={{ duration: 0.3 }}
            style={{ background: gradient }}
          />
          <div 
            className="absolute left-0 right-0 border-t-2 border-b-2 border-dashed border-white/80"
            style={{ 
              bottom: `${safeZone[0]}%`,
              height: `${safeZone[1] - safeZone[0]}%`,
              background: 'rgba(255,255,255,0.15)',
            }}
          />
          <div 
            className="absolute left-0 right-0 text-center text-xs text-white font-happy"
            style={{ bottom: `${(safeZone[0] + safeZone[1]) / 2 - 4}%` }}
          >
            ✓
          </div>
        </div>

        <div className="flex flex-col justify-between h-56 pb-1">
          <button
            onClick={onDecrease}
            className="w-12 h-12 rounded-2xl bg-sky-400 text-white text-2xl shadow-md
                       hover:bg-sky-500 active:scale-95 transition-all font-bold"
          >
            ❄️
          </button>
          <div className="text-xs text-center text-gray-400 font-happy">
            减火
            <br />
            <span className={controlPlayer === 'p1' ? 'text-sky-500' : 'text-pink-500'}>
              {controlPlayer === 'p1' ? 'S键' : '↓键'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==== 翻炒区域组件 ====
const StirringPan: React.FC<{
  isStirring: { p1: boolean; p2: boolean }
  heat: number
  recipeEmoji: string
  stepTitle: string
}> = ({ isStirring, heat, recipeEmoji, stepTitle }) => {
  const stirring = isStirring.p1 || isStirring.p2
  const overheat = heat > 80
  const toolow = heat < 20

  return (
    <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl p-6 border-4 border-stone-300 relative overflow-hidden">
      <p className="text-center font-happy text-gray-600 mb-4">🍳 烹饪中：{stepTitle}</p>
      
      <div className="relative w-56 h-56 mx-auto">
        {/* 灶台火圈 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: overheat 
              ? ['radial-gradient(circle, #FF6B6B 0%, #FF9933 40%, transparent 70%)',
                 'radial-gradient(circle, #FF3333 0%, #FF6B6B 40%, transparent 70%)']
              : toolow
              ? ['radial-gradient(circle, #74B9FF 0%, #7FD1AE 40%, transparent 70%)',
                 'radial-gradient(circle, #7FD1AE 0%, #A8E4CC 40%, transparent 70%)']
              : ['radial-gradient(circle, #FFD93D 0%, #FFB366 40%, transparent 70%)',
                 'radial-gradient(circle, #FF9933 0%, #FFD93D 40%, transparent 70%)'],
            scale: heat > 60 ? [1, 1.08, 1] : [0.9, 1, 0.9],
          }}
          transition={{ duration: heat > 60 ? 0.3 : 0.8, repeat: Infinity }}
        />
        
        {/* 平底锅 */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 shadow-2xl 
                        border-4 border-stone-600 overflow-hidden">
          {/* 食材 */}
          <motion.div
            className="absolute inset-4 flex items-center justify-center text-6xl"
            animate={stirring ? {
              rotate: [0, 8, -8, 5, -3, 0],
              x: [0, 5, -5, 3, -2, 0],
              y: [0, -3, 2, -1, 3, 0],
            } : {
              y: [0, -2, 0],
            }}
            transition={{ 
              duration: stirring ? 0.6 : 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {recipeEmoji}
          </motion.div>
          
          {/* 蒸汽/冒烟效果 */}
          {heat > 40 && (
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl opacity-60"
              animate={{
                y: [-10, -40],
                opacity: [0.6, 0],
                scale: [0.8, 1.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              💨
            </motion.div>
          )}
          {overheat && (
            <motion.div
              className="absolute top-1 right-4 text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              🔥
            </motion.div>
          )}
        </div>
        
        {/* 翻炒指示 */}
        <AnimatePresence>
          {stirring && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                         bg-mint-400 text-white px-4 py-1 rounded-full font-happy text-sm shadow-lg"
            >
              🥄 正在翻炒
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ==== 翻炒控制按钮 ====
const StirControl: React.FC<{
  player: Player
  isStirring: boolean
  onStart: () => void
  onEnd: () => void
}> = ({ player, isStirring, onStart, onEnd }) => {
  const pressKey = player === 'p1' ? 'Q' : 'P'
  const info = getPlayerLabel(player)

  return (
    <motion.button
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      className={`
        w-full py-8 rounded-3xl font-happy text-xl text-white shadow-candy select-none
        ${player === 'p1' 
          ? 'bg-gradient-to-br from-sky-400 to-blue-500' 
          : 'bg-gradient-to-br from-pink-400 to-rose-500'}
        ${isStirring ? 'ring-4 ring-yolk-400 ring-opacity-70' : ''}
      `}
    >
      <div className="text-center">
        <div className={`${info.color} inline-block px-3 py-1 rounded-xl mb-2 text-sm`}>
          {info.short}
        </div>
        <div className="text-4xl mb-1">🥄</div>
        <div>{isStirring ? '翻炒中...' : '按住翻炒'}</div>
        <div className="text-xs opacity-80 mt-1 font-body">（按键盘 {pressKey}）</div>
      </div>
    </motion.button>
  )
}

// ==== 小状况弹窗 ====
const IncidentPopup: React.FC<{
  incident: Incident
  progress: { p1: boolean; p2: boolean }
  timeLeft: number
  onResolve: (player: Player) => void
}> = ({ incident, progress, timeLeft, onResolve }) => {
  const isBoth = incident.actionRequired === 'both'
  const p1Required = incident.actionRequired === 'p1' || incident.actionRequired === 'both' || incident.actionRequired === 'any'
  const p2Required = incident.actionRequired === 'p2' || incident.actionRequired === 'both' || incident.actionRequired === 'any'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        x: [0, -6, 6, -3, 3, 0],
      }}
      transition={{ x: { duration: 0.4, repeat: Infinity, repeatDelay: 1 } }}
      className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-tomato-400 max-w-md mx-auto
                 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 bg-tomato-400 text-white px-4 py-2 rounded-bl-2xl font-happy">
        ⏰ {timeLeft}s
      </div>
      
      <div className="text-center mb-4">
        <motion.div
          animate={{ rotate: [0, -20, 20, -10, 10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
          className="text-6xl mb-2"
        >
          {incident.emoji}
        </motion.div>
        <h3 className="font-happy text-2xl text-tomato-500 mb-1">{incident.title}</h3>
        <p className="text-gray-600">{incident.description}</p>
        <p className="text-sm text-warm-500 mt-2 font-happy">💡 {incident.hint}</p>
      </div>

      <ProgressBar 
        value={(timeLeft / incident.timeLimit) * 100} 
        color="#FF6B6B" 
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => p1Required && onResolve('p1')}
          disabled={!p1Required || (isBoth && progress.p1)}
          className={`
            py-4 rounded-2xl font-happy text-white transition-all
            ${p1Required ? 'bg-sky-400 hover:bg-sky-500 active:scale-95' : 'bg-gray-200'}
            ${isBoth && progress.p1 ? 'ring-4 ring-mint-400 opacity-80' : ''}
            ${!p1Required ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        >
          {isBoth && progress.p1 ? '✓ ' : ''}{getPlayerLabel('p1').short} 处理
          {incident.requiresCooperation && isBoth && !progress.p1 && p1Required && (
            <div className="text-xs opacity-80 mt-1">（按 E 键）</div>
          )}
        </button>
        <button
          onClick={() => p2Required && onResolve('p2')}
          disabled={!p2Required || (isBoth && progress.p2)}
          className={`
            py-4 rounded-2xl font-happy text-white transition-all
            ${p2Required ? 'bg-pink-400 hover:bg-pink-500 active:scale-95' : 'bg-gray-200'}
            ${isBoth && progress.p2 ? 'ring-4 ring-mint-400 opacity-80' : ''}
            ${!p2Required ? 'opacity-40 cursor-not-allowed' : ''}
          `}
        >
          {isBoth && progress.p2 ? '✓ ' : ''}{getPlayerLabel('p2').short} 处理
          {incident.requiresCooperation && isBoth && !progress.p2 && p2Required && (
            <div className="text-xs opacity-80 mt-1">（按 O 键）</div>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ==== 灶台任务执行组件（和备菜台复用逻辑） ====
const CookTaskExecutor: React.FC = () => {
  const { state, dispatch } = useGame()
  const { selectedRecipe, mode, taskAssignments, currentStepIndex, stepsCompleted } = state
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [showSeasonGame, setShowSeasonGame] = useState(false)
  const [showChopGame, setShowChopGame] = useState(false)
  const [showSimpleTask, setShowSimpleTask] = useState(false)
  const showBubble = useSpeechBubble()
  const sound = useSoundFX()
  const speech = useSpeech()
  const navigate = useNavigate()

  if (!selectedRecipe) return null

  const cookSteps = selectedRecipe.steps.filter(s => s.phase === 'cook')
  const currentStep = cookSteps[currentStepIndex - selectedRecipe.steps.findIndex(s => s.phase === 'cook')] || cookSteps[0]
  const currentTask = currentStep?.tasks[currentTaskIdx]
  const currentPlayer: Player = 
    mode === 'single' ? 'p1' : (taskAssignments[currentTask?.id || ''] || 'p1')

  const allCookStepsDone = useMemo(() => {
    const cookIndices = selectedRecipe.steps
      .map((s, i) => ({ step: s, idx: i }))
      .filter(x => x.step.phase === 'cook')
      .map(x => x.idx)
    return cookIndices.every(i => stepsCompleted[i])
  }, [selectedRecipe, stepsCompleted])

  const nextTask = useCallback(() => {
    if (!currentStep) return
    const cookStartIdx = selectedRecipe.steps.findIndex(s => s.id === cookSteps[0].id)
    const stepIdxInCook = currentStepIndex - cookStartIdx
    
    if (currentTaskIdx < currentStep.tasks.length - 1) {
      setCurrentTaskIdx(prev => prev + 1)
      setShowSeasonGame(false)
      setShowChopGame(false)
      setShowSimpleTask(false)
    } else {
      const globalStepIdx = selectedRecipe.steps.findIndex(s => s.id === currentStep.id)
      dispatch({ type: 'COMPLETE_STEP', index: globalStepIdx })
      
      if (stepIdxInCook < cookSteps.length - 1) {
        dispatch({ type: 'SET_CURRENT_STEP', index: currentStepIndex + 1 })
        setCurrentTaskIdx(0)
        showBubble(`烹饪步骤 ${stepIdxInCook + 1} 完成！`, 'success')
        speech.quickPhrase('good_job')
        setShowSeasonGame(false)
        setShowChopGame(false)
        setShowSimpleTask(false)
      } else {
        // 全部完成，去评分
        dispatch({ type: 'PAUSE_TIMER' })
        dispatch({ type: 'SET_SCENE', scene: 'result' })
        speech.quickPhrase('well_done')
        setTimeout(() => navigate('/result'), 500)
      }
    }
  }, [currentStep, currentTaskIdx, currentStepIndex, cookSteps.length, selectedRecipe,
      dispatch, navigate, showBubble, speech])

  const onTaskComplete = useCallback((_score: number) => {
    sound.playClick()
    setShowSeasonGame(false)
    setShowChopGame(false)
    setShowSimpleTask(false)
    setTimeout(nextTask, 500)
  }, [sound, nextTask])

  const handleStartTask = () => {
    if (!currentTask) return
    sound.playDing()
    if (currentTask.type === 'season') setShowSeasonGame(true)
    else if (currentTask.type === 'chop') setShowChopGame(true)
    else setShowSimpleTask(true)
  }

  if (allCookStepsDone) {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl mb-4"
        >
          ✨
        </motion.div>
        <h3 className="font-happy text-3xl text-mint-500 mb-2">烹饪完成！</h3>
        <p className="text-gray-600">准备上菜评分吧~</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-cream-50 rounded-2xl p-4 border-2 border-warm-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 rounded-full bg-mint-400 text-white 
                          flex items-center justify-center font-happy text-xl shrink-0">
            {selectedRecipe.steps.findIndex(s => s.id === currentStep?.id) + 1}
          </span>
          <div>
            <h4 className="font-happy text-2xl text-gray-800">{currentStep?.title}</h4>
            <p className="text-gray-600 text-sm">{currentStep?.description}</p>
          </div>
        </div>
        <div className="ml-13 pl-[52px]">
          <div className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-cream-200">
            <div className="flex items-center gap-2">
              <span className={`${getPlayerLabel(currentPlayer).color} px-2 py-0.5 rounded-lg text-sm font-happy`}>
                {getPlayerLabel(currentPlayer).short}
              </span>
              <span className="font-happy text-lg">{currentTask?.name}</span>
              <span className="text-xs text-gray-400">
                任务 {currentTaskIdx + 1}/{currentStep?.tasks.length}
              </span>
            </div>
            {!showSeasonGame && !showChopGame && !showSimpleTask && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartTask}
                leftIcon="▶️"
              >
                开始
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSeasonGame && currentTask && (
          <div key="season">
            {/* 简化版调味游戏 - 导入使用SeasonTimingGame需要移动代码，这里使用简化内联版 */}
            <MiniSeasonGame task={currentTask} player={currentPlayer} onComplete={onTaskComplete} />
          </div>
        )}
        {showChopGame && currentTask && (
          <div key="chop">
            <MiniChopGame task={currentTask} player={currentPlayer} onComplete={onTaskComplete} />
          </div>
        )}
        {showSimpleTask && currentTask && (
          <div key="simple">
            <MiniSimpleTask task={currentTask} player={currentPlayer} onComplete={onTaskComplete} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 简化版的子游戏组件
// @ts-ignore - 简化版本，避免循环依赖
const MiniSeasonGame: React.FC<{task: RecipeTask, player: Player, onComplete: (s: number) => void}> = 
  ({ task, player, onComplete }) => {
    const [done, setDone] = useState(false)
    const sound = useSoundFX()
    return (
      <Card>
        <p className="font-happy text-center text-xl mb-4">🧂 {task.name}</p>
        <Button
          fullWidth
          variant="success"
          size="lg"
          disabled={done}
          onClick={() => {
            setDone(true)
            const s = 70 + Math.round(Math.random() * 30)
            sound.playSeason()
            setTimeout(() => onComplete(s), 500)
          }}
        >
          {done ? '✅ 完成' : '点击完成调味'}
        </Button>
      </Card>
    )
  }

const MiniChopGame: React.FC<{task: RecipeTask, player: Player, onComplete: (s: number) => void}> = 
  ({ task, player, onComplete }) => {
    const [done, setDone] = useState(false)
    const sound = useSoundFX()
    return (
      <Card>
        <p className="font-happy text-center text-xl mb-4">🔪 {task.name}</p>
        <Button
          fullWidth
          variant="primary"
          size="lg"
          disabled={done}
          onClick={() => {
            setDone(true)
            const s = 70 + Math.round(Math.random() * 30)
            sound.playChop()
            setTimeout(() => onComplete(s), 500)
          }}
        >
          {done ? '✅ 完成' : '点击完成切菜'}
        </Button>
      </Card>
    )
  }

const MiniSimpleTask: React.FC<{task: RecipeTask, player: Player, onComplete: (s: number) => void}> = 
  ({ task, player, onComplete }) => {
    const [progress, setProgress] = useState(0)
    const [done, setDone] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const sound = useSoundFX()
    const stop = () => { if (intervalRef.current) clearInterval(intervalRef.current) }

    useEffect(() => () => stop(), [])

    const start = () => {
      if (done) return
      stop()
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100 && !done) {
            setDone(true)
            stop()
            const s = 75 + Math.round(Math.random() * 25)
            sound.playSuccess()
            setTimeout(() => onComplete(s), 500)
            return 100
          }
          return Math.min(p + 3, 100)
        })
      }, 60)
    }

    return (
      <Card>
        <p className="font-happy text-center text-xl mb-3">🥄 {task.name}</p>
        <ProgressBar value={progress} color="#FFB366" />
        <Button
          fullWidth
          variant="info"
          size="lg"
          disabled={done}
          onMouseDown={start}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchEnd={stop}
        >
          {done ? '✅ 完成' : '按住持续操作'}
        </Button>
      </Card>
    )
  }

// ==== 主场景组件 ====
const CookScene: React.FC = () => {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const { 
    selectedRecipe, mode, timer, activeIncident, 
    incidentProgress, heatLevel, stepsCompleted 
  } = state
  const showBubble = useSpeechBubble()
  const sound = useSoundFX()
  const speech = useSpeech()

  // 火候状态
  const safeZone: [number, number] = [35, 70]
  const [heat, setHeat] = useState(heatLevel || 50)
  const [isStirring, setIsStirring] = useState({ p1: false, p2: false })
  const [incidentTimeLeft, setIncidentTimeLeft] = useState(0)
  const incidentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastIncidentAtRef = useRef(Date.now())

  const heatStatus = useMemo(() => {
    if (heat < 20) return { label: '火候太小', color: 'text-sky-500', emoji: '❄️' }
    if (heat < safeZone[0]) return { label: '温度偏低', color: 'text-sky-400', emoji: '🥶' }
    if (heat <= safeZone[1]) return { label: '火候刚好', color: 'text-mint-500', emoji: '✅' }
    if (heat < 85) return { label: '温度偏高', color: 'text-warm-500', emoji: '⚠️' }
    return { label: '要糊了！', color: 'text-tomato-500', emoji: '🔥' }
  }, [heat, safeZone])

  // 共享计时器
  useEffect(() => {
    if (timer.isRunning && timer.remainingSeconds > 0) {
      const id = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' })
      }, 1000)
      return () => clearInterval(id)
    }
  }, [timer.isRunning, timer.remainingSeconds, dispatch])

  // 启动计时器（首次进入）
  useEffect(() => {
    if (!timer.isRunning && timer.remainingSeconds === timer.totalSeconds) {
      dispatch({ type: 'START_TIMER' })
      speech.quickPhrase('start_cook')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 火候自动漂移
  useEffect(() => {
    const id = setInterval(() => {
      setHeat(prev => {
        const drift = (Math.random() - 0.45) * 5
        const next = Math.max(0, Math.min(100, prev + drift))
        dispatch({ type: 'SET_HEAT', level: Math.round(next) })
        return next
      })
    }, 700)
    return () => clearInterval(id)
  }, [dispatch])

  // 火候警告语音
  useEffect(() => {
    if (heat > 85 && Math.random() < 0.3) {
      speech.quickPhrase('watch_heat')
    }
    if (timer.remainingSeconds === 10 && timer.isRunning) {
      speech.quickPhrase('hurry')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heat > 85, timer.remainingSeconds === 10])

  // 翻炒质量记录
  useEffect(() => {
    const interval = setInterval(() => {
      const stirring = isStirring.p1 || isStirring.p2
      const inSafe = heat >= safeZone[0] && heat <= safeZone[1]
      let quality = 50
      if (stirring) quality += 20
      if (inSafe) quality += 20
      if (stirring && inSafe) quality += 10
      dispatch({ type: 'ADD_STIR_QUALITY', quality: Math.min(100, quality) })
    }, 1500)
    return () => clearInterval(interval)
  }, [isStirring, heat, safeZone, dispatch])

  // 时间到
  useEffect(() => {
    if (timer.remainingSeconds === 0 && timer.isRunning) {
      dispatch({ type: 'PAUSE_TIMER' })
      sound.playDing()
      showBubble('时间到！进入评分环节~', 'success')
      setTimeout(() => navigate('/result'), 1200)
    }
  }, [timer.remainingSeconds, timer.isRunning, dispatch, sound, showBubble, navigate])

  // 随机触发小状况
  useEffect(() => {
    if (activeIncident) return
    if (!timer.isRunning) return
    if (Date.now() - lastIncidentAtRef.current < 12000) return
    if (Math.random() > 0.008) return
    
    const template = INCIDENTS_TEMPLATES[Math.floor(Math.random() * INCIDENTS_TEMPLATES.length)]
    const incident: Incident = {
      ...template,
      id: Math.random().toString(36).slice(2),
    }
    lastIncidentAtRef.current = Date.now()
    dispatch({ type: 'TRIGGER_INCIDENT', incident })
    setIncidentTimeLeft(incident.timeLimit)
    sound.playWarn()
    showBubble(`⚠️ ${incident.title}`, 'warning')
    speech.speak(incident.title)

    // 倒计时
    if (incidentTimerRef.current) clearInterval(incidentTimerRef.current)
    incidentTimerRef.current = setInterval(() => {
      setIncidentTimeLeft(t => {
        if (t <= 1) {
          if (incidentTimerRef.current) clearInterval(incidentTimerRef.current)
          dispatch({ type: 'FAIL_INCIDENT' })
          sound.playFail()
          showBubble('哎呀，没能及时处理...', 'error')
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (incidentTimerRef.current) clearInterval(incidentTimerRef.current)
    }
  }, [activeIncident, timer.isRunning, dispatch, sound, showBubble, speech])

  // 处理小状况
  const resolveIncident = useCallback((player: Player) => {
    if (!activeIncident) return
    dispatch({ type: 'RESOLVE_INCIDENT', player })
    
    if (activeIncident.actionRequired === 'both') {
      const newProgress = { ...incidentProgress, [player]: true }
      if (newProgress.p1 && newProgress.p2) {
        if (incidentTimerRef.current) clearInterval(incidentTimerRef.current)
        sound.playSuccess()
        showBubble(`完美配合！解决了${activeIncident.title} +${activeIncident.rewardScore}`, 'success')
      } else {
        sound.playClick()
      }
    } else {
      if (incidentTimerRef.current) clearInterval(incidentTimerRef.current)
      sound.playSuccess()
      showBubble(`搞定！${activeIncident.title}已处理 +${activeIncident.rewardScore}`, 'success')
    }
  }, [activeIncident, incidentProgress, dispatch, sound, showBubble])

  // 键盘控制
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 火候控制 - P1 W/S, P2 上下
      if (e.key === 'w' || e.key === 'W') setHeat(h => Math.min(100, h + 12))
      if (e.key === 's' || e.key === 'S') setHeat(h => Math.max(0, h - 12))
      if (e.key === 'ArrowUp') setHeat(h => Math.min(100, h + 12))
      if (e.key === 'ArrowDown') setHeat(h => Math.max(0, h - 12))
      
      // 翻炒 - P1 Q, P2 P
      if (e.key === 'q' || e.key === 'Q') setIsStirring(s => ({ ...s, p1: true }))
      if (e.key === 'p' || e.key === 'P') setIsStirring(s => ({ ...s, p2: true }))
      
      // 小状况 - P1 E, P2 O
      if (activeIncident && (e.key === 'e' || e.key === 'E')) resolveIncident('p1')
      if (activeIncident && (e.key === 'o' || e.key === 'O')) resolveIncident('p2')
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') setIsStirring(s => ({ ...s, p1: false }))
      if (e.key === 'p' || e.key === 'P') setIsStirring(s => ({ ...s, p2: false }))
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [activeIncident, resolveIncident])

  if (!selectedRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <p className="text-gray-500 mb-4 text-lg">还没开始备菜哦~</p>
          <Button onClick={() => navigate('/')} leftIcon="←">返回首页</Button>
        </Card>
      </div>
    )
  }

  const heatPlayer: Player = mode === 'single' ? 'p1' : 
    (stepsCompleted.filter(Boolean).length % 2 === 0 ? 'p1' : 'p2')

  return (
    <div className="min-h-screen p-3 md:p-6">
      {/* 顶部状态栏 */}
      <header className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white/80 rounded-3xl px-4 py-3 shadow-sm border-2 border-warm-200">
          <button
            onClick={() => {
              if (confirm('确定要返回吗？当前进度会丢失')) navigate('/')
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-600 
                       font-happy border-2 border-cream-200 hover:border-warm-300 bg-white"
          >
            ← 返回
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl">{selectedRecipe.emoji}</span>
            <div className="text-center">
              <h1 className="font-happy text-xl md:text-2xl" style={{ color: selectedRecipe.colorTheme }}>
                🔥 灶台烹饪中
              </h1>
              <p className="text-xs text-gray-500">
                模式：{mode === 'coop' ? '双人协作' : '单人练习'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TimerDisplay
              remaining={timer.remainingSeconds}
              total={timer.totalSeconds}
              isRunning={timer.isRunning}
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* 主区域 */}
      <main className="max-w-6xl mx-auto">
        <AnimatePresence>
          {activeIncident && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
              style={{ pointerEvents: 'auto' }}
            >
              <IncidentPopup
                incident={activeIncident}
                progress={incidentProgress}
                timeLeft={incidentTimeLeft}
                onResolve={resolveIncident}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧 P1 区 */}
          {mode === 'coop' && (
            <div className="lg:col-span-3">
              <div className="player-zone-p1 rounded-3xl p-4 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-p1 px-3 py-1 rounded-xl font-happy text-sm">P1 · 家长</span>
                </div>
                <div className="space-y-3">
                  <StirControl
                    player="p1"
                    isStirring={isStirring.p1}
                    onStart={() => setIsStirring(s => ({ ...s, p1: true }))}
                    onEnd={() => setIsStirring(s => ({ ...s, p1: false }))}
                  />
                  <div className="text-xs text-gray-500 text-center space-y-1 bg-white/60 rounded-xl p-2">
                    <p><span className="font-bold text-sky-500">Q</span> 翻炒 · <span className="font-bold text-sky-500">W/S</span> 调火</p>
                    <p><span className="font-bold text-sky-500">E</span> 处理小状况 · <span className="font-bold text-sky-500">A</span> 备菜</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 中央烹饪区 */}
          <div className={mode === 'coop' ? 'lg:col-span-6' : 'lg:col-span-8'}>
            <div className="space-y-4">
              <StirringPan
                isStirring={isStirring}
                heat={heat}
                recipeEmoji={selectedRecipe.emoji}
                stepTitle={selectedRecipe.steps.find((_, i) => !stepsCompleted[i])?.title || '收尾中...'}
              />
              <CookTaskExecutor />
            </div>
          </div>

          {/* 右侧火候 + P2区 */}
          <div className={mode === 'coop' ? 'lg:col-span-3 space-y-4' : 'lg:col-span-4 space-y-4'}>
            <HeatMeter
              heat={heat}
              safeZone={safeZone}
              status={heatStatus}
              onIncrease={() => setHeat(h => Math.min(100, h + 15))}
              onDecrease={() => setHeat(h => Math.max(0, h - 15))}
              controlPlayer={heatPlayer}
            />

            {mode === 'coop' && (
              <div className="player-zone-p2 rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-p2 px-3 py-1 rounded-xl font-happy text-sm">P2 · 孩子</span>
                </div>
                <div className="space-y-3">
                  <StirControl
                    player="p2"
                    isStirring={isStirring.p2}
                    onStart={() => setIsStirring(s => ({ ...s, p2: true }))}
                    onEnd={() => setIsStirring(s => ({ ...s, p2: false }))}
                  />
                  <div className="text-xs text-gray-500 text-center space-y-1 bg-white/60 rounded-xl p-2">
                    <p><span className="font-bold text-pink-500">P</span> 翻炒 · <span className="font-bold text-pink-500">↑/↓</span> 调火</p>
                    <p><span className="font-bold text-pink-500">O</span> 处理小状况 · <span className="font-bold text-pink-500">→</span> 备菜</p>
                  </div>
                </div>
              </div>
            )}

            {mode === 'single' && (
              <Card>
                <h4 className="font-happy text-lg text-warm-500 mb-2 text-center">单人操作说明</h4>
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex justify-between bg-cream-50 rounded-lg px-3 py-2">
                    <span>🔥 加/减火</span>
                    <span className="font-bold text-warm-500">W / S 或 ↑ / ↓</span>
                  </div>
                  <div className="flex justify-between bg-cream-50 rounded-lg px-3 py-2">
                    <span>🥄 翻炒（按住）</span>
                    <span className="font-bold text-warm-500">Q 或 P</span>
                  </div>
                  <div className="flex justify-between bg-cream-50 rounded-lg px-3 py-2">
                    <span>⚠️ 处理小状况</span>
                    <span className="font-bold text-warm-500">E 或 O</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* 底部时间信息 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/80 rounded-2xl p-3 text-center border-2 border-cream-200">
            <p className="text-xs text-gray-500">总时长</p>
            <p className="font-happy text-xl text-warm-500">{formatTime(timer.totalSeconds)}</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-3 text-center border-2 border-cream-200">
            <p className="text-xs text-gray-500">剩余</p>
            <p className={`font-happy text-xl ${
              timer.remainingSeconds <= 10 ? 'text-tomato-500 animate-pulse' : 'text-mint-500'
            }`}>{formatTime(timer.remainingSeconds)}</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-3 text-center border-2 border-cream-200">
            <p className="text-xs text-gray-500">已解决小状况</p>
            <p className="font-happy text-xl text-lavender-400">{state.incidentsResolved}</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-3 text-center border-2 border-cream-200">
            <p className="text-xs text-gray-500">火候稳定度</p>
            <p className="font-happy text-xl text-sky-400">
              {Math.round((state.heatHistory.filter(h => h >= safeZone[0] && h <= safeZone[1]).length 
                / Math.max(state.heatHistory.length, 1)) * 100)}%
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CookScene
