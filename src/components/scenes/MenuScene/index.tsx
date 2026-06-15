// @ts-nocheck
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { RECIPES } from '@/data/recipes'
import { INGREDIENTS, getIngredientById } from '@/data/ingredients'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { StarRating } from '@/components/common/StarRating'
import { useSpeechBubble } from '@/components/common/SpeechBubble'
import { useSoundFX } from '@/hooks/useSoundFX'
import type { Recipe } from '@/types/game'
import { getPlayerLabel } from '@/utils/scoring'

const RecipeCard: React.FC<{
  recipe: Recipe
  isUnlocked: boolean
  isSelected: boolean
  bestScore?: number
  bestStars?: number
  onClick: () => void
}> = ({ recipe, isUnlocked, isSelected, bestScore, bestStars, onClick }) => {
  const rotateDeg = useMemo(() => (Math.random() - 0.5) * 4, [])
  
  return (
    <motion.button
      whileHover={isUnlocked ? { 
        rotate: 0, 
        scale: 1.05, 
        y: -8,
        zIndex: 10
      } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
      animate={{
        rotate: rotateDeg,
        boxShadow: isSelected 
          ? `0 12px 40px ${recipe.colorTheme}66`
          : '0 6px 18px rgba(0,0,0,0.08)',
        borderColor: isSelected ? recipe.colorTheme : undefined,
        scale: isSelected ? 1.03 : 1,
      }}
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={`
        relative text-left p-5 rounded-3xl w-full
        border-4 transition-all
        ${isUnlocked ? 'bg-white cursor-pointer' : 'bg-gray-100 cursor-not-allowed opacity-70'}
        ${!isUnlocked && 'grayscale'}
      `}
      style={{ borderColor: isUnlocked ? `${recipe.colorTheme}40` : '#ccc' }}
    >
      <div className="text-center">
        <motion.div 
          className="text-6xl mb-2"
          animate={isUnlocked ? { y: [0, -4, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: Math.random() * 2 }}
        >
          {recipe.emoji}
        </motion.div>
        <h3 className="font-happy text-xl text-gray-800 mb-1">
          {isUnlocked ? recipe.name : '??? 未解锁'}
        </h3>
        
        {isUnlocked && (
          <>
            <div className="flex justify-center gap-1 mb-2 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < recipe.difficulty ? 'text-warm-500' : 'text-gray-200'}>
                  🌶️
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-3">⏱️ 约 {recipe.estimatedMinutes} 分钟</p>
            
            {bestStars !== undefined && (
              <div className="pt-2 border-t border-cream-200">
                <div className="flex justify-center gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < bestStars ? 'text-yolk-500 text-sm' : 'text-gray-200 text-sm'}>⭐</span>
                  ))}
                </div>
                <p className="text-xs text-warm-500 font-bold">最高分 {bestScore}</p>
              </div>
            )}
          </>
        )}
        
        {!isUnlocked && recipe.unlockCondition && (
          <p className="text-xs text-gray-400 mt-3">🔒 {recipe.unlockCondition}</p>
        )}
        
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-10 h-10 bg-mint-400 rounded-full 
                       flex items-center justify-center text-white text-xl shadow-lg"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}

const RecipeDetailModal: React.FC<{
  recipe: Recipe | null
  onClose: () => void
  learnedIngredients: string[]
  onLearnIngredient: (id: string) => void
}> = ({ recipe, onClose, learnedIngredients, onLearnIngredient }) => {
  if (!recipe) return null

  const ingredients = recipe.ingredientIds.map(id => getIngredientById(id)).filter(Boolean)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          style={{ border: `6px solid ${recipe.colorTheme}` }}
        >
          <div 
            className="p-8 text-center relative"
            style={{ background: `linear-gradient(135deg, ${recipe.colorTheme}22, #FFF8F0)` }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 
                         flex items-center justify-center text-xl hover:bg-white transition"
            >
              ✕
            </button>
            <motion.div 
              className="text-8xl mb-3"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {recipe.emoji}
            </motion.div>
            <h2 className="font-happy text-4xl text-gray-800 mb-2">{recipe.name}</h2>
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < recipe.difficulty ? 'text-2xl' : 'text-2xl opacity-20'}>🌶️</span>
              ))}
            </div>
            <p className="text-gray-600 max-w-md mx-auto">{recipe.story}</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-happy text-xl text-warm-500 mb-3 flex items-center gap-2">
                🥗 所需食材
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ingredients.map(ing => ing && (
                  <motion.button
                    key={ing.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!learnedIngredients.includes(ing.id)) {
                        onLearnIngredient(ing.id)
                      }
                    }}
                    className={`
                      p-3 rounded-2xl text-left border-2 transition-all
                      ${learnedIngredients.includes(ing.id) 
                        ? 'bg-mint-50 border-mint-300' 
                        : 'bg-cream-50 border-cream-200 hover:border-warm-300'}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{ing.emoji}</span>
                      <span className="font-happy text-lg">{ing.name}</span>
                      {learnedIngredients.includes(ing.id) && (
                        <span className="ml-auto text-mint-500 text-sm">✓已学</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{ing.funFact}</p>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-happy text-xl text-warm-500 mb-3 flex items-center gap-2">
                📋 制作步骤
              </h3>
              <div className="space-y-2">
                {recipe.steps.map(step => (
                  <div 
                    key={step.id}
                    className={`
                      p-3 rounded-2xl flex items-start gap-3
                      ${step.phase === 'prep' ? 'bg-lavender-50 border-l-4 border-lavender-400' 
                                              : 'bg-warm-50 border-l-4 border-warm-400'}
                    `}
                  >
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm 
                                    flex items-center justify-center font-happy font-bold text-warm-500 shrink-0">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-happy text-base">{step.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          step.phase === 'prep' ? 'bg-lavender-200 text-purple-700' 
                                                 : 'bg-warm-200 text-orange-700'
                        }`}>
                          {step.phase === 'prep' ? '备菜' : '烹饪'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      <p className="text-xs text-gray-400 mt-1">⏱️ 约 {step.targetDuration} 秒 · {step.tasks.length} 个小任务</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const MenuScene: React.FC = () => {
  const navigate = useNavigate()
  const { state, dispatch, selectRecipe, startCooking, checkUnlockRecipes } = useGame()
  const { selectedRecipe, unlockedRecipes, mode, scoreHistory, learnedIngredients } = state
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null)
  const showBubble = useSpeechBubble()
  const sound = useSoundFX()

  checkUnlockRecipes()

  const bestByRecipe = useMemo(() => {
    const map: Record<string, { score: number; stars: number }> = {}
    scoreHistory.forEach(record => {
      const prev = map[record.recipeId]
      if (!prev || record.totalScore > prev.score) {
        map[record.recipeId] = { score: record.totalScore, stars: record.stars }
      }
    })
    return map
  }, [scoreHistory])

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!unlockedRecipes.includes(recipe.id)) {
      showBubble('这道菜还没解锁哦，先做其他的吧！', 'warning')
      sound.playFail()
      return
    }
    sound.playClick()
    if (selectedRecipe?.id === recipe.id) {
      setDetailRecipe(recipe)
    } else {
      selectRecipe(recipe)
    }
  }

  const handleStart = () => {
    if (!selectedRecipe) {
      showBubble('先选一道菜吧~', 'info')
      sound.playWarn()
      return
    }
    sound.playDing()
    sound.playSuccess()
    showBubble(`好的！我们来做${selectedRecipe.name}！`, 'success')
    dispatch({ type: 'SET_SCENE', scene: 'prep' })
    
    if (mode === 'single') {
      selectedRecipe.steps.forEach(step => {
        step.tasks.forEach(task => {
          dispatch({ type: 'ASSIGN_TASK', taskId: task.id, player: 'p1' })
        })
      })
    }
    
    setTimeout(() => navigate('/prep'), 500)
  }

  const toggleMode = () => {
    const next = mode === 'coop' ? 'single' : 'coop'
    dispatch({ type: 'SET_MODE', mode: next })
    sound.playClick()
    showBubble(next === 'coop' ? '切换到双人模式！叫上小伙伴吧~' : '切换到单人练习模式', 'info')
  }

  const totalDishes = scoreHistory.length
  const totalStars = scoreHistory.reduce((s, r) => s + r.stars, 0)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="font-happy text-4xl md:text-5xl text-warm-500 mb-1">
              🍳 快乐厨房
            </h1>
            <p className="text-gray-500 font-body">
              和爸爸妈妈一起做菜，练习分工、顺序和时间感~
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/80 rounded-2xl px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500">累计成就</p>
              <p className="font-happy text-warm-500 text-lg">
                🍽️ {totalDishes} · ⭐ {totalStars}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gallery')}
              leftIcon="📚"
            >
              图鉴
            </Button>
          </div>
        </motion.div>

        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">游戏模式</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleMode}
                    className={`
                      relative w-44 h-14 rounded-full transition-all duration-500 shadow-inner
                      ${mode === 'coop' ? 'bg-gradient-to-r from-sky-300 to-pink-300' 
                                        : 'bg-gradient-to-r from-warm-300 to-warm-400'}
                    `}
                  >
                    <motion.div
                      animate={{ 
                        x: mode === 'coop' ? 4 : 84,
                        width: mode === 'coop' ? 100 : 80,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute top-1 h-12 bg-white rounded-full shadow-md
                                 flex items-center justify-center font-happy text-warm-500"
                    >
                      {mode === 'coop' ? '👥 双人' : '🎯 单人'}
                    </motion.div>
                    <span className={`absolute top-1/2 -translate-y-1/2 left-6 font-happy text-white text-sm transition-opacity ${mode === 'single' ? 'opacity-100' : 'opacity-0'}`}>
                      单人
                    </span>
                    <span className={`absolute top-1/2 -translate-y-1/2 right-6 font-happy text-white text-sm transition-opacity ${mode === 'coop' ? 'opacity-100' : 'opacity-0'}`}>
                      双人
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <p className="text-sm text-gray-500 mb-2">操作说明</p>
              {mode === 'coop' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="player-zone-p1 rounded-2xl p-3">
                    <p className="font-happy badge-p1 inline-block px-2 py-0.5 rounded-lg text-sm mb-1">
                      {getPlayerLabel('p1').short} · 家长
                    </p>
                    <p className="text-xs text-gray-600">
                      键盘 A/D · 屏幕左侧点击<br/>
                      负责复杂任务
                    </p>
                  </div>
                  <div className="player-zone-p2 rounded-2xl p-3">
                    <p className="font-happy badge-p2 inline-block px-2 py-0.5 rounded-lg text-sm mb-1">
                      {getPlayerLabel('p2').short} · 孩子
                    </p>
                    <p className="text-xs text-gray-600">
                      键盘 ←/→ · 屏幕右侧点击<br/>
                      负责简单有趣的任务
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-cream-50 border-2 border-warm-300 rounded-2xl p-3">
                  <p className="text-sm text-gray-700">
                    🎯 一个人完成全部流程！<br/>
                    <span className="text-xs text-gray-500">
                      可以练习做菜顺序，熟悉之后挑战双人模式~
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={handleStart}
              disabled={!selectedRecipe}
              leftIcon="🔥"
              rightIcon="→"
            >
              {selectedRecipe ? '开始做菜！' : '先选菜谱'}
            </Button>
          </div>
        </Card>
      </header>

      <main className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-happy text-2xl text-gray-700 mb-5 flex items-center gap-2"
        >
          <span className="inline-block w-2 h-8 bg-warm-400 rounded-full"></span>
          选一道菜来做吧
          <span className="ml-2 text-sm font-body text-gray-400">
            （共 {unlockedRecipes.length}/{RECIPES.length} 道菜已解锁）
          </span>
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
          {RECIPES.map((recipe, idx) => {
            const best = bestByRecipe[recipe.id]
            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <RecipeCard
                  recipe={recipe}
                  isUnlocked={unlockedRecipes.includes(recipe.id)}
                  isSelected={selectedRecipe?.id === recipe.id}
                  bestScore={best?.score}
                  bestStars={best?.stars}
                  onClick={() => handleSelectRecipe(recipe)}
                />
              </motion.div>
            )
          })}
        </div>

        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="kitchen-panel text-center py-6 max-w-2xl mx-auto"
          >
            <p className="text-gray-500 mb-2">已选择</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl">{selectedRecipe.emoji}</span>
              <div className="text-left">
                <h3 className="font-happy text-3xl" style={{ color: selectedRecipe.colorTheme }}>
                  {selectedRecipe.name}
                </h3>
                <p className="text-gray-600">{selectedRecipe.description}</p>
              </div>
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                variant="info"
                size="md"
                onClick={() => setDetailRecipe(selectedRecipe)}
                leftIcon="ℹ️"
              >
                查看详情
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={handleStart}
                leftIcon="🚀"
              >
                现在开始
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <RecipeDetailModal
        recipe={detailRecipe}
        onClose={() => setDetailRecipe(null)}
        learnedIngredients={learnedIngredients}
        onLearnIngredient={(id) => {
          dispatch({ type: 'LEARN_INGREDIENT', ingredientId: id })
          const ing = INGREDIENTS.find(i => i.id === id)
          if (ing) {
            showBubble(`学了新知识！${ing.name}：${ing.funFact.slice(0, 15)}...`, 'success')
            sound.playSuccess()
          }
        }}
      />
    </div>
  )
}

export default MenuScene
