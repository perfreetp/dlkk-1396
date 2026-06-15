// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { StarRating } from '@/components/common/StarRating'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useSpeechBubble } from '@/components/common/SpeechBubble'
import { useSoundFX } from '@/hooks/useSoundFX'
import { useSpeech } from '@/hooks/useSpeech'
import { calculateFinalScore, formatTime, getPlayerLabel } from '@/utils/scoring'
import { ACHIEVEMENTS, checkAchievement } from '@/data/achievements'
import { RECIPES } from '@/data/recipes'
import { genId } from '@/utils/scoring'
import type { ScoreRecord, FinalScore } from '@/types/game'

// ==== 撒花特效 ====
const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
  const pieces = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: ['#FF6B6B', '#FFD93D', '#7FD1AE', '#C9B1FF', '#FFB366', '#74B9FF'][i % 6],
    size: 8 + Math.random() * 10,
    rotate: Math.random() * 360,
  })), [])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: `${p.x}%`, rotate: 0, opacity: 1 }}
          animate={{ 
            y: '110vh',
            x: [`${p.x}%`, `${p.x - 10 + Math.random() * 20}%`],
            rotate: p.rotate * 3,
            opacity: [1, 1, 0],
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            top: -20,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 2,
            zIndex: 40,
          }}
        />
      ))}
    </div>
  )
}

// ==== 评分条 ====
const ScoreBar: React.FC<{
  label: string
  icon: string
  score: number
  color: string
  delay?: number
}> = ({ label, icon, score, color, delay = 0 }) => {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplay(d => {
          if (d >= score) { clearInterval(interval); return score }
          return Math.min(d + Math.ceil(score / 30), score)
        })
      }, 30)
    }, delay)
    return () => clearTimeout(t)
  }, [score, delay])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000 + 0.2 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="font-happy text-gray-700 flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {label}
        </span>
        <span className="font-happy text-xl" style={{ color }}>{display}</span>
      </div>
      <ProgressBar value={display} color={color} />
    </motion.div>
  )
}

