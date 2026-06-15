import type { WeeklyChallenge } from '../types/game'

// 每周挑战池 - 实际每周从中随机选3个
export const WEEKLY_CHALLENGE_POOL: Omit<WeeklyChallenge, 'weekKey'>[] = [
  { id: 'wc_cook_salad', title: '清凉夏日', description: '完成一道凉菜（蔬菜沙拉）', icon: '🥗', type: 'cook', target: 1, reward: 'sticker_salad_week' },
  { id: 'wc_learn_3', title: '食材小学者', description: '学会3种食材的小知识', icon: '📚', type: 'learn_ingredient', target: 3, reward: 'sticker_ingredient_3' },
  { id: 'wc_incident_10', title: '救火队长', description: '成功处理10次厨房小状况', icon: '🚒', type: 'handle_incident', target: 10, reward: 'sticker_firefighter' },
  { id: 'wc_coop_5', title: '默契搭档', description: '双人模式完成5次做菜', icon: '🤝', type: 'coop', target: 5, reward: 'sticker_coop_5' },
  { id: 'wc_cook_3', title: '美食三连', description: '完成任意3道菜', icon: '🍳', type: 'cook', target: 3, reward: 'sticker_first_dish' },
  { id: 'wc_practice_chop', title: '刀工练习生', description: '完成3次切菜专项练习', icon: '🔪', type: 'practice', target: 3, reward: 'sticker_first_dish' },
  { id: 'wc_perfect_week', title: '完美之作', description: '任意一道菜获得5星评价', icon: '⭐', type: 'cook', target: 1, reward: 'sticker_perfect_week' },
]

// 生成当前周的key 如 '2026-W24'
export const getCurrentWeekKey = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const start = new Date(year, 0, 1)
  const diff = now.getTime() - start.getTime()
  const week = Math.ceil((diff + start.getDay() * 86400000) / (7 * 86400000))
  return `${year}-W${week}`
}

// 从池中选取本周挑战
export const generateWeeklyChallenges = (weekKey: string): WeeklyChallenge[] => {
  return WEEKLY_CHALLENGE_POOL.map(c => ({ ...c, weekKey }))
}
