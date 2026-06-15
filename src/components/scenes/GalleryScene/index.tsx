// @ts-nocheck
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { StarRating } from '@/components/common/StarRating'
import { useSoundFX } from '@/hooks/useSoundFX'
import { RECIPES } from '@/data/recipes'
import { INGREDIENTS } from '@/data/ingredients'
import { ACHIEVEMENTS } from '@/data/achievements'
import { STICKERS, getStickerById } from '@/data/stickers'
import { generateWeeklyChallenges, getCurrentWeekKey } from '@/data/weeklyChallenges'
import { formatTime, getPlayerLabel } from '@/utils/scoring'
import type { ScoreRecord, WeeklyChallenge } from '@/types/game'

type Tab = 'recipes' | 'ingredients' | 'weekly' | 'achievements' | 'stickers' | 'history' | 'weeklyReport'

const isInThisWeek = (dateStr: string): boolean => {
  const d = new Date(dateStr)
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return d >= start && d < end
}

const getWeekRange = (): string => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
}

const getCurrentWeekNumber = (): number => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
}

const TabButton: React.FC<{
  active: boolean
  icon: string
  label: string
  count?: string
  onClick: () => void
}> = ({ active, icon, label, count, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      flex-1 md:flex-none md:px-6 px-3 py-3 rounded-2xl font-happy text-sm md:text-base
      transition-all flex items-center justify-center gap-2
      ${active 
        ? 'bg-warm-400 text-white shadow-candy scale-105' 
        : 'bg-white/70 text-gray-600 hover:bg-white border-2 border-cream-200'}
    `}
  >
    <span className="text-xl">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
    {count && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active ? 'bg-white/30' : 'bg-cream-200 text-gray-500'
      }`}>
        {count}
      </span>
    )}
  </motion.button>
)

