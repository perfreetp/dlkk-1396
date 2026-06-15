import type { GameState, ScoreBreakdown, FinalScore, Player, TaskType } from '../types/game'

export const avg = (arr: number[]): number => {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export const genId = (): string => {
  return Math.random().toString(36).substring(2, 10)
}

export const calculateScoreBreakdown = (state: GameState): ScoreBreakdown => {
  const chopAvg = Math.round(avg(state.chopRhythmScores))
  const seasonAvg = Math.round(avg(state.seasonTimingScores))
  
  const safeHeatPercent = state.heatHistory.length > 0
    ? (state.heatHistory.filter(h => h >= 35 && h <= 70).length / state.heatHistory.length) * 100
    : 50
  const heatControl = Math.round(safeHeatPercent)
  
  const stirQuality = Math.round(avg(state.stirQuality)) || 70
  
  const incidentsHandled = state.incidentsResolved * 10
  
  let cooperationBonus = 50
  if (state.mode === 'coop') {
    const assignments = Object.values(state.taskAssignments).filter(Boolean)
    const p1Count = assignments.filter(a => a === 'p1').length
    const p2Count = assignments.filter(a => a === 'p2').length
    const balance = p1Count > 0 && p2Count > 0 
      ? 1 - Math.abs(p1Count - p2Count) / Math.max(p1Count, p2Count)
      : 0
    
    const waitPenalty = (state.waitCounter.p1WaitedForP2 + state.waitCounter.p2WaitedForP1) * 3
    cooperationBonus = Math.round(balance * 50 + 50 - waitPenalty)
    cooperationBonus = clamp(cooperationBonus, 0, 100)
  }
  
  const timer = state.timer
  const timeEfficiency = timer.totalSeconds > 0
    ? clamp(100 - (Math.abs(timer.remainingSeconds - timer.totalSeconds * 0.1) / (timer.totalSeconds * 0.9)) * 100, 30, 100)
    : 70
  const timeBonus = Math.round(timeEfficiency)
  
  return {
    chopAvg,
    seasonAvg,
    heatControl,
    stirQuality,
    incidentsHandled,
    cooperationBonus,
    timeBonus,
  }
}

export const calculateFinalScore = (state: GameState): FinalScore => {
  const breakdown = calculateScoreBreakdown(state)
  
  const prepScore = (breakdown.chopAvg + breakdown.seasonAvg) / 2
  const cookScore = (breakdown.heatControl + breakdown.stirQuality) / 2
  const accuracy = Math.round((prepScore + cookScore) / 2 + breakdown.incidentsHandled / 2)
  const cooperation = breakdown.cooperationBonus
  
  const accuracyWeight = state.mode === 'coop' ? 0.55 : 0.7
  const cooperationWeight = state.mode === 'coop' ? 0.3 : 0
  const timeWeight = 0.15
  
  const total = Math.round(
    accuracy * accuracyWeight +
    cooperation * cooperationWeight +
    breakdown.timeBonus * timeWeight
  )
  
  let stars = 1
  if (total >= 40) stars = 2
  if (total >= 55) stars = 3
  if (total >= 72) stars = 4
  if (total >= 88) stars = 5
  
  const recipeId = state.selectedRecipe?.id
  const prevBest = recipeId
    ? state.scoreHistory
        .filter(s => s.recipeId === recipeId)
        .sort((a, b) => b.totalScore - a.totalScore)[0]?.totalScore || 0
    : 0
  
  const isNewRecord = total > prevBest
  
  return {
    total: clamp(total, 0, 100),
    cooperation: clamp(cooperation, 0, 100),
    accuracy: clamp(accuracy, 0, 100),
    stars,
    breakdown,
    isNewRecord
  }
}

export const getTaskTypeLabel = (type: TaskType): { name: string; emoji: string } => {
  const map: Record<TaskType, { name: string; emoji: string }> = {
    chop: { name: '切菜', emoji: '🔪' },
    wash: { name: '清洗', emoji: '💧' },
    season: { name: '调味', emoji: '🧂' },
    stir: { name: '翻炒', emoji: '🥄' },
    flip: { name: '翻面', emoji: '🔄' },
    serve: { name: '盛盘', emoji: '🍽️' },
  }
  return map[type]
}

export const getPlayerLabel = (player: Player | null): { name: string; short: string; color: string } => {
  if (player === 'p1') {
    return { name: '家长(玩家1)', short: 'P1', color: 'badge-p1' }
  } else if (player === 'p2') {
    return { name: '孩子(玩家2)', short: 'P2', color: 'badge-p2' }
  }
  return { name: '未分配', short: '?', color: 'bg-gray-300 text-gray-600' }
}
