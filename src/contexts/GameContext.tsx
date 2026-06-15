import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import type { GameState, GameAction, Recipe, FamilyMember, WeeklyProgress, Sticker, PracticeRecord, ScoreRecord } from '../types/game'
import { RECIPES } from '../data/recipes'
import { getCurrentWeekKey, generateWeeklyChallenges } from '../data/weeklyChallenges'

export const STORAGE_KEY = 'kitchen_coop_game_state_v1'

export const createInitialState = (): GameState => {
  const defaultUnlocked = RECIPES.filter(r => r.unlockedByDefault).map(r => r.id)
  
  return {
    currentScene: 'menu',
    mode: 'coop',
    selectedRecipe: null,
    
    currentStepIndex: 0,
    stepsCompleted: [],
    currentTaskId: null,
    
    taskAssignments: {},
    
    chopRhythmScores: [],
    seasonTimingScores: [],
    
    timer: {
      totalSeconds: 180,
      remainingSeconds: 180,
      isRunning: false,
    },
    heatLevel: 50,
    heatHistory: [],
    stirQuality: [],
    activeIncident: null,
    incidentProgress: { p1: false, p2: false },
    incidentsResolved: 0,
    incidentsFailed: 0,
    
    playerActions: [],
    waitCounter: {
      p1WaitedForP2: 0,
      p2WaitedForP1: 0,
    },
    
    finalScore: null,
    
    unlockedRecipes: defaultUnlocked,
    unlockedAchievements: [],
    scoreHistory: [],
    learnedIngredients: [],
    familyMembers: [
      { id: 'p1_default', name: '家长', avatar: '👨‍🍳', role: 'parent', preferTaskType: 'chop' },
      { id: 'p2_default', name: '小朋友', avatar: '👧🍳', role: 'child', preferTaskType: 'season' },
    ],
    stickers: [],
    weeklyProgress: null,
    practiceHistory: [],
  }
}

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_SCENE':
      return { ...state, currentScene: action.scene }
    
    case 'SET_MODE':
      return { ...state, mode: action.mode }
    
    case 'SELECT_RECIPE': {
      const recipe = action.recipe
      const totalSeconds = recipe.steps.reduce((sum, s) => sum + s.targetDuration, 0)
      return {
        ...state,
        selectedRecipe: recipe,
        currentStepIndex: 0,
        stepsCompleted: recipe.steps.map(() => false),
        taskAssignments: {},
        chopRhythmScores: [],
        seasonTimingScores: [],
        timer: {
          totalSeconds,
          remainingSeconds: totalSeconds,
          isRunning: false,
        },
        heatLevel: 50,
        heatHistory: [],
        stirQuality: [],
        activeIncident: null,
        incidentProgress: { p1: false, p2: false },
        incidentsResolved: 0,
        incidentsFailed: 0,
        playerActions: [],
        waitCounter: { p1WaitedForP2: 0, p2WaitedForP1: 0 },
        finalScore: null,
        currentTaskId: null,
      }
    }
    
    case 'ASSIGN_TASK':
      return {
        ...state,
        taskAssignments: {
          ...state.taskAssignments,
          [action.taskId]: action.player,
        }
      }
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStepIndex: action.index }
    
    case 'COMPLETE_STEP': {
      const newCompleted = [...state.stepsCompleted]
      newCompleted[action.index] = true
      return { ...state, stepsCompleted: newCompleted }
    }
    
    case 'SET_CURRENT_TASK':
      return { ...state, currentTaskId: action.taskId }
    
    case 'ADD_CHOP_SCORE':
      return { ...state, chopRhythmScores: [...state.chopRhythmScores, action.score] }
    
    case 'ADD_SEASON_SCORE':
      return { ...state, seasonTimingScores: [...state.seasonTimingScores, action.score] }
    
    case 'INIT_TIMER':
      return {
        ...state,
        timer: {
          totalSeconds: action.total,
          remainingSeconds: action.total,
          isRunning: false,
        }
      }
    
    case 'TICK_TIMER':
      if (state.timer.remainingSeconds <= 0) {
        return {
          ...state,
          timer: { ...state.timer, remainingSeconds: 0, isRunning: false }
        }
      }
      return {
        ...state,
        timer: { ...state.timer, remainingSeconds: state.timer.remainingSeconds - 1 }
      }
    
    case 'START_TIMER':
      return { ...state, timer: { ...state.timer, isRunning: true } }
    
    case 'PAUSE_TIMER':
      return { ...state, timer: { ...state.timer, isRunning: false } }
    
    case 'SET_HEAT':
      return {
        ...state,
        heatLevel: action.level,
        heatHistory: [...state.heatHistory.slice(-50), action.level]
      }
    
    case 'ADD_STIR_QUALITY':
      return {
        ...state,
        stirQuality: [...state.stirQuality.slice(-30), action.quality]
      }
    
    case 'TRIGGER_INCIDENT':
      return {
        ...state,
        activeIncident: action.incident,
        incidentProgress: { p1: false, p2: false }
      }
    
    case 'RESOLVE_INCIDENT': {
      if (!state.activeIncident) return state
      const newProgress = {
        ...state.incidentProgress,
        [action.player]: true
      }
      
      const incident = state.activeIncident
      let resolved = false
      if (incident.actionRequired === 'both') {
        resolved = newProgress.p1 && newProgress.p2
      } else {
        resolved = true
      }
      
      if (resolved) {
        return {
          ...state,
          activeIncident: null,
          incidentProgress: { p1: false, p2: false },
          incidentsResolved: state.incidentsResolved + 1,
        }
      }
      
      return { ...state, incidentProgress: newProgress }
    }
    
    case 'FAIL_INCIDENT':
      return {
        ...state,
        activeIncident: null,
        incidentProgress: { p1: false, p2: false },
        incidentsFailed: state.incidentsFailed + 1,
        timer: {
          ...state.timer,
          remainingSeconds: Math.max(0, state.timer.remainingSeconds - (state.activeIncident?.penaltySeconds || 0))
        }
      }
    
    case 'RECORD_ACTION':
      return { ...state, playerActions: [...state.playerActions, action.action] }
    
    case 'INCREMENT_WAIT':
      return {
        ...state,
        waitCounter: action.waiter === 'p1'
          ? { ...state.waitCounter, p1WaitedForP2: state.waitCounter.p1WaitedForP2 + 1 }
          : { ...state.waitCounter, p2WaitedForP1: state.waitCounter.p2WaitedForP1 + 1 }
      }
    
    case 'SET_FINAL_SCORE':
      return { ...state, finalScore: action.score }
    
    case 'UNLOCK_RECIPE':
      if (state.unlockedRecipes.includes(action.recipeId)) return state
      return { ...state, unlockedRecipes: [...state.unlockedRecipes, action.recipeId] }
    
    case 'UNLOCK_ACHIEVEMENT':
      if (state.unlockedAchievements.includes(action.achievementId)) return state
      return { ...state, unlockedAchievements: [...state.unlockedAchievements, action.achievementId] }
    
    case 'ADD_SCORE_RECORD':
      return { ...state, scoreHistory: [action.record, ...state.scoreHistory].slice(0, 100) }
    
    case 'LEARN_INGREDIENT':
      if (state.learnedIngredients.includes(action.ingredientId)) return state
      return { ...state, learnedIngredients: [...state.learnedIngredients, action.ingredientId] }
    
    case 'RESET_SESSION': {
      const base = createInitialState()
      return {
        ...base,
        unlockedRecipes: state.unlockedRecipes,
        unlockedAchievements: state.unlockedAchievements,
        scoreHistory: state.scoreHistory,
        learnedIngredients: state.learnedIngredients,
        familyMembers: state.familyMembers,
        stickers: state.stickers,
        weeklyProgress: state.weeklyProgress,
        practiceHistory: state.practiceHistory,
        mode: state.mode,
      }
    }
    
    case 'LOAD_STATE':
      return { ...state, ...action.state }
    
    case 'SET_FAMILY_MEMBER': {
      const members = [...state.familyMembers]
      const idx = members.findIndex(m => m.id === action.member.id)
      if (idx >= 0) {
        members[idx] = action.member
      } else {
        members.push(action.member)
      }
      return { ...state, familyMembers: members }
    }
    
    case 'ADD_STICKER': {
      if (state.stickers.some(s => s.id === action.sticker.id)) return state
      return { ...state, stickers: [...state.stickers, { ...action.sticker, obtainedAt: new Date().toISOString() }] }
    }
    
    case 'UPDATE_WEEKLY_PROGRESS': {
      if (!state.weeklyProgress) return state
      const current = state.weeklyProgress.progress[action.challengeId] || 0
      const amount = action.amount ?? 1
      return {
        ...state,
        weeklyProgress: {
          ...state.weeklyProgress,
          progress: {
            ...state.weeklyProgress.progress,
            [action.challengeId]: current + amount,
          },
        },
      }
    }
    
    case 'SET_WEEKLY_PROGRESS':
      return { ...state, weeklyProgress: action.progress }
    
    case 'CLAIM_WEEKLY_REWARD': {
      if (!state.weeklyProgress) return state
      if (state.weeklyProgress.claimed.includes(action.challengeId)) return state
      return {
        ...state,
        weeklyProgress: {
          ...state.weeklyProgress,
          claimed: [...state.weeklyProgress.claimed, action.challengeId],
        },
      }
    }
    
    case 'ADD_PRACTICE_RECORD':
      return { ...state, practiceHistory: [action.record, ...state.practiceHistory].slice(0, 50) }
    
    default:
      return state
  }
}

