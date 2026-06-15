export type Scene = 'menu' | 'prep' | 'cook' | 'result' | 'gallery'
export type GameMode = 'single' | 'coop'
export type Player = 'p1' | 'p2'

export interface Ingredient {
  id: string
  name: string
  emoji: string
  funFact: string
  nutrition: string
}

export type TaskType = 'chop' | 'wash' | 'season' | 'stir' | 'flip' | 'serve'

export interface RecipeTask {
  id: string
  type: TaskType
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedPlayer?: 'p1' | 'p2' | 'any'
  duration: number
}

export interface RecipeStep {
  id: string
  stepNumber: number
  phase: 'prep' | 'cook'
  title: string
  description: string
  targetDuration: number
  tasks: RecipeTask[]
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  description: string
  story: string
  colorTheme: string
  ingredientIds: string[]
  steps: RecipeStep[]
  unlockedByDefault: boolean
  unlockCondition?: string
}

export interface Incident {
  id: string
  type: 'overflow' | 'overheat' | 'miss_ingredient' | 'timer_alert' | 'spill'
  title: string
  emoji: string
  description: string
  hint: string
  requiresCooperation: boolean
  actionRequired: 'p1' | 'p2' | 'both' | 'any'
  timeLimit: number
  penaltySeconds: number
  rewardScore: number
}

export interface PlayerAction {
  id: string
  player: Player
  taskId: string
  taskType: TaskType
  accuracy: number
  timestamp: number
  note?: string
}

export interface ScoreBreakdown {
  chopAvg: number
  seasonAvg: number
  heatControl: number
  stirQuality: number
  incidentsHandled: number
  cooperationBonus: number
  timeBonus: number
}

export interface FinalScore {
  total: number
  cooperation: number
  accuracy: number
  stars: number
  breakdown: ScoreBreakdown
  isNewRecord: boolean
}

export interface ScoreRecord {
  id: string
  recipeId: string
  recipeName: string
  recipeEmoji: string
  totalScore: number
  cooperationScore: number
  accuracyScore: number
  stars: number
  durationSeconds: number
  date: string
  mode: GameMode
  incidentsResolved?: number
  incidentsFailed?: number
  p1Name?: string
  p2Name?: string
  stepDurations?: { stepId: string; seconds: number }[]
  feedback?: FeedbackItem[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'beginner' | 'skill' | 'cooperation' | 'collection'
  condition: {
    type: 'recipes_cooked' | 'perfect_stars' | 'coop_games' | 'incidents_solved' | 'ingredients_learned'
    value: number
    recipeId?: string
  }
}

// ==== 家庭成员档案 ====
export type FamilyRole = 'parent' | 'child'

export interface FamilyMember {
  id: string
  name: string
  avatar: string  // emoji
  role: FamilyRole
  preferTaskType?: TaskType
}

// ==== 复盘反馈 ====
export type FeedbackType = 'praise' | 'tip' | 'practice'

export interface FeedbackItem {
  type: FeedbackType
  icon: string
  title: string
  description: string
}

// ==== 贴纸/徽章 ====
export interface Sticker {
  id: string
  name: string
  emoji: string
  description: string
  category: 'challenge' | 'achievement' | 'special'
  rarity: 'common' | 'rare' | 'epic'
  obtainedAt?: string
}

// ==== 每周挑战 ====
export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  icon: string
  type: 'cook' | 'learn_ingredient' | 'handle_incident' | 'coop' | 'practice'
  target: number
  reward: string  // sticker id
  weekKey: string  // 如 '2026-W24'
}

export interface WeeklyProgress {
  weekKey: string
  progress: Record<string, number>  // challengeId -> 当前进度
  completed: string[]  // 已完成的挑战id
  claimed: string[]    // 已领取奖励的挑战id
}

// ==== 专项练习 ====
export type PracticeType = 'chop' | 'season' | 'heat'

export interface PracticeRecord {
  id: string
  type: PracticeType
  score: number
  accuracy: number
  stars: number
  date: string
  durationSeconds: number
}

export interface GameState {
  currentScene: Scene
  mode: GameMode
  selectedRecipe: Recipe | null
  
  currentStepIndex: number
  stepsCompleted: boolean[]
  currentTaskId: string | null
  
  taskAssignments: Record<string, Player | null>
  
  chopRhythmScores: number[]
  seasonTimingScores: number[]
  
  timer: {
    totalSeconds: number
    remainingSeconds: number
    isRunning: boolean
  }
  heatLevel: number
  heatHistory: number[]
  stirQuality: number[]
  activeIncident: Incident | null
  incidentProgress: { p1: boolean; p2: boolean }
  incidentsResolved: number
  incidentsFailed: number
  
  playerActions: PlayerAction[]
  waitCounter: {
    p1WaitedForP2: number
    p2WaitedForP1: number
  }
  
  finalScore: FinalScore | null
  
  unlockedRecipes: string[]
  unlockedAchievements: string[]
  scoreHistory: ScoreRecord[]
  learnedIngredients: string[]
  familyMembers: FamilyMember[]
  stickers: Sticker[]
  weeklyProgress: WeeklyProgress | null
  practiceHistory: PracticeRecord[]
}

export type GameAction =
  | { type: 'SET_SCENE'; scene: Scene }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SELECT_RECIPE'; recipe: Recipe }
  | { type: 'ASSIGN_TASK'; taskId: string; player: Player | null }
  | { type: 'SET_CURRENT_STEP'; index: number }
  | { type: 'COMPLETE_STEP'; index: number }
  | { type: 'SET_CURRENT_TASK'; taskId: string | null }
  | { type: 'ADD_CHOP_SCORE'; score: number }
  | { type: 'ADD_SEASON_SCORE'; score: number }
  | { type: 'INIT_TIMER'; total: number }
  | { type: 'TICK_TIMER' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'SET_HEAT'; level: number }
  | { type: 'ADD_STIR_QUALITY'; quality: number }
  | { type: 'TRIGGER_INCIDENT'; incident: Incident }
  | { type: 'RESOLVE_INCIDENT'; player: Player }
  | { type: 'FAIL_INCIDENT' }
  | { type: 'RECORD_ACTION'; action: PlayerAction }
  | { type: 'INCREMENT_WAIT'; waiter: Player }
  | { type: 'SET_FINAL_SCORE'; score: FinalScore }
  | { type: 'UNLOCK_RECIPE'; recipeId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'ADD_SCORE_RECORD'; record: ScoreRecord }
  | { type: 'LEARN_INGREDIENT'; ingredientId: string }
  | { type: 'RESET_SESSION' }
  | { type: 'LOAD_STATE'; state: Partial<GameState> }
  | { type: 'SET_FAMILY_MEMBER'; member: FamilyMember }
  | { type: 'ADD_STICKER'; sticker: Sticker }
  | { type: 'UPDATE_WEEKLY_PROGRESS'; challengeId: string; amount?: number }
  | { type: 'CLAIM_WEEKLY_REWARD'; challengeId: string }
  | { type: 'SET_WEEKLY_PROGRESS'; progress: WeeklyProgress }
  | { type: 'ADD_PRACTICE_RECORD'; record: PracticeRecord }