// ==== 新解锁弹窗 ====
const UnlockModal: React.FC<{
  recipe?: string
  achievements: string[]
  onClose: () => void
}> = ({ recipe, achievements, onClose }) => {
  const recipeData = recipe ? RECIPES.find(r => r.id === recipe) : null
  const achData = achievements.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean)
  const hasAny = !!recipeData || achData.length > 0

  if (!hasAny) return null

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
          className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border-4 border-yolk-400 text-center"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            className="text-7xl mb-3"
          >
            🎁
          </motion.div>
          <h3 className="font-happy text-3xl text-warm-500 mb-4">新解锁！</h3>
          
          {recipeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-warm-50 rounded-2xl border-2 border-warm-200"
            >
              <p className="text-xs text-gray-500 mb-1">新菜谱</p>
              <div className="text-5xl mb-1">{recipeData.emoji}</div>
              <p className="font-happy text-2xl" style={{ color: recipeData.colorTheme }}>
                {recipeData.name}
              </p>
              <p className="text-sm text-gray-500">{recipeData.description}</p>
            </motion.div>
          )}
          
          {achData.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-500">获得成就</p>
              {achData.map((a, i) => a && (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className="bg-lavender-300/40 rounded-xl px-4 py-3 flex items-center gap-3 border-2 border-lavender-400/50"
                >
                  <span className="text-3xl">{a.icon}</span>
                  <div className="text-left">
                    <p className="font-happy text-lavender-400">{a.name}</p>
                    <p className="text-xs text-gray-600">{a.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <Button variant="primary" size="lg" onClick={onClose} leftIcon="🎉">
            太棒了！
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ==== 主场景 ====
const ResultScene: React.FC = () => {
  const navigate = useNavigate()
  const { state, dispatch, checkUnlockRecipes } = useGame()
  const { selectedRecipe, mode, chopRhythmScores, seasonTimingScores,
          heatHistory, stirQuality, incidentsResolved, timer, scoreHistory,
          unlockedAchievements, finalScore, mode: gameMode } = state
  const showBubble = useSpeechBubble()
  const sound = useSoundFX()
  const speech = useSpeech()

  const [score, setScore] = useState<FinalScore | null>(finalScore)
  const [showConfetti, setShowConfetti] = useState(false)
  const [newUnlocks, setNewUnlocks] = useState<{ recipes: string[]; achievements: string[] }>({ recipes: [], achievements: [] })
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showAchievements, setShowAchievements] = useState<string[]>([])
  const [newRecipe, setNewRecipe] = useState<string | undefined>()

  useEffect(() => {
    if (!selectedRecipe || score) return

    const calculated = calculateFinalScore(state)
    setScore(calculated)
    dispatch({ type: 'SET_FINAL_SCORE', score: calculated })

    // 保存成绩记录
    const record: ScoreRecord = {
      id: genId(),
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      recipeEmoji: selectedRecipe.emoji,
      totalScore: calculated.total,
      cooperationScore: calculated.cooperation,
      accuracyScore: calculated.accuracy,
      stars: calculated.stars,
      durationSeconds: timer.totalSeconds - timer.remainingSeconds,
      date: new Date().toISOString(),
      mode: gameMode,
    }
    dispatch({ type: 'ADD_SCORE_RECORD', record })

    // 延迟展示评分
    const t1 = setTimeout(() => {
      if (calculated.stars >= 3) {
        setShowConfetti(true)
        sound.playSuccess()
      } else {
        sound.playDing()
      }
    }, 800)

    // 检查菜谱解锁
    const t2 = setTimeout(() => {
      const newlyUnlocked = checkUnlockRecipes()
      if (newlyUnlocked.length > 0) {
        setNewUnlocks(prev => ({ ...prev, recipes: newlyUnlocked }))
        setNewRecipe(newlyUnlocked[0])
      }

      // 检查成就
      const stats = {
        recipesCooked: new Set([...scoreHistory.map(s => s.recipeId), selectedRecipe.id]).size,
        maxStars: Math.max(...scoreHistory.map(s => s.stars), calculated.stars),
        coopGames: scoreHistory.filter(s => s.mode === 'coop').length + (gameMode === 'coop' ? 1 : 0),
        incidentsSolved: scoreHistory.reduce((s, _) => s, 0) + incidentsResolved,
        ingredientsLearned: state.learnedIngredients.length,
      }
      const newlyAchieved: string[] = []
      ACHIEVEMENTS.forEach(a => {
        if (!unlockedAchievements.includes(a.id) && checkAchievement(a, stats)) {
          newlyAchieved.push(a.id)
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId: a.id })
        }
      })
      if (newlyAchieved.length > 0) {
        setNewUnlocks(prev => ({ ...prev, achievements: newlyAchieved }))
        setShowAchievements(newlyAchieved)
      }

      if (newlyUnlocked.length > 0 || newlyAchieved.length > 0) {
        setTimeout(() => {
          setShowUnlockModal(true)
          sound.playDing()
        }, 2200)
      }

      if (calculated.stars >= 4) speech.quickPhrase('perfect')
      else if (calculated.stars >= 2) speech.quickPhrase('good_job')
      else speech.speak('完成啦，下次继续加油！')
    }, 1600)

    if (calculated.isNewRecord) {
      setTimeout(() => showBubble('🏆 创造了新纪录！', 'success'), 1200)
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecipe])

  if (!selectedRecipe || !score) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-8xl"
        >
          🍳
        </motion.div>
      </div>
    )
  }

  const avg = (arr: number[]) => arr.length > 0 
    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  const chopAvg = avg(chopRhythmScores)
  const seasonAvg = avg(seasonTimingScores)
  const heatOk = heatHistory.length > 0
    ? Math.round((heatHistory.filter(h => h >= 35 && h <= 70).length / heatHistory.length) * 100) : 50
  const stirAvg = avg(stirQuality)
  const timeUsed = timer.totalSeconds - timer.remainingSeconds
  const coopGames = scoreHistory.filter(s => s.mode === 'coop').length

  const starMessage = [
    '别灰心，熟能生巧！下次一定更好~',
    '很不错的尝试！还有进步空间哦~',
    '做得不错！继续保持~',
    '非常棒！快成为小厨师啦！',
    '完美！你就是五星级大厨！',
  ][Math.min(score.stars, 5) - 1]

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <Confetti show={showConfetti} />

      <header className="max-w-4xl mx-auto mb-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-8xl mb-3"
        >
          {selectedRecipe.emoji}
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-happy text-3xl md:text-5xl mb-1"
          style={{ color: selectedRecipe.colorTheme }}
        >
          {selectedRecipe.name} 完成！
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500"
        >
          {starMessage}
        </motion.p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* 星级展示 */}
        <Card className="text-center py-8" color={selectedRecipe.colorTheme}>
          <StarRating stars={score.stars} size="xl" />
          
          {score.isNewRecord && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="mt-4 inline-block"
            >
              <span className="bg-gradient-to-r from-yolk-400 to-warm-400 text-white 
                               px-6 py-2 rounded-full font-happy text-xl shadow-lg">
                🏆 新纪录！
              </span>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <p className="text-gray-500 text-sm mb-1">综合得分</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="font-happy text-7xl text-warm-500"
            >
              {score.total}
              <span className="text-3xl text-gray-300">/100</span>
            </motion.p>
          </motion.div>
        </Card>

        {/* 分项得分 */}
        <Card>
          <h3 className="font-happy text-2xl text-gray-700 mb-5 text-center">
            📊 分数明细
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <ScoreBar 
              label="准确度" 
              icon="🎯" 
              score={score.accuracy} 
              color="#FFB366" 
              delay={0}
            />
            
            {mode === 'coop' ? (
              <ScoreBar 
                label="配合度" 
                icon="🤝" 
                score={score.cooperation} 
                color="#C9B1FF" 
                delay={150}
              />
            ) : (
              <ScoreBar 
                label="时间效率" 
                icon="⏱️" 
                score={score.breakdown.timeBonus} 
                color="#7FD1AE" 
                delay={150}
              />
            )}
            
            <ScoreBar 
              label="切菜平均" 
              icon="🔪" 
              score={chopAvg} 
              color="#74B9FF" 
              delay={300}
            />
            <ScoreBar 
              label="调味平均" 
              icon="🧂" 
              score={seasonAvg} 
              color="#FDA7DF" 
              delay={450}
            />
            <ScoreBar 
              label="火候控制" 
              icon="🔥" 
              score={heatOk} 
              color="#FF6B6B" 
              delay={600}
            />
            <ScoreBar 
              label="翻炒质量" 
              icon="🥄" 
              score={stirAvg} 
              color="#FFD93D" 
              delay={750}
            />
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <StatCard icon="⏰" label="用时" value={formatTime(timeUsed)} />
            <StatCard icon="✅" label="解决小状况" value={`${incidentsResolved}次`} />
            <StatCard 
              icon={mode === 'coop' ? '👥' : '🎮'} 
              label="模式" 
              value={mode === 'coop' ? '双人' : '单人'} 
            />
            <StatCard icon="🏅" label="累计做菜" value={`${scoreHistory.length + 1}道`} />
          </div>
        </Card>

        {/* 解锁预览 */}
        {(newUnlocks.recipes.length > 0 || newUnlocks.achievements.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <Card color="#C9B1FF">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="font-happy text-xl text-lavender-400 mb-1">🎁 有新内容解锁</h4>
                  <p className="text-sm text-gray-600">
                    {newUnlocks.recipes.length > 0 && `新菜谱 ×${newUnlocks.recipes.length}  `}
                    {newUnlocks.achievements.length > 0 && `新成就 ×${newUnlocks.achievements.length}`}
                  </p>
                </div>
                <Button variant="info" onClick={() => setShowUnlockModal(true)} leftIcon="👀">
                  查看
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Button
            variant="primary"
            size="lg"
            leftIcon="🔄"
            onClick={() => {
              dispatch({ type: 'SET_SCENE', scene: 'prep' })
              navigate('/prep')
            }}
          >
            再做一次
          </Button>
          <Button
            variant="info"
            size="lg"
            leftIcon="📖"
            onClick={() => {
              dispatch({ type: 'SET_SCENE', scene: 'gallery' })
              navigate('/gallery')
            }}
          >
            查看图鉴
          </Button>
          <Button
            variant="success"
            size="lg"
            leftIcon="🏠"
            onClick={() => {
              dispatch({ type: 'RESET_SESSION' })
              navigate('/')
            }}
          >
            返回首页
          </Button>
        </motion.div>
      </main>

      <UnlockModal
        recipe={newRecipe}
        achievements={showAchievements}
        onClose={() => setShowUnlockModal(false)}
      />
    </div>
  )
}

const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1.2 }}
    className="bg-cream-50 rounded-2xl p-4 text-center border-2 border-cream-200"
  >
    <div className="text-3xl mb-1">{icon}</div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-happy text-lg text-warm-500">{value}</p>
  </motion.div>
)

export default ResultScene