export const loadFromStorage = (): Partial<GameState> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      unlockedRecipes: parsed.unlockedRecipes,
      unlockedAchievements: parsed.unlockedAchievements,
      scoreHistory: parsed.scoreHistory,
      learnedIngredients: parsed.learnedIngredients,
      familyMembers: parsed.familyMembers,
      stickers: parsed.stickers,
      weeklyProgress: parsed.weeklyProgress,
      practiceHistory: parsed.practiceHistory,
    }
  } catch {
    return null
  }
}

export const saveToStorage = (state: GameState) => {
  try {
    const toSave = {
      unlockedRecipes: state.unlockedRecipes,
      unlockedAchievements: state.unlockedAchievements,
      scoreHistory: state.scoreHistory,
      learnedIngredients: state.learnedIngredients,
      familyMembers: state.familyMembers,
      stickers: state.stickers,
      weeklyProgress: state.weeklyProgress,
      practiceHistory: state.practiceHistory,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // ignore
  }
}

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  selectRecipe: (recipe: Recipe) => void
  startCooking: () => void
  finishCooking: () => void
  resetSession: () => void
  checkUnlockRecipes: (extraRecord?: ScoreRecord) => string[]
  setFamilyMember: (member: FamilyMember) => void
  addSticker: (sticker: Sticker) => void
  updateWeeklyProgress: (challengeId: string, amount?: number) => void
  claimWeeklyReward: (challengeId: string) => void
  addPracticeRecord: (record: PracticeRecord) => void
  ensureWeeklyProgress: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const initial = createInitialState()
    const stored = loadFromStorage()
    if (!stored) return initial
    // 只合并不是 undefined 的字段，避免旧数据覆盖新字段
    const merged: GameState = { ...initial }
    Object.entries(stored).forEach(([key, value]) => {
      if (value !== undefined) {
        ;(merged as Record<string, unknown>)[key] = value
      }
    })
    return merged
  })

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const handler = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => saveToStorage(state), 500)
    }
    handler()
    return () => clearTimeout(timeout)
  }, [state.unlockedRecipes, state.unlockedAchievements, state.scoreHistory, state.learnedIngredients,
      state.familyMembers, state.stickers, state.weeklyProgress, state.practiceHistory])

  const selectRecipe = useCallback((recipe: Recipe) => {
    dispatch({ type: 'SELECT_RECIPE', recipe })
  }, [])

  const startCooking = useCallback(() => {
    dispatch({ type: 'SET_SCENE', scene: 'prep' })
  }, [])

  const finishCooking = useCallback(() => {
    dispatch({ type: 'PAUSE_TIMER' })
    dispatch({ type: 'SET_SCENE', scene: 'result' })
  }, [])

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' })
  }, [])

  const checkUnlockRecipes = useCallback((extraRecord?: ScoreRecord): string[] => {
    const newlyUnlocked: string[] = []
    const allRecords = extraRecord ? [...state.scoreHistory, extraRecord] : state.scoreHistory
    const recipesCooked = new Set(allRecords.map(s => s.recipeId)).size
    const totalStars = allRecords.reduce((sum, s) => sum + s.stars, 0)
    
    RECIPES.forEach(recipe => {
      if (state.unlockedRecipes.includes(recipe.id)) return
      if (recipe.unlockedByDefault) {
        newlyUnlocked.push(recipe.id)
        return
      }
      if (recipe.id === 'potato_beef' && recipesCooked >= 1) {
        newlyUnlocked.push(recipe.id)
      }
      if (recipe.id === 'mushroom_soup' && allRecords.some(s => s.recipeId === 'tomato_egg')) {
        newlyUnlocked.push(recipe.id)
      }
      if (recipe.id === 'steamed_fish' && totalStars >= 10) {
        newlyUnlocked.push(recipe.id)
      }
    })
    
    newlyUnlocked.forEach(id => dispatch({ type: 'UNLOCK_RECIPE', recipeId: id }))
    return newlyUnlocked
  }, [state.unlockedRecipes, state.scoreHistory])

  const setFamilyMember = useCallback((member: FamilyMember) => {
    dispatch({ type: 'SET_FAMILY_MEMBER', member })
  }, [])

  const addSticker = useCallback((sticker: Sticker) => {
    dispatch({ type: 'ADD_STICKER', sticker })
  }, [])

  const updateWeeklyProgress = useCallback((challengeId: string, amount = 1) => {
    dispatch({ type: 'UPDATE_WEEKLY_PROGRESS', challengeId, amount })
  }, [])

  const claimWeeklyReward = useCallback((challengeId: string) => {
    dispatch({ type: 'CLAIM_WEEKLY_REWARD', challengeId })
  }, [])

  const addPracticeRecord = useCallback((record: PracticeRecord) => {
    dispatch({ type: 'ADD_PRACTICE_RECORD', record })
  }, [])

  const ensureWeeklyProgress = useCallback(() => {
    const weekKey = getCurrentWeekKey()
    if (state.weeklyProgress?.weekKey === weekKey) return
    const challenges = generateWeeklyChallenges(weekKey)
    const progress: Record<string, number> = {}
    challenges.forEach(c => { progress[c.id] = 0 })
    dispatch({
      type: 'SET_WEEKLY_PROGRESS',
      progress: {
        weekKey,
        progress,
        completed: [],
        claimed: [],
      }
    })
  }, [state.weeklyProgress])

  useEffect(() => {
    ensureWeeklyProgress()
  }, [ensureWeeklyProgress])

  const value = useMemo(() => ({
    state,
    dispatch,
    selectRecipe,
    startCooking,
    finishCooking,
    resetSession,
    checkUnlockRecipes,
    setFamilyMember,
    addSticker,
    updateWeeklyProgress,
    claimWeeklyReward,
    addPracticeRecord,
    ensureWeeklyProgress,
  }), [state, selectRecipe, startCooking, finishCooking, resetSession, checkUnlockRecipes,
       setFamilyMember, addSticker, updateWeeklyProgress, claimWeeklyReward, addPracticeRecord, ensureWeeklyProgress])

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider')
  }
  return ctx
}
