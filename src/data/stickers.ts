import type { Sticker } from '../types/game'

export const STICKERS: Sticker[] = [
  // 挑战贴纸
  { id: 'sticker_first_dish', name: '第一次下厨', emoji: '🎖️', description: '完成人生第一道菜！', category: 'challenge', rarity: 'common' },
  { id: 'sticker_salad_week', name: '清凉一夏', emoji: '🥗', description: '本周完成一道凉菜~', category: 'challenge', rarity: 'common' },
  { id: 'sticker_ingredient_3', name: '食材小达人', emoji: '📚', description: '本周学会3种食材知识', category: 'challenge', rarity: 'common' },
  { id: 'sticker_firefighter', name: '救火英雄', emoji: '🚒', description: '本周处理10次小状况', category: 'challenge', rarity: 'rare' },
  { id: 'sticker_coop_5', name: '最佳搭档', emoji: '💑', description: '双人模式完成5次合作', category: 'challenge', rarity: 'rare' },
  { id: 'sticker_perfect_week', name: '完美一周', emoji: '⭐', description: '本周任意一道菜获得5星', category: 'challenge', rarity: 'epic' },
  
  // 成就贴纸
  { id: 'sticker_10_dishes', name: '十道菜大师', emoji: '🏆', description: '累计完成10道菜', category: 'achievement', rarity: 'rare' },
  { id: 'sticker_all_recipes', name: '菜谱全收集', emoji: '📖', description: '解锁所有菜谱', category: 'achievement', rarity: 'epic' },
  
  // 特殊贴纸
  { id: 'sticker_new_year', name: '新年快乐', emoji: '🧧', description: '新年限定贴纸', category: 'special', rarity: 'epic' },
  { id: 'sticker_birthday', name: '生日快乐', emoji: '🎂', description: '生日当天获得', category: 'special', rarity: 'epic' },
]

export const getStickerById = (id: string): Sticker | undefined => {
  return STICKERS.find(s => s.id === id)
}