// ==== 菜谱图鉴 ====
const RecipeBook: React.FC = () => {
  const { state } = useGame()
  const { unlockedRecipes, scoreHistory } = state
  const navigate = useNavigate()
  const sound = useSoundFX()
  const { dispatch, selectRecipe } = useGame()

  const bestByRecipe = useMemo(() => {
    const map: Record<string, ScoreRecord> = {}
    scoreHistory.forEach(r => {
      if (!map[r.recipeId] || r.totalScore > map[r.recipeId].totalScore) {
        map[r.recipeId] = r
      }
    })
    return map
  }, [scoreHistory])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {RECIPES.map((recipe, idx) => {
        const unlocked = unlockedRecipes.includes(recipe.id)
        const best = bestByRecipe[recipe.id]
        const rotate = (idx % 2 === 0 ? -1 : 1) * 1.5

        return (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            style={{ transform: `rotate(${rotate}deg)` }}
            whileHover={{ rotate: 0, scale: unlocked ? 1.05 : 1, y: unlocked ? -6 : 0 }}
          >
            <Card
              color={unlocked ? recipe.colorTheme : undefined}
              hover={unlocked}
              className={`relative h-full ${!unlocked && 'opacity-70 grayscale'}`}
            >
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {unlocked ? recipe.emoji : '❓'}
                </div>
                <h4 className="font-happy text-xl mb-1" style={{ color: unlocked ? recipe.colorTheme : '#999' }}>
                  {unlocked ? recipe.name : '???'}
                </h4>
                
                {unlocked ? (
                  <>
                    <div className="flex justify-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < recipe.difficulty ? 'text-warm-500' : 'text-gray-200'}>🌶️</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">约 {recipe.estimatedMinutes} 分钟</p>
                    
                    {best ? (
                      <div className="pt-3 border-t border-cream-200">
                        <div className="flex justify-center gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < best.stars ? 'text-yolk-500' : 'text-gray-200'}>⭐</span>
                          ))}
                        </div>
                        <p className="font-happy text-warm-500">最高分 {best.totalScore}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 pt-3 border-t border-cream-200">
                        还没做过哦~
                      </p>
                    )}

                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      className="mt-3"
                      onClick={() => {
                        sound.playClick()
                        selectRecipe(recipe)
                        dispatch({ type: 'SET_SCENE', scene: 'prep' })
                        if (state.mode === 'single') {
                          recipe.steps.forEach(step => {
                            step.tasks.forEach(task => {
                              dispatch({ type: 'ASSIGN_TASK', taskId: task.id, player: 'p1' })
                            })
                          })
                        }
                        setTimeout(() => navigate('/prep'), 400)
                      }}
                    >
                      去做菜
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 mt-3">
                    🔒 {recipe.unlockCondition || '神秘菜谱'}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ==== 食材知识卡片 ====
const IngredientCards: React.FC = () => {
  const { state, dispatch } = useGame()
  const { learnedIngredients } = state
  const sound = useSoundFX()
  const [flipped, setFlipped] = useState<string | null>(null)

  // 已解锁菜谱中包含的食材
  const availableIngredients = useMemo(() => {
    const set = new Set<string>()
    state.unlockedRecipes.forEach(rid => {
      const recipe = RECIPES.find(r => r.id === rid)
      recipe?.ingredientIds.forEach(id => set.add(id))
    })
    return Array.from(set)
  }, [state.unlockedRecipes])

  const handleFlip = (id: string) => {
    sound.playClick()
    if (!learnedIngredients.includes(id)) {
      dispatch({ type: 'LEARN_INGREDIENT', ingredientId: id })
    }
    setFlipped(flipped === id ? null : id)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {INGREDIENTS.map((ing, idx) => {
        const available = availableIngredients.includes(ing.id)
        const learned = learnedIngredients.includes(ing.id)
        const isFlipped = flipped === ing.id

        return (
          <motion.div
            key={ing.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
            style={{ perspective: 1000 }}
            className="aspect-[3/4]"
          >
            <motion.div
              className="w-full h-full cursor-pointer relative"
              whileHover={available ? { scale: 1.03 } : undefined}
              whileTap={available ? { rotateY: isFlipped ? 0 : 180 } : undefined}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => available && handleFlip(ing.id)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 正面 */}
              <div
                className="absolute inset-0 rounded-3xl bg-white border-4 shadow-lg flex flex-col items-center justify-center p-4"
                style={{
                  backfaceVisibility: 'hidden',
                  borderColor: available 
                    ? (learned ? '#7FD1AE' : '#FFEED9') 
                    : '#E5E7EB',
                  opacity: available ? 1 : 0.5,
                }}
              >
                <div className={`text-6xl mb-3 ${!available && 'grayscale'}`}>
                  {available ? ing.emoji : '❓'}
                </div>
                <h4 className={`font-happy text-xl ${!available && 'text-gray-400'}`}>
                  {available ? ing.name : '???'}
                </h4>
                {learned && (
                  <span className="mt-2 text-xs bg-mint-100 text-mint-600 px-3 py-1 rounded-full font-happy">
                    ✓ 已学习
                  </span>
                )}
                {!available && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    解锁对应菜谱后可见
                  </p>
                )}
              </div>
              {/* 背面 */}
              {available && (
                <div
                  className="absolute inset-0 rounded-3xl p-4 flex flex-col justify-center border-4 shadow-lg"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #FFF8F0, #FFEED9)',
                    borderColor: '#FFB366',
                  }}
                >
                  <h4 className="font-happy text-warm-500 text-lg mb-2 text-center">
                    {ing.emoji} {ing.name}
                  </h4>
                  <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                    <span className="font-bold text-warm-500">💡 </span>
                    {ing.funFact}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-mint-500">🥗 </span>
                    {ing.nutrition}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ==== 成就墙 ====
const AchievementWall: React.FC = () => {
  const { state } = useGame()
  const { unlockedAchievements } = state

  const categories = [
    { id: 'beginner', label: '入门', icon: '🌱' },
    { id: 'skill', label: '技能', icon: '🎯' },
    { id: 'cooperation', label: '协作', icon: '🤝' },
    { id: 'collection', label: '收集', icon: '📚' },
  ]

  return (
    <div className="space-y-6">
      {categories.map(cat => {
        const items = ACHIEVEMENTS.filter(a => a.category === cat.id)
        if (items.length === 0) return null
        
        return (
          <div key={cat.id}>
            <h4 className="font-happy text-xl text-gray-700 mb-3 flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.label}成就
              <span className="text-xs font-body text-gray-400 ml-2">
                {items.filter(a => unlockedAchievements.includes(a.id)).length}/{items.length}
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((a, idx) => {
                const unlocked = unlockedAchievements.includes(a.id)
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      color={unlocked ? '#C9B1FF' : undefined}
                      className={`text-center h-full ${!unlocked && 'opacity-60 grayscale'}`}
                      padded={false}
                    >
                      <div className="p-5">
                        <motion.div
                          animate={unlocked ? { 
                            rotate: [0, 10, -10, 0],
                            transition: { repeat: Infinity, repeatDelay: 3 + idx, duration: 0.6 }
                          } : undefined}
                          className="text-5xl mb-2"
                        >
                          {unlocked ? a.icon : '🔒'}
                        </motion.div>
                        <h5 className={`font-happy text-lg mb-1 ${
                          unlocked ? 'text-lavender-400' : 'text-gray-500'
                        }`}>
                          {unlocked ? a.name : '???'}
                        </h5>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {unlocked ? a.description : '继续努力解锁！'}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ==== 历史成绩 ====
const HistoryTable: React.FC = () => {
  const { state } = useGame()
  const { scoreHistory, familyMembers } = state

  const getPlayerInfo = (record: ScoreRecord, player: 'p1' | 'p2') => {
    const defaultMember = familyMembers.find(m => m.id === `${player}_default`)
    if (player === 'p1') {
      return {
        name: record.p1Name || defaultMember?.name || '玩家1',
        avatar: defaultMember?.avatar || '👨‍🍳',
      }
    }
    return {
      name: record.p2Name || defaultMember?.name || '玩家2',
      avatar: defaultMember?.avatar || '👧🍳',
    }
  }

  const grouped = useMemo(() => {
    const map: Record<string, ScoreRecord[]> = {}
    scoreHistory.forEach(r => {
      if (!map[r.recipeId]) map[r.recipeId] = []
      map[r.recipeId].push(r)
    })
    return map
  }, [scoreHistory])

  if (scoreHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl mb-4"
        >
          🍽️
        </motion.div>
        <p className="font-happy text-2xl text-gray-500 mb-2">还没有做菜记录</p>
        <p className="text-gray-400">快去完成第一道菜吧~</p>
      </div>
    )
  }

  const totalDishes = scoreHistory.length
  const avgScore = Math.round(scoreHistory.reduce((s, r) => s + r.totalScore, 0) / totalDishes)
  const totalStars = scoreHistory.reduce((s, r) => s + r.stars, 0)
  const coopCount = scoreHistory.filter(r => r.mode === 'coop').length

  return (
    <div className="space-y-6">
      {/* 总览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon="🍽️" label="累计做菜" value={`${totalDishes}道`} color="#FFB366" />
        <StatBox icon="⭐" label="总星数" value={`${totalStars}颗`} color="#FFD93D" />
        <StatBox icon="📊" label="平均分" value={`${avgScore}`} color="#7FD1AE" />
        <StatBox icon="👥" label="双人合作" value={`${coopCount}次`} color="#C9B1FF" />
      </div>

      {/* 按菜谱分组 */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([rid, records]) => {
          const recipe = RECIPES.find(r => r.id === rid)
          if (!recipe) return null
          const best = records.reduce((a, b) => a.totalScore > b.totalScore ? a : b)

          return (
            <Card key={rid} color={recipe.colorTheme} padded={false}>
              <div 
                className="p-4 border-b border-cream-200 flex items-center gap-3 flex-wrap"
                style={{ background: `linear-gradient(135deg, ${recipe.colorTheme}15, #fff)` }}
              >
                <span className="text-4xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-happy text-2xl" style={{ color: recipe.colorTheme }}>
                    {recipe.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    已做 {records.length} 次 · 最佳：
                    <span className="font-bold text-warm-500 ml-1">{best.totalScore}分</span>
                  </p>
                </div>
                <div className="text-right">
                  <StarRating stars={best.stars} size="sm" animated={false} />
                </div>
              </div>

              <div className="divide-y divide-cream-100 max-h-64 overflow-y-auto scrollbar-hide">
                {records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((r, i) => (
                    <div key={r.id} className="px-4 py-3 flex items-center gap-3 hover:bg-cream-50/50">
                      <span className="text-xs text-gray-400 w-14 shrink-0">#{records.length - i}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-happy text-lg text-warm-500">
                            {r.totalScore}
                          </span>
                          <span className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <span key={si} className={si < r.stars ? 'text-yolk-500 text-xs' : 'text-gray-200 text-xs'}>⭐</span>
                            ))}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            r.mode === 'coop' ? 'bg-lavender-200 text-purple-700' : 'bg-sky-100 text-sky-700'
                          }`}>
                            {r.mode === 'coop' ? '双人' : '单人'}
                          </span>
                          <div className="flex items-center gap-1.5 ml-1">
                            {r.mode === 'coop' ? (
                              <>
                                <div className="flex -space-x-1">
                                  <span className="text-base" title={getPlayerInfo(r, 'p1').name}>
                                    {getPlayerInfo(r, 'p1').avatar}
                                  </span>
                                  <span className="text-base" title={getPlayerInfo(r, 'p2').name}>
                                    {getPlayerInfo(r, 'p2').avatar}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-500">
                                  {getPlayerInfo(r, 'p1').name} & {getPlayerInfo(r, 'p2').name}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-base" title={getPlayerInfo(r, 'p1').name}>
                                  {getPlayerInfo(r, 'p1').avatar}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {getPlayerInfo(r, 'p1').name} 单人
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          准确度 {r.accuracyScore} · 
                          {r.mode === 'coop' ? ` 配合度 ${r.cooperationScore} ·` : ''}
                          {' '}解决小状况${r.incidentsResolved || 0}次 · 用时 {formatTime(r.durationSeconds)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(r.date).toLocaleDateString('zh-CN', { 
                          month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ==== 每周挑战 ====
const WeeklyChallenges: React.FC = () => {
  const { state, addSticker, claimWeeklyReward } = useGame()
  const { weeklyProgress } = state
  const sound = useSoundFX()

  const weekKey = weeklyProgress?.weekKey || getCurrentWeekKey()
  const challenges: WeeklyChallenge[] = generateWeeklyChallenges(weekKey)
  const weekNumber = parseInt(weekKey.split('-W')[1] || '0', 10)

  const handleClaim = (challenge: WeeklyChallenge) => {
    sound.playClick()
    const sticker = getStickerById(challenge.reward)
    if (sticker) {
      addSticker(sticker)
    }
    claimWeeklyReward(challenge.id)
  }

  const getStatus = (challenge: WeeklyChallenge) => {
    const progress = weeklyProgress?.progress[challenge.id] || 0
    const claimed = weeklyProgress?.claimed.includes(challenge.id)
    const completed = progress >= challenge.target

    if (claimed) return 'claimed'
    if (completed) return 'completed'
    return 'in_progress'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'claimed': return '✓ 已领取'
      case 'completed': return '已完成'
      default: return '进行中'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return '#9CA3AF'
      case 'completed': return '#7FD1AE'
      default: return '#FFB366'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-2"
        >
          🎯
        </motion.div>
        <h3 className="font-happy text-2xl text-warm-500">
          本周挑战 · 第{weekNumber}周
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          完成挑战，收集限定贴纸！
        </p>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge, idx) => {
          const progress = weeklyProgress?.progress[challenge.id] || 0
          const status = getStatus(challenge)
          const progressPercent = Math.min(100, (progress / challenge.target) * 100)
          const rewardSticker = getStickerById(challenge.reward)

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                color={getStatusColor(status)}
                className={`relative overflow-hidden ${status === 'claimed' ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={status === 'completed' ? {
                      scale: [1, 1.1, 1],
                      transition: { repeat: Infinity, duration: 1.5 }
                    } : undefined}
                    className="text-5xl shrink-0"
                  >
                    {challenge.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-happy text-xl text-gray-700">
                        {challenge.title}
                      </h4>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-happy"
                        style={{
                          background: `${getStatusColor(status)}20`,
                          color: getStatusColor(status),
                        }}
                      >
                        {getStatusText(status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {challenge.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-cream-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                          className="h-full rounded-full"
                          style={{
                            background: status === 'claimed'
                              ? '#9CA3AF'
                              : `linear-gradient(90deg, ${getStatusColor(status)}, ${getStatusColor(status)}dd)`,
                          }}
                        />
                      </div>
                      <span className="font-happy text-sm text-gray-600 shrink-0">
                        {Math.min(progress, challenge.target)}/{challenge.target}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-center">
                    <div className="text-3xl mb-1">
                      {rewardSticker?.emoji || '🎁'}
                    </div>
                    {status === 'completed' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleClaim(challenge)}
                        className="mt-1"
                      >
                        领取奖励
                      </Button>
                    )}
                    {status === 'claimed' && (
                      <span className="text-xs text-gray-400 font-happy">
                        ✓ 已领取
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ==== 家庭成长周报 ====
const WeeklyReport: React.FC = () => {
  const { state } = useGame()
  const { scoreHistory, practiceHistory, stickers, familyMembers } = state
  const weekNumber = getCurrentWeekNumber()
  const weekRange = getWeekRange()

  const weeklyDishes = useMemo(() => {
    return scoreHistory.filter(r => isInThisWeek(r.date))
  }, [scoreHistory])

  const dishStats = useMemo(() => {
    const map: Record<string, { recipe: typeof RECIPES[0]; count: number; bestScore: ScoreRecord; dates: string[] }> = {}
    weeklyDishes.forEach(r => {
      const recipe = RECIPES.find(rec => rec.id === r.recipeId)
      if (!recipe) return
      if (!map[r.recipeId]) {
        map[r.recipeId] = { recipe, count: 0, bestScore: r, dates: [] }
      }
      map[r.recipeId].count += 1
      map[r.recipeId].dates.push(r.date)
      if (r.totalScore > map[r.recipeId].bestScore.totalScore) {
        map[r.recipeId].bestScore = r
      }
    })
    return Object.values(map)
  }, [weeklyDishes])

  const participationStats = useMemo(() => {
    const stats: Record<string, { name: string; avatar: string; count: number }> = {}
    familyMembers.forEach(m => {
      stats[m.id] = { name: m.name, avatar: m.avatar, count: 0 }
    })
    weeklyDishes.forEach(r => {
      if (r.p1Name) {
        const p1 = familyMembers.find(m => m.id === 'p1_default')
        if (p1) stats[p1.id].count += 1
      }
      if (r.mode === 'coop' && r.p2Name) {
        const p2 = familyMembers.find(m => m.id === 'p2_default')
        if (p2) stats[p2.id].count += 1
      }
    })
    return Object.values(stats)
  }, [weeklyDishes, familyMembers])

  const weeklyPractice = useMemo(() => {
    return practiceHistory.filter(p => isInThisWeek(p.date))
  }, [practiceHistory])

  const practiceProgress = useMemo(() => {
    if (weeklyPractice.length === 0) return null
    const types: Record<string, { scores: number[]; type: string; emoji: string; label: string }> = {
      chop: { scores: [], type: 'chop', emoji: '🔪', label: '切菜' },
      season: { scores: [], type: 'season', emoji: '🧂', label: '调味' },
      heat: { scores: [], type: 'heat', emoji: '🔥', label: '火候' },
    }
    weeklyPractice.forEach(p => {
      if (types[p.type]) {
        types[p.type].scores.push(p.score)
      }
    })
    const results = Object.values(types)
      .filter(t => t.scores.length > 0)
      .map(t => {
        const avg = Math.round(t.scores.reduce((a, b) => a + b, 0) / t.scores.length)
        const first = t.scores[t.scores.length - 1]
        const last = t.scores[0]
        const improvement = last - first
        return { ...t, avg, first, last, improvement }
      })
      .sort((a, b) => b.improvement - a.improvement)
    return results.length > 0 ? results[0] : null
  }, [weeklyPractice])

  const weeklyStickers = useMemo(() => {
    return stickers.filter(s => s.obtainedAt && isInThisWeek(s.obtainedAt))
  }, [stickers])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'epic': return '#C9B1FF'
      case 'rare': return '#7FD1AE'
      default: return '#FFB366'
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'epic': return '史诗'
      case 'rare': return '稀有'
      default: return '普通'
    }
  }

  const generateSummary = (): string[] => {
    const messages: string[] = []
    const coopCount = weeklyDishes.filter(r => r.mode === 'coop').length
    const hasFiveStar = weeklyDishes.some(r => r.stars >= 5)

    if (weeklyDishes.length >= 3) {
      messages.push('这周咱们一起做了好多菜，厨房越来越热闹啦！')
    }
    if (coopCount >= 2) {
      messages.push('家长和小朋友配合越来越默契啦，为你们骄傲~')
    }
    if (hasFiveStar) {
      messages.push('太棒了！拿到了满星评价，真是大厨级别！')
    }
    if (weeklyStickers.length >= 3) {
      messages.push('这周收获了这么多贴纸，真是满满的成就感~')
    }
    if (messages.length === 0) {
      messages.push('下周继续加油，一起解锁更多美食和贴纸吧！')
    }
    return messages.slice(0, 3)
  }

  const summary = generateSummary()
  const totalParticipation = participationStats.reduce((s, p) => s + p.count, 0) || 1

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-2"
        >
          📰
        </motion.div>
        <h3 className="font-happy text-2xl md:text-3xl text-warm-500">
          本周家庭成长周报 · 第{weekNumber}周
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {weekRange}
        </p>
      </div>

      <Card color="#FFB366" className="mb-6">
        <h4 className="font-happy text-xl text-gray-700 mb-3 flex items-center gap-2">
          <span>🍳</span>
          本周美食记录
          <span className="text-xs font-body text-gray-400 ml-2">
            共做了 {weeklyDishes.length} 道菜
          </span>
        </h4>
        {dishStats.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🍽️</div>
            <p>本周还没做菜哦，快去厨房大显身手吧~</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {dishStats.map((d, idx) => (
              <motion.div
                key={d.recipe.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="shrink-0 w-36"
              >
                <Card color={d.recipe.colorTheme} className="text-center h-full">
                  <div className="text-4xl mb-1">{d.recipe.emoji}</div>
                  <h5 className="font-happy text-sm text-gray-700 mb-1">{d.recipe.name}</h5>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < d.bestScore.stars ? 'text-yolk-500 text-xs' : 'text-gray-200 text-xs'}>⭐</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {new Date(d.dates[0]).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </p>
                  {d.count > 1 && (
                    <span className="inline-block mt-1 text-[10px] bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full font-happy">
                      × {d.count} 次
                    </span>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      <Card color="#7FD1AE" className="mb-6">
        <h4 className="font-happy text-xl text-gray-700 mb-4 flex items-center gap-2">
          <span>👥</span>
          家庭参与榜
        </h4>
        <div className="space-y-4">
          {participationStats.map((p, idx) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="text-3xl shrink-0">{p.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-happy text-gray-700">{p.name}</span>
                  <span className="text-sm text-gray-500">参与了 {p.count} 次</span>
                </div>
                <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.count / totalParticipation) * 100}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.2 }}
                    className="h-full rounded-full"
                    style={{
                      background: idx === 0 
                        ? 'linear-gradient(90deg, #7FD1AE, #5BBF9A)'
                        : 'linear-gradient(90deg, #FFB366, #FF9F43)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {participationStats.length >= 2 && (
            <p className="text-center text-sm text-gray-500 pt-2 border-t border-cream-200">
              {participationStats[0].name}参与了 {participationStats[0].count} 次 · {participationStats[1].name}参与了 {participationStats[1].count} 次
            </p>
          )}
        </div>
      </Card>

      <Card color="#C9B1FF" className="mb-6">
        <h4 className="font-happy text-xl text-gray-700 mb-3 flex items-center gap-2">
          <span>📈</span>
          进步最大的任务
        </h4>
        {!practiceProgress ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎯</div>
            <p>本周还没专项练习，快去试试吧~</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-6xl mb-3">{practiceProgress.emoji}</div>
            <h5 className="font-happy text-2xl text-lavender-400 mb-2">
              {practiceProgress.label}进步最大！
            </h5>
            <p className="text-gray-600">
              平均分数从 <span className="font-bold text-gray-500">{practiceProgress.first}</span>
              {' → '}
              <span className="font-bold text-lavender-500">{practiceProgress.last}</span>
              {' 🎉'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              共练习 {practiceProgress.scores.length} 次，平均分 {practiceProgress.avg}
            </p>
          </motion.div>
        )}
      </Card>

      <Card color="#FFD93D" className="mb-6">
        <h4 className="font-happy text-xl text-gray-700 mb-3 flex items-center gap-2">
          <span>🎨</span>
          本周获得的贴纸
          <span className="text-xs font-body text-gray-400 ml-2">
            {weeklyStickers.length} 张
          </span>
        </h4>
        {weeklyStickers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎁</div>
            <p>本周继续努力，能拿更多贴纸哦~</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {weeklyStickers.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div
                  className="rounded-2xl p-3 text-center border-2 bg-white"
                  style={{
                    borderColor: getRarityColor(s.rarity),
                    boxShadow: `0 0 15px ${getRarityColor(s.rarity)}30`,
                  }}
                >
                  <div className="text-3xl mb-1">{s.emoji}</div>
                  <h5 className="font-happy text-xs text-gray-700 mb-1">{s.name}</h5>
                  <span
                    className="inline-block text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: `${getRarityColor(s.rarity)}20`,
                      color: getRarityColor(s.rarity),
                    }}
                  >
                    {getRarityLabel(s.rarity)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      <Card color="#FF9AA2" className="bg-gradient-to-br from-pink-50 to-cream-50">
        <h4 className="font-happy text-xl text-gray-700 mb-3 flex items-center gap-2">
          <span>💝</span>
          本周总结
        </h4>
        <div className="space-y-2">
          {summary.map((msg, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="text-gray-600 leading-relaxed"
            >
              {msg}
            </motion.p>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ==== 贴纸收藏 ====
const StickerCollection: React.FC = () => {
  const { state, toggleShowcaseSticker } = useGame()
  const { stickers, showcasedStickers } = state
  const sound = useSoundFX()
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)

  const categories = [
    { id: 'challenge', label: '挑战贴纸', icon: '🎯' },
    { id: 'achievement', label: '成就贴纸', icon: '🏆' },
    { id: 'special', label: '特殊贴纸', icon: '✨' },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'epic': return '#C9B1FF'
      case 'rare': return '#7FD1AE'
      default: return '#FFB366'
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'epic': return '史诗'
      case 'rare': return '稀有'
      default: return '普通'
    }
  }

  const isUnlocked = (stickerId: string) => {
    return stickers.some(s => s.id === stickerId)
  }

  const getObtainedSticker = (stickerId: string) => {
    return stickers.find(s => s.id === stickerId)
  }

  const handleStickerClick = (stickerId: string) => {
    if (isUnlocked(stickerId)) {
      sound.playClick()
      setSelectedSticker(selectedSticker === stickerId ? null : stickerId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-6xl mb-2"
        >
          🎨
        </motion.div>
        <h3 className="font-happy text-2xl text-warm-500">
          贴纸收藏
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          已收集 {stickers.length}/{STICKERS.length} 张贴纸
        </p>
      </div>

      {categories.map(cat => {
        const catStickers = STICKERS.filter(s => s.category === cat.id)
        if (catStickers.length === 0) return null

        const unlockedCount = catStickers.filter(s => isUnlocked(s.id)).length

        return (
          <div key={cat.id}>
            <h4 className="font-happy text-xl text-gray-700 mb-3 flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.label}
              <span className="text-xs font-body text-gray-400 ml-2">
                {unlockedCount}/{catStickers.length}
              </span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {catStickers.map((sticker, idx) => {
                const unlocked = isUnlocked(sticker.id)
                const obtained = getObtainedSticker(sticker.id)
                const isSelected = selectedSticker === sticker.id

                return (
                  <motion.div
                    key={sticker.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="relative"
                  >
                    <motion.div
                      whileHover={unlocked ? { scale: 1.05, y: -4 } : undefined}
                      whileTap={unlocked ? { scale: 0.95 } : undefined}
                      onClick={() => handleStickerClick(sticker.id)}
                      className={`
                        rounded-2xl p-4 text-center cursor-pointer border-2
                        transition-all
                        ${unlocked 
                          ? 'bg-white border-cream-200 hover:border-warm-300' 
                          : 'bg-gray-100 border-gray-200 grayscale opacity-60'}
                        ${isSelected ? 'ring-4 ring-warm-300 ring-opacity-50' : ''}
                      `}
                      style={{
                        boxShadow: unlocked
                          ? `0 0 20px ${getRarityColor(sticker.rarity)}40`
                          : 'none',
                      }}
                    >
                      <motion.div
                        animate={unlocked ? {
                          rotate: [0, 5, -5, 0],
                          transition: {
                            repeat: Infinity,
                            repeatDelay: 2 + idx,
                            duration: 0.8,
                          }
                        } : undefined}
                        className="text-4xl mb-2"
                      >
                        {unlocked ? sticker.emoji : '❓'}
                      </motion.div>
                      <h5 className={`font-happy text-sm ${
                        unlocked ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {unlocked ? sticker.name : '???'}
                      </h5>
                      {unlocked && (
                        <>
                          <span
                            className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              background: `${getRarityColor(sticker.rarity)}20`,
                              color: getRarityColor(sticker.rarity),
                            }}
                          >
                            {getRarityLabel(sticker.rarity)}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              sound.playClick()
                              toggleShowcaseSticker(sticker.id)
                            }}
                            className={`
                              mt-2 w-full py-1 px-2 rounded-full text-[10px] font-happy
                              transition-all
                              ${showcasedStickers.includes(sticker.id)
                                ? 'bg-mint-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                            `}
                          >
                            {showcasedStickers.includes(sticker.id)
                              ? '📌 已展示'
                              : '📍 展示到首页'}
                          </motion.button>
                        </>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {isSelected && obtained && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-10 top-full left-0 right-0 mt-2"
                        >
                          <Card color={getRarityColor(sticker.rarity)} className="text-left">
                            <h5 className="font-happy text-lg text-gray-700 mb-1">
                              {sticker.emoji} {sticker.name}
                            </h5>
                            <p className="text-xs text-gray-500 mb-2">
                              {sticker.description}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              获得时间：{new Date(obtained.obtainedAt || '').toLocaleDateString('zh-CN')}
                            </p>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const StatBox: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ 
  icon, label, value, color 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl p-4 border-2 border-cream-200 text-center"
  >
    <div className="text-3xl mb-1">{icon}</div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-happy text-2xl" style={{ color }}>{value}</p>
  </motion.div>
)

// ==== 主场景 ====
const GalleryScene: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useGame()
  const { unlockedRecipes, learnedIngredients, unlockedAchievements, scoreHistory, stickers, weeklyProgress, practiceHistory } = state
  const [tab, setTab] = useState<Tab>('recipes')
  const sound = useSoundFX()

  const weekKey = weeklyProgress?.weekKey || getCurrentWeekKey()
  const weeklyChallenges = generateWeeklyChallenges(weekKey)
  const completedWeekly = weeklyChallenges.filter(c => 
    (weeklyProgress?.progress[c.id] || 0) >= c.target
  ).length

  const weeklyReportCount = scoreHistory.filter(r => isInThisWeek(r.date)).length

  const tabs: { id: Tab; icon: string; label: string; count: string }[] = [
    { id: 'recipes', icon: '📖', label: '菜谱图鉴', count: `${unlockedRecipes.length}/${RECIPES.length}` },
    { id: 'weeklyReport', icon: '📰', label: '成长周报', count: `${weeklyReportCount}` },
    { id: 'ingredients', icon: '🥕', label: '食材知识', count: `${learnedIngredients.length}/${INGREDIENTS.length}` },
    { id: 'weekly', icon: '🎯', label: '每周挑战', count: `${completedWeekly}/${weeklyChallenges.length}` },
    { id: 'achievements', icon: '🏅', label: '成就徽章', count: `${unlockedAchievements.length}/${ACHIEVEMENTS.length}` },
    { id: 'stickers', icon: '🎨', label: '贴纸收藏', count: `${stickers.length}/${STICKERS.length}` },
    { id: 'history', icon: '📊', label: '历史成绩', count: `${scoreHistory.length}` },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => {
              sound.playClick()
              navigate('/')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-white/80 hover:bg-white text-gray-600 font-happy border-2 border-cream-200
                       transition-all hover:border-warm-300"
          >
            ← 返回做菜
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">📚</span>
            <h1 className="font-happy text-3xl md:text-4xl text-warm-500">
              快乐图鉴
            </h1>
          </div>
          <div className="w-[120px]"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Tab 切换 */}
        <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
          {tabs.map(t => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              icon={t.icon}
              label={t.label}
              count={t.count}
              onClick={() => {
                sound.playClick()
                setTab(t.id)
              }}
            />
          ))}
        </div>

        {/* 内容区 */}
        <Card className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'recipes' && <RecipeBook />}
              {tab === 'weeklyReport' && <WeeklyReport />}
              {tab === 'ingredients' && <IngredientCards />}
              {tab === 'weekly' && <WeeklyChallenges />}
              {tab === 'achievements' && <AchievementWall />}
              {tab === 'stickers' && <StickerCollection />}
              {tab === 'history' && <HistoryTable />}
            </motion.div>
          </AnimatePresence>
        </Card>
      </main>
    </div>
  )
}

export default GalleryScene
