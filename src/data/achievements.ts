import type { Achievement } from '../types/game'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_dish',
    name: '初次下厨',
    description: '完成第一道菜！恭喜成为小厨师~',
    icon: '👶🍳',
    category: 'beginner',
    condition: { type: 'recipes_cooked', value: 1 }
  },
  {
    id: 'three_dishes',
    name: '厨房新手',
    description: '已经完成3道菜啦，越来越熟练！',
    icon: '🌟',
    category: 'beginner',
    condition: { type: 'recipes_cooked', value: 3 }
  },
  {
    id: 'five_dishes',
    name: '小厨师认证',
    description: '完成5道菜，可以颁发小厨师证书啦！',
    icon: '🏅',
    category: 'beginner',
    condition: { type: 'recipes_cooked', value: 5 }
  },
  {
    id: 'perfect_3',
    name: '三星大厨',
    description: '任意一道菜获得3星评价！',
    icon: '⭐⭐⭐',
    category: 'skill',
    condition: { type: 'perfect_stars', value: 3 }
  },
  {
    id: 'perfect_5',
    name: '五星满分',
    description: '完美！获得了满星5星评价！',
    icon: '🌟🌟🌟🌟🌟',
    category: 'skill',
    condition: { type: 'perfect_stars', value: 5 }
  },
  {
    id: 'coop_1',
    name: '搭档上场',
    description: '第一次双人合作完成做菜！',
    icon: '🤝',
    category: 'cooperation',
    condition: { type: 'coop_games', value: 1 }
  },
  {
    id: 'coop_5',
    name: '默契搭档',
    description: '双人模式完成5次合作，配合越来越好了~',
    icon: '💑',
    category: 'cooperation',
    condition: { type: 'coop_games', value: 5 }
  },
  {
    id: 'incident_10',
    name: '救火队长',
    description: '成功处理了10次厨房小状况！',
    icon: '🚒',
    category: 'skill',
    condition: { type: 'incidents_solved', value: 10 }
  },
  {
    id: 'ingredients_5',
    name: '食材小达人',
    description: '学习了5种食材的小知识！',
    icon: '🥬📚',
    category: 'collection',
    condition: { type: 'ingredients_learned', value: 5 }
  },
  {
    id: 'ingredients_10',
    name: '食材博士',
    description: '认识了10种食材，懂得真多！',
    icon: '🎓',
    category: 'collection',
    condition: { type: 'ingredients_learned', value: 10 }
  },
]

export const checkAchievement = (
  achievement: Achievement,
  stats: {
    recipesCooked: number
    maxStars: number
    coopGames: number
    incidentsSolved: number
    ingredientsLearned: number
  }
): boolean => {
  const { condition } = achievement
  switch (condition.type) {
    case 'recipes_cooked':
      return stats.recipesCooked >= condition.value
    case 'perfect_stars':
      return stats.maxStars >= condition.value
    case 'coop_games':
      return stats.coopGames >= condition.value
    case 'incidents_solved':
      return stats.incidentsSolved >= condition.value
    case 'ingredients_learned':
      return stats.ingredientsLearned >= condition.value
    default:
      return false
  }
}
