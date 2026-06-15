// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useSpeechBubble } from '@/components/common/SpeechBubble'
import { useRhythm } from '@/hooks/useRhythm'
import { useSoundFX } from '@/hooks/useSoundFX'
import { useSpeech } from '@/hooks/useSpeech'
import { getTaskTypeLabel, getPlayerLabel } from '@/utils/scoring'
import type { Player, RecipeTask } from '@/types/game'

type PrepSubPhase = 'assign' | 'task'

// ==== 任务卡片组件 ====
const TaskChip: React.FC<{
  task: RecipeTask
  onClick?: () => void
  unassigned?: boolean
  showSuggest?: boolean
  children?: React.ReactNode
}> = ({ task, onClick, unassigned, showSuggest, children }) => {
  const info = getTaskTypeLabel(task.type)
  const diffColor = task.difficulty === 'easy' ? 'bg-mint-100 text-mint-600 border-mint-300' 
                   : task.difficulty === 'medium' ? 'bg-yolk-100 text-yolk-600 border-yolk-300'
                   : 'bg-tomato-100 text-tomato-600 border-tomato-300'
  const diffLabel = task.difficulty === 'easy' ? '简单' : task.difficulty === 'medium' ? '中等' : '较难'

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        rounded-2xl p-3 border-2 bg-white
        ${unassigned ? 'border-warm-300 cursor-move' : 'border-gray-100'}
        ${onClick ? 'cursor-pointer hover:border-warm-400' : ''}
        transition-all shadow-sm
      `}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl shrink-0">{info.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-happy text-base text-gray-800">{task.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${diffColor}`}>
              {diffLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {info.name} · 约{task.duration}秒
          </p>
          {showSuggest && task.suggestedPlayer && task.suggestedPlayer !== 'any' && (
            <p className="text-[10px] text-gray-400 mt-1">
              💡 建议：{getPlayerLabel(task.suggestedPlayer).name}
            </p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

// ==== 任务分配阶段 ====
const TaskAssigner: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { state, dispatch } = useGame()
  const { selectedRecipe, mode, taskAssignments, familyMembers } = state

  const p1Member = familyMembers.find(m => m.id === 'p1_default') || familyMembers[0]
  const p2Member = familyMembers.find(m => m.id === 'p2_default') || familyMembers[1]
  const showBubble = useSpeechBubble()
  const sound = useSoundFX()

  if (!selectedRecipe) return null

  const prepSteps = selectedRecipe.steps.filter(s => s.phase === 'prep')
  const allTasks = prepSteps.flatMap(s => s.tasks)

  const allAssigned = useMemo(() => {
    return allTasks.every(t => taskAssignments[t.id])
  }, [allTasks, taskAssignments])

  const autoAssign = () => {
    let turn = 0
    allTasks.forEach(task => {
      const suggested = task.suggestedPlayer
      let player: Player
      if (suggested && suggested !== 'any') {
        player = suggested
      } else {
        player = turn % 2 === 0 ? 'p1' : 'p2'
        turn++
      }
      dispatch({ type: 'ASSIGN_TASK', taskId: task.id, player })
    })
    sound.playSuccess()
    showBubble('任务已自动分配！也可以手动调整哦~', 'success')
  }

  const assignTask = (taskId: string, player: Player) => {
    const current = taskAssignments[taskId]
    const next = current === player ? null : player
    dispatch({ type: 'ASSIGN_TASK', taskId: taskId, player: next })
    sound.playClick()
  }

  const handleStart = () => {
    if (mode === 'coop' && !allAssigned) {
      showBubble('还有任务没分配哦！', 'warning')
      sound.playWarn()
      return
    }
    sound.playDing()
    showBubble('好的，开始备菜！跟着步骤来吧~', 'success')
    onStart()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-happy text-2xl text-warm-500 mb-1">👥 分工合作</h3>
          <p className="text-gray-500 text-sm">
            {mode === 'coop' 
              ? '点击任务卡片下方按钮分配给对应的玩家，均衡分配更高效哦！'
              : '单人模式下自动分配所有任务'}
          </p>
        </div>
        {mode === 'coop' && (
          <Button variant="info" size="sm" onClick={autoAssign} leftIcon="✨">
            智能分配
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mode === 'coop' ? (
          <>
            <div className="player-zone-p1 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{p1Member?.avatar || '👨‍🍳'}</span>
                <div>
                  <span className={`${getPlayerLabel('p1').color} px-2 py-0.5 rounded-lg font-happy text-xs`}>
                    {getPlayerLabel('p1').short}
                  </span>
                  <h4 className="font-happy text-lg text-gray-800 mt-0.5">
                    {p1Member?.name || '家长'}
                  </h4>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {allTasks.filter(t => taskAssignments[t.id] === 'p1').map(task => (
                  <TaskChip key={task.id} task={task} onClick={() => assignTask(task.id, 'p1')} />
                ))}
                {allTasks.filter(t => taskAssignments[t.id] === 'p1').length === 0 && (
                  <p className="text-sky-400 text-center py-10 text-sm">点击中间任务给P1</p>
                )}
              </div>
            </div>

            <div className="order-first md:order-none bg-cream-50 rounded-3xl p-5 border-4 border-dashed border-warm-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-happy text-warm-500">🎯 任务池</span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {allTasks.filter(t => !taskAssignments[t.id]).map(task => (
                  <TaskChip key={task.id} task={task} unassigned showSuggest>
                    <div className="flex gap-1 mt-2">
                      <button 
                        className="flex-1 px-2 py-1 rounded-lg badge-p1 text-xs font-bold hover:opacity-80"
                        onClick={(e) => { e.stopPropagation(); assignTask(task.id, 'p1') }}
                      >
                        给P1
                      </button>
                      <button 
                        className="flex-1 px-2 py-1 rounded-lg badge-p2 text-xs font-bold hover:opacity-80"
                        onClick={(e) => { e.stopPropagation(); assignTask(task.id, 'p2') }}
                      >
                        给P2
                      </button>
                    </div>
                  </TaskChip>
                ))}
                {allTasks.filter(t => !taskAssignments[t.id]).length === 0 && (
                  <p className="text-warm-400 text-center py-10 text-sm">✅ 全部已分配！</p>
                )}
              </div>
            </div>

            <div className="player-zone-p2 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{p2Member?.avatar || '👧🍳'}</span>
                <div>
                  <span className={`${getPlayerLabel('p2').color} px-2 py-0.5 rounded-lg font-happy text-xs`}>
                    {getPlayerLabel('p2').short}
                  </span>
                  <h4 className="font-happy text-lg text-gray-800 mt-0.5">
                    {p2Member?.name || '小朋友'}
                  </h4>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {allTasks.filter(t => taskAssignments[t.id] === 'p2').map(task => (
                  <TaskChip key={task.id} task={task} onClick={() => assignTask(task.id, 'p2')} />
                ))}
                {allTasks.filter(t => taskAssignments[t.id] === 'p2').length === 0 && (
                  <p className="text-pink-400 text-center py-10 text-sm">点击中间任务给P2</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-3 bg-warm-50 rounded-3xl p-5 border-4 border-warm-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-happy text-warm-500 text-xl">🎯 全部任务（单人完成）</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allTasks.map(task => (
                <TaskChip key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="success" size="xl" onClick={handleStart} leftIcon="🔪" rightIcon="→">
          开始备菜！
        </Button>
      </div>
    </div>
  )
}

// ==== 切菜节奏游戏 ====
const ChopRhythmGame: React.FC<{
  task: RecipeTask
  player: Player
  onComplete: (score: number) => void
}> = ({ task, player, onComplete }) => {
  const [rounds, setRounds] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const totalRounds = 3
  
  const { dispatch } = useGame()
  const sound = useSoundFX()
  const speech = useSpeech()
  const showBubble = useSpeechBubble()
  
  const difficultyMultiplier = task.difficulty === 'easy' ? 1 : task.difficulty === 'medium' ? 0.9 : 0.8

  const handleHit = useCallback((rhythm: ReturnType<typeof useRhythm>) => {
    if (rounds >= totalRounds) return { score: 0, accuracy: 'miss' }
    const result = rhythm.handleHit()
    const finalScore = Math.round(result.score * difficultyMultiplier)
    
    if (result.accuracy === 'perfect' || result.accuracy === 'great') {
      sound.playChopPerfect()
    } else if (result.accuracy === 'good' || result.accuracy === 'ok') {
      sound.playChop()
    } else {
      sound.playFail()
    }
    
    const labels: Record<string, string> = {
      perfect: '完美！满分！', great: '很好！', good: '不错~', ok: '还行吧', miss: '切歪了！'
    }
    showBubble(
      `${getPlayerLabel(player).short}: ${labels[result.accuracy] || ''} +${finalScore}`, 
      result.accuracy === 'perfect' || result.accuracy === 'great' ? 'success' 
      : result.accuracy === 'miss' ? 'error' : 'info'
    )
    
    dispatch({ type: 'ADD_CHOP_SCORE', score: finalScore })
    dispatch({ type: 'RECORD_ACTION', action: {
      id: Math.random().toString(36).slice(2),
      player, taskId: task.id, taskType: task.type, accuracy: finalScore,
      timestamp: Date.now(),
    }})
    
    const nextRounds = rounds + 1
    setScores(prev => [...prev, finalScore])
    setRounds(nextRounds)
    
    if (nextRounds >= totalRounds) {
      rhythm.stop()
      setTimeout(() => {
        const avg = Math.round([...scores, finalScore].reduce((a, b) => a + b, 0) / totalRounds)
        if (avg >= 80) speech.quickPhrase('perfect')
        else if (avg >= 50) speech.quickPhrase('good_job')
        else speech.quickPhrase('oops')
        onComplete(avg)
      }, 500)
    }
    return result
  }, [rounds, scores, difficultyMultiplier, player, task.id, task.type, dispatch, sound, showBubble, speech, onComplete])
  
  const rhythm = useRhythm({
    durationMs: task.difficulty === 'easy' ? 3500 : task.difficulty === 'medium' ? 2800 : 2200,
    hitZones: [{ start: 0.42, end: 0.58, bonus: true }],
  })

  useEffect(() => {
    rhythm.start()
    speech.speak(`开始${task.name}！在绿色区域点击按钮`)
    return () => rhythm.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pressKey = player === 'p1' ? 'A' : '←'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((player === 'p1' && (e.key === 'a' || e.key === 'A')) ||
          (player === 'p2' && e.key === 'ArrowLeft')) {
        handleHit(rhythm)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleHit, rhythm, player])

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`${getPlayerLabel(player).color} px-3 py-1 rounded-xl font-happy`}>
            {getPlayerLabel(player).short}
          </span>
          <h4 className="font-happy text-xl">{task.name}</h4>
          <span className="text-gray-400 text-sm">第 {Math.min(rounds + 1, totalRounds)}/{totalRounds} 刀</span>
        </div>
        <div className="flex gap-1">
          {scores.map((s, i) => (
            <span key={i} className={`text-sm font-bold px-2 py-0.5 rounded-full ${
              s >= 80 ? 'bg-mint-100 text-mint-600' :
              s >= 50 ? 'bg-yolk-100 text-yolk-600' :
              'bg-tomato-100 text-tomato-500'
            }`}>{s}</span>
          ))}
        </div>
      </div>

      <div className="relative h-24 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 
                      rounded-2xl border-4 border-amber-200 overflow-hidden shadow-inner">
        <div className="absolute inset-y-0 my-3 mx-12 rounded-lg"
             style={{
               left: `${rhythm.hitZones[0].start * 100}%`,
               right: `${(1 - rhythm.hitZones[0].end) * 100}%`,
               background: 'linear-gradient(90deg, rgba(127,209,174,0.6), rgba(127,209,174,0.8), rgba(127,209,174,0.6))',
               boxShadow: '0 0 20px rgba(127,209,174,0.5) inset'
             }} />
        
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-xl z-10"
          style={{
            left: `calc(${rhythm.position * 100}% - 20px)`,
            background: 'linear-gradient(135deg, #FFD93D, #FFB366)',
            boxShadow: '0 0 30px rgba(255,217,61,0.6), 0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          🔪
        </motion.div>

        <div className="absolute bottom-1 left-3 text-xs text-amber-700/60">🥕</div>
        <div className="absolute bottom-1 right-3 text-xs text-amber-700/60">🥕</div>
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92, y: 4 }}
          onClick={() => handleHit(rhythm)}
          disabled={rounds >= totalRounds}
          className={`
            px-12 py-6 rounded-3xl font-happy text-2xl text-white shadow-candy
            ${player === 'p1' 
              ? 'bg-gradient-to-br from-sky-400 to-blue-500' 
              : 'bg-gradient-to-br from-pink-400 to-rose-500'}
            ${rounds >= totalRounds ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-center">
            <div>🔪 切！</div>
            <div className="text-xs opacity-80 font-body mt-1">（按键盘 {pressKey}）</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

// ==== 调味时机游戏 ====
const SeasonTimingGame: React.FC<{
  task: RecipeTask
  player: Player
  onComplete: (score: number) => void
}> = ({ task, player, onComplete }) => {
  const [position, setPosition] = useState(0)
  const [done, setDone] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const rafRef = React.useRef<number | null>(null)
  
  const { dispatch } = useGame()
  const sound = useSoundFX()
  const speech = useSpeech()
  const showBubble = useSpeechBubble()

  const speed = task.difficulty === 'easy' ? 0.004 : task.difficulty === 'medium' ? 0.006 : 0.008
  const targetZone = { start: 0.65, end: 0.85 }
  const perfectCenter = 0.75

  useEffect(() => {
    let direction = 1
    const animate = () => {
      setPosition(prev => {
        let next = prev + speed * direction
        if (next >= 1) { direction = -1; next = 1 }
        if (next <= 0) { direction = 1; next = 0 }
        return next
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    speech.speak(`${task.name}，找到最佳时机点击！`)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSeason = useCallback((p: Player) => {
    if (done || p !== player) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setDone(true)
    
    let score = 0
    let label = ''
    let type: 'success' | 'info' | 'warning' | 'error' = 'info'
    
    if (position >= targetZone.start && position <= targetZone.end) {
      const dist = Math.abs(position - perfectCenter) / ((targetZone.end - targetZone.start) / 2)
      score = Math.round(100 - dist * 25)
      if (score >= 90) { label = '完美时机！'; type = 'success' }
      else { label = '味道不错！'; type = 'success' }
      sound.playSeason()
    } else if (position > targetZone.end - 0.1 || position < targetZone.start + 0.1) {
      score = 55
      label = '放多了一点点'
      type = 'warning'
      sound.playWarn()
    } else {
      score = 25
      label = position < targetZone.start ? '放太早了，味道不足！' : '放太晚了，都焦了！'
      type = 'error'
      sound.playFail()
    }

    setFinalScore(score)
    dispatch({ type: 'ADD_SEASON_SCORE', score })
    dispatch({ type: 'RECORD_ACTION', action: {
      id: Math.random().toString(36).slice(2),
      player, taskId: task.id, taskType: task.type, accuracy: score,
      timestamp: Date.now(),
    }})
    showBubble(`${getPlayerLabel(player).short}: ${label} +${score}`, type)
    
    setTimeout(() => {
      if (score >= 80) speech.quickPhrase('perfect')
      else if (score >= 50) speech.quickPhrase('good_job')
      onComplete(score)
    }, 1000)
  }, [done, player, position, dispatch, sound, showBubble, speech, task, onComplete])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((player === 'p1' && (e.key === 'd' || e.key === 'D')) ||
          (player === 'p2' && e.key === 'ArrowRight')) {
        handleSeason(player)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSeason, player])

  const pressKey = player === 'p1' ? 'D' : '→'

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className={`${getPlayerLabel(player).color} px-3 py-1 rounded-xl font-happy`}>
            {getPlayerLabel(player).short}
          </span>
          <h4 className="font-happy text-xl">{task.name}</h4>
        </div>
        {finalScore !== null && (
          <span className={`text-lg font-bold px-4 py-1 rounded-full ${
            finalScore >= 80 ? 'bg-mint-100 text-mint-600' :
            finalScore >= 50 ? 'bg-yolk-100 text-yolk-600' :
            'bg-tomato-100 text-tomato-500'
          }`}>得分：{finalScore}</span>
        )}
      </div>

      <div className="relative h-20 rounded-2xl bg-gradient-to-r from-cream-100 via-white to-cream-100
                      border-4 border-warm-300 overflow-hidden shadow-inner">
        <div className="absolute inset-y-2 rounded-lg"
             style={{
               left: `${targetZone.start * 100}%`,
               right: `${(1 - targetZone.end) * 100}%`,
               background: 'linear-gradient(90deg, rgba(127,209,174,0.5), rgba(255,217,61,0.7), rgba(127,209,174,0.5))',
               boxShadow: '0 0 25px rgba(255,217,61,0.5) inset'
             }}>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-happy text-amber-700">
            ✨ 最佳时机 ✨
          </div>
        </div>

        <motion.div
          animate={{ y: done ? [0, -8, 0] : 0 }}
          transition={{ repeat: done ? 2 : 0, duration: 0.3 }}
          className="absolute top-1/2 -translate-y-1/2 w-8 h-14 rounded-t-full"
          style={{
            left: `calc(${position * 100}% - 16px)`,
            background: done && finalScore !== null && finalScore >= 80
              ? 'linear-gradient(135deg, #FFD93D, #FF9933)'
              : 'linear-gradient(135deg, #C9B1FF, #9B7ED6)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">
            {done ? (finalScore !== null && finalScore >= 80 ? '✨' : '💫') : '🧂'}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={!done ? { scale: 1.05 } : undefined}
          whileTap={!done ? { scale: 0.92, y: 4 } : undefined}
          onClick={() => handleSeason(player)}
          disabled={done}
          className={`
            px-12 py-6 rounded-3xl font-happy text-2xl text-white shadow-candy
            ${player === 'p1' 
              ? 'bg-gradient-to-br from-sky-400 to-blue-500' 
              : 'bg-gradient-to-br from-pink-400 to-rose-500'}
            ${done ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-center">
            <div>🧂 调味！</div>
            <div className="text-xs opacity-80 font-body mt-1">（按键盘 {pressKey}）</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

// ==== 简单按住任务 ====
const SimpleTask: React.FC<{
  task: RecipeTask
  player: Player
  onComplete: (score: number) => void
}> = ({ task, player, onComplete }) => {
  const [progress, setProgress] = useState(0)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = React.useRef(false)
  const { dispatch } = useGame()
  const sound = useSoundFX()
  const showBubble = useSpeechBubble()
  const speech = useSpeech()
  const info = getTaskTypeLabel(task.type)

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    speech.speak(`开始${task.name}，按住按钮直到完成`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startPress = useCallback((p: Player) => {
    if (p !== player || doneRef.current) return
    stop()
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (task.duration * 15))
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true
          stop()
          const score = task.difficulty === 'easy' ? 95 : task.difficulty === 'medium' ? 85 : 75
          dispatch({ type: 'RECORD_ACTION', action: {
            id: Math.random().toString(36).slice(2),
            player, taskId: task.id, taskType: task.type, accuracy: score,
            timestamp: Date.now(),
          }})
          if (task.type === 'wash') dispatch({ type: 'ADD_CHOP_SCORE', score })
          else dispatch({ type: 'ADD_SEASON_SCORE', score })
          sound.playSuccess()
          showBubble(`${getPlayerLabel(player).short}: ${task.name}完成！+${score}`, 'success')
          setTimeout(() => {
            if (score >= 80) speech.quickPhrase('good_job')
            onComplete(score)
          }, 500)
          return 100
        }
        return Math.min(next, 100)
      })
    }, 20)
  }, [player, task, dispatch, sound, showBubble, speech, onComplete])

  const endPress = useCallback(() => {
    stop()
    if (!doneRef.current) {
      setProgress(prev => Math.max(0, prev - 8))
    }
  }, [])

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-3">
        <span className={`${getPlayerLabel(player).color} px-3 py-1 rounded-xl font-happy`}>
          {getPlayerLabel(player).short}
        </span>
        <span className="text-3xl">{info.emoji}</span>
        <h4 className="font-happy text-xl">{task.name}</h4>
      </div>
      <ProgressBar value={progress} color={player === 'p1' ? '#74B9FF' : '#FDA7DF'} />
      <div className="flex justify-center">
        <motion.button
          onMouseDown={() => startPress(player)}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={() => startPress(player)}
          onTouchEnd={endPress}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          disabled={progress >= 100}
          className={`
            px-16 py-8 rounded-3xl font-happy text-2xl text-white shadow-candy select-none
            ${player === 'p1' 
              ? 'bg-gradient-to-br from-sky-400 to-blue-500' 
              : 'bg-gradient-to-br from-pink-400 to-rose-500'}
            ${progress >= 100 ? 'opacity-60' : ''}
          `}
        >
          <div className="text-center">
            <div className="text-4xl mb-1">{info.emoji}</div>
            <div>按住持续{task.name}！</div>
            <div className="text-xs opacity-80 font-body mt-1">
              （{progress >= 100 ? '✅ 完成' : '松手进度会倒退哦~'}）
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

// ==== 任务执行阶段 ====
const TaskExecutor: React.FC = () => {
  const navigate = useNavigate()
  const { state, dispatch, finishCooking } = useGame()
  const { selectedRecipe, mode, taskAssignments, currentStepIndex, stepsCompleted } = state
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const showBubble = useSpeechBubble()
  const sound = useSoundFX()
  const speech = useSpeech()

  if (!selectedRecipe) return null

  const prepSteps = selectedRecipe.steps.filter(s => s.phase === 'prep')
  const cookSteps = selectedRecipe.steps.filter(s => s.phase === 'cook')
  const hasCookPhase = cookSteps.length > 0

  const currentStep = prepSteps[currentStepIndex]
  const currentTask = currentStep?.tasks[currentTaskIdx]
  const currentPlayer: Player = 
    mode === 'single' ? 'p1' : (taskAssignments[currentTask?.id || ''] || 'p1')

  const nextTask = useCallback(() => {
    if (!currentStep) return
    if (currentTaskIdx < currentStep.tasks.length - 1) {
      setCurrentTaskIdx(prev => prev + 1)
    } else {
      const globalStepIdx = selectedRecipe.steps.findIndex(s => s.id === currentStep.id)
      dispatch({ type: 'COMPLETE_STEP', index: globalStepIdx })
      if (currentStepIndex < prepSteps.length - 1) {
        dispatch({ type: 'SET_CURRENT_STEP', index: currentStepIndex + 1 })
        setCurrentTaskIdx(0)
        showBubble(`步骤 ${currentStepIndex + 1} 完成！继续下一步~`, 'success')
        speech.quickPhrase('good_job')
      } else {
        showBubble('所有备菜完成！准备开火做菜！', 'success')
        sound.playDing()
        speech.quickPhrase('well_done')
        
        if (hasCookPhase) {
          const cookFirstIdx = selectedRecipe.steps.findIndex(s => s.phase === 'cook')
          dispatch({ type: 'SET_CURRENT_STEP', index: cookFirstIdx })
          dispatch({ type: 'SET_SCENE', scene: 'cook' })
          setTimeout(() => navigate('/cook'), 800)
        } else {
          showBubble('所有步骤完成！上菜啦~', 'success')
          sound.playSuccess()
          speech.quickPhrase('well_done')
          finishCooking()
          setTimeout(() => navigate('/result'), 800)
        }
      }
    }
  }, [currentStep, currentTaskIdx, currentStepIndex, prepSteps.length, selectedRecipe, 
      dispatch, navigate, hasCookPhase, showBubble, sound, speech, finishCooking])

  const onTaskComplete = useCallback((_score: number) => {
    sound.playClick()
    setTimeout(nextTask, 600)
  }, [sound, nextTask])

  const stepProgress = prepSteps.length > 0 
    ? (currentStepIndex + (currentTaskIdx / Math.max(currentStep?.tasks.length || 1, 1))) / prepSteps.length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{selectedRecipe.emoji}</span>
          <div>
            <h3 className="font-happy text-2xl" style={{ color: selectedRecipe.colorTheme }}>
              {selectedRecipe.name} · 备菜阶段
            </h3>
            <p className="text-gray-500 text-sm">
              步骤 {currentStepIndex + 1}/{prepSteps.length} · 
              任务 {currentTaskIdx + 1}/{currentStep?.tasks.length || 0}
            </p>
          </div>
        </div>
      </div>

      <ProgressBar 
        value={stepProgress * 100} 
        color={selectedRecipe.colorTheme}
        showLabel
        label="备菜总进度"
      />

      <div className="flex flex-wrap gap-2 mb-2">
        {prepSteps.map((step, idx) => {
          const globalIdx = selectedRecipe.steps.findIndex(s => s.id === step.id)
          const isActive = idx === currentStepIndex
          const isDone = stepsCompleted[globalIdx]
          return (
            <div 
              key={step.id}
              className={`
                px-4 py-2 rounded-2xl font-happy text-sm border-2 transition-all
                ${isActive ? 'bg-warm-100 border-warm-400 text-warm-600 scale-105 shadow-md' : ''}
                ${isDone ? 'bg-mint-100 border-mint-400 text-mint-600' : ''}
                ${!isActive && !isDone ? 'bg-gray-50 border-gray-200 text-gray-400' : ''}
              `}
            >
              {isDone ? '✓' : idx + 1}. {step.title}
            </div>
          )
        })}
      </div>

      <Card color={selectedRecipe.colorTheme}>
        <div className="mb-4 p-4 bg-cream-50 rounded-2xl">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-10 h-10 rounded-full bg-warm-400 text-white 
                            flex items-center justify-center font-happy text-xl shrink-0">
              {currentStepIndex + 1}
            </span>
            <h4 className="font-happy text-2xl text-gray-800">{currentStep?.title}</h4>
          </div>
          <p className="text-gray-600 pl-[52px]">{currentStep?.description}</p>
        </div>

        <AnimatePresence mode="wait">
          {currentTask && (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {currentTask.type === 'chop' && (
                <ChopRhythmGame task={currentTask} player={currentPlayer} onComplete={onTaskComplete} />
              )}
              {currentTask.type === 'season' && (
                <SeasonTimingGame task={currentTask} player={currentPlayer} onComplete={onTaskComplete} />
              )}
              {(currentTask.type === 'wash' || currentTask.type === 'stir') && (
                <SimpleTask task={currentTask} player={currentPlayer} onComplete={onTaskComplete} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}

// ==== 主场景组件 ====
const PrepScene: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useGame()
  const { selectedRecipe } = state
  const [subPhase, setSubPhase] = useState<PrepSubPhase>('assign')

  if (!selectedRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <p className="text-gray-500 mb-4 text-lg">还没选择菜谱哦~</p>
          <Button onClick={() => navigate('/')} leftIcon="←">返回选菜谱</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => {
              if (confirm('确定要返回吗？当前进度会丢失')) navigate('/')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-white/80 hover:bg-white text-gray-600 font-happy border-2 border-cream-200
                       transition-all hover:border-warm-300"
          >
            ← 返回
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedRecipe.emoji}</span>
            <h1 className="font-happy text-2xl md:text-3xl" style={{ color: selectedRecipe.colorTheme }}>
              🥬 备菜台
            </h1>
          </div>
          <div className="w-[88px]"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <Card className="min-h-[60vh]" color={selectedRecipe.colorTheme}>
          <AnimatePresence mode="wait">
            <motion.div
              key={subPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {subPhase === 'assign' ? (
                <TaskAssigner onStart={() => setSubPhase('task')} />
              ) : (
                <TaskExecutor />
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </main>
    </div>
  )
}

export default PrepScene
