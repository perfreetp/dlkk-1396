import type { Recipe, Incident } from '../types/game'

export const RECIPES: Recipe[] = [
  {
    id: 'tomato_egg',
    name: '番茄炒鸡蛋',
    emoji: '🍳',
    difficulty: 1,
    estimatedMinutes: 3,
    description: '中国家庭最经典的家常菜，酸甜可口又简单！',
    story: '这是很多小朋友学会的第一道菜，酸酸甜甜的味道是童年的记忆~',
    colorTheme: '#FF6B6B',
    ingredientIds: ['tomato', 'egg', 'onion'],
    unlockedByDefault: true,
    steps: [
      {
        id: 'te_s1',
        stepNumber: 1,
        phase: 'prep',
        title: '切番茄和洋葱',
        description: '把番茄切成小块，洋葱切成丁',
        targetDuration: 45,
        tasks: [
          { id: 'te_s1_t1', type: 'wash', name: '洗番茄', difficulty: 'easy', suggestedPlayer: 'p2', duration: 10 },
          { id: 'te_s1_t2', type: 'chop', name: '切番茄', difficulty: 'medium', suggestedPlayer: 'p1', duration: 25 },
          { id: 'te_s1_t3', type: 'chop', name: '切洋葱', difficulty: 'easy', suggestedPlayer: 'p2', duration: 20 },
        ]
      },
      {
        id: 'te_s2',
        stepNumber: 2,
        phase: 'prep',
        title: '打鸡蛋调味',
        description: '把鸡蛋打散，加一点点盐和葱花',
        targetDuration: 30,
        tasks: [
          { id: 'te_s2_t1', type: 'chop', name: '打鸡蛋', difficulty: 'easy', suggestedPlayer: 'p2', duration: 15 },
          { id: 'te_s2_t2', type: 'season', name: '加盐调味', difficulty: 'medium', suggestedPlayer: 'p1', duration: 10 },
        ]
      },
      {
        id: 'te_s3',
        stepNumber: 3,
        phase: 'cook',
        title: '炒蛋盛出',
        description: '油热后倒入蛋液，炒成大块盛出来',
        targetDuration: 40,
        tasks: [
          { id: 'te_s3_t1', type: 'stir', name: '翻炒鸡蛋', difficulty: 'medium', suggestedPlayer: 'any', duration: 30 },
        ]
      },
      {
        id: 'te_s4',
        stepNumber: 4,
        phase: 'cook',
        title: '炒番茄加蛋',
        description: '炒出番茄汁后倒回鸡蛋，加糖翻炒',
        targetDuration: 50,
        tasks: [
          { id: 'te_s4_t1', type: 'stir', name: '炒番茄出汁', difficulty: 'medium', suggestedPlayer: 'p1', duration: 25 },
          { id: 'te_s4_t2', type: 'season', name: '加糖调味', difficulty: 'easy', suggestedPlayer: 'p2', duration: 10 },
          { id: 'te_s4_t3', type: 'stir', name: '混合翻炒', difficulty: 'medium', suggestedPlayer: 'any', duration: 20 },
        ]
      },
    ]
  },
  {
    id: 'fried_rice',
    name: '蛋炒饭',
    emoji: '🍚',
    difficulty: 1,
    estimatedMinutes: 4,
    description: '粒粒分明的黄金炒饭，简单又好吃！',
    story: '传说蛋炒饭是皇帝都爱吃的美味，秘诀就是要用隔夜饭哦~',
    colorTheme: '#FFD93D',
    ingredientIds: ['rice', 'egg', 'onion', 'carrot'],
    unlockedByDefault: true,
    steps: [
      {
        id: 'fr_s1',
        stepNumber: 1,
        phase: 'prep',
        title: '准备配料',
        description: '胡萝卜和洋葱切成小丁',
        targetDuration: 40,
        tasks: [
          { id: 'fr_s1_t1', type: 'chop', name: '切胡萝卜丁', difficulty: 'medium', suggestedPlayer: 'p1', duration: 20 },
          { id: 'fr_s1_t2', type: 'chop', name: '切洋葱丁', difficulty: 'easy', suggestedPlayer: 'p2', duration: 15 },
        ]
      },
      {
        id: 'fr_s2',
        stepNumber: 2,
        phase: 'prep',
        title: '蛋液拌饭',
        description: '把蛋液和米饭搅拌均匀，让每粒米都金黄',
        targetDuration: 35,
        tasks: [
          { id: 'fr_s2_t1', type: 'chop', name: '打散鸡蛋', difficulty: 'easy', suggestedPlayer: 'p2', duration: 10 },
          { id: 'fr_s2_t2', type: 'season', name: '蛋液拌米', difficulty: 'medium', suggestedPlayer: 'p1', duration: 20 },
        ]
      },
      {
        id: 'fr_s3',
        stepNumber: 3,
        phase: 'cook',
        title: '大火炒饭',
        description: '锅中下油，倒入米饭大火快速翻炒',
        targetDuration: 60,
        tasks: [
          { id: 'fr_s3_t1', type: 'stir', name: '翻炒米饭', difficulty: 'hard', suggestedPlayer: 'p1', duration: 45 },
          { id: 'fr_s3_t2', type: 'season', name: '加盐和生抽', difficulty: 'medium', suggestedPlayer: 'p2', duration: 10 },
        ]
      },
    ]
  },
  {
    id: 'potato_beef',
    name: '土豆炖牛肉',
    emoji: '🥘',
    difficulty: 3,
    estimatedMinutes: 6,
    description: '软糯的土豆配上入味的牛肉，超下饭的硬菜！',
    story: '这是一道需要耐心的炖菜，小火慢炖才能让味道渗透~',
    colorTheme: '#A0522D',
    ingredientIds: ['potato', 'meat', 'onion', 'garlic', 'carrot'],
    unlockedByDefault: false,
    unlockCondition: '完成任意菜谱后解锁',
    steps: [
      {
        id: 'pb_s1',
        stepNumber: 1,
        phase: 'prep',
        title: '处理蔬菜',
        description: '土豆胡萝卜切块，洋葱大蒜切末',
        targetDuration: 55,
        tasks: [
          { id: 'pb_s1_t1', type: 'wash', name: '清洗蔬菜', difficulty: 'easy', suggestedPlayer: 'p2', duration: 15 },
          { id: 'pb_s1_t2', type: 'chop', name: '切土豆块', difficulty: 'medium', suggestedPlayer: 'p1', duration: 20 },
          { id: 'pb_s1_t3', type: 'chop', name: '切胡萝卜块', difficulty: 'medium', suggestedPlayer: 'p2', duration: 15 },
        ]
      },
      {
        id: 'pb_s2',
        stepNumber: 2,
        phase: 'prep',
        title: '处理牛肉',
        description: '牛肉切块，加料酒和淀粉腌制',
        targetDuration: 40,
        tasks: [
          { id: 'pb_s2_t1', type: 'chop', name: '切牛肉块', difficulty: 'hard', suggestedPlayer: 'p1', duration: 20 },
          { id: 'pb_s2_t2', type: 'season', name: '腌制牛肉', difficulty: 'medium', suggestedPlayer: 'p2', duration: 15 },
        ]
      },
      {
        id: 'pb_s3',
        stepNumber: 3,
        phase: 'cook',
        title: '炒香底料',
        description: '爆香蒜粒和洋葱，下牛肉翻炒上色',
        targetDuration: 50,
        tasks: [
          { id: 'pb_s3_t1', type: 'stir', name: '爆香底料', difficulty: 'medium', suggestedPlayer: 'p1', duration: 15 },
          { id: 'pb_s3_t2', type: 'stir', name: '翻炒牛肉', difficulty: 'medium', suggestedPlayer: 'any', duration: 30 },
        ]
      },
      {
        id: 'pb_s4',
        stepNumber: 4,
        phase: 'cook',
        title: '加水炖煮',
        description: '加热水和调料，小火慢炖到土豆软糯',
        targetDuration: 70,
        tasks: [
          { id: 'pb_s4_t1', type: 'season', name: '加酱油调味', difficulty: 'medium', suggestedPlayer: 'p2', duration: 10 },
          { id: 'pb_s4_t2', type: 'stir', name: '搅拌均匀', difficulty: 'easy', suggestedPlayer: 'p1', duration: 50 },
        ]
      },
    ]
  },
  {
    id: 'veggie_salad',
    name: '缤纷蔬菜沙拉',
    emoji: '🥗',
    difficulty: 1,
    estimatedMinutes: 3,
    description: '五彩斑斓的健康沙拉，清爽又好看！',
    story: '不用开火的凉菜，最适合夏天吃啦~可以自由发挥创意摆盘哦！',
    colorTheme: '#52BE8E',
    ingredientIds: ['cucumber', 'carrot', 'corn', 'tomato'],
    unlockedByDefault: true,
    steps: [
      {
        id: 'vs_s1',
        stepNumber: 1,
        phase: 'prep',
        title: '清洗蔬菜',
        description: '把所有蔬菜认真洗干净',
        targetDuration: 30,
        tasks: [
          { id: 'vs_s1_t1', type: 'wash', name: '洗黄瓜番茄', difficulty: 'easy', suggestedPlayer: 'p2', duration: 15 },
          { id: 'vs_s1_t2', type: 'wash', name: '剥玉米粒', difficulty: 'easy', suggestedPlayer: 'p1', duration: 12 },
        ]
      },
      {
        id: 'vs_s2',
        stepNumber: 2,
        phase: 'prep',
        title: '切菜摆盘',
        description: '把蔬菜切成好看的形状，摆成彩虹',
        targetDuration: 50,
        tasks: [
          { id: 'vs_s2_t1', type: 'chop', name: '切黄瓜片', difficulty: 'easy', suggestedPlayer: 'p1', duration: 18 },
          { id: 'vs_s2_t2', type: 'chop', name: '切番茄块', difficulty: 'medium', suggestedPlayer: 'p2', duration: 18 },
          { id: 'vs_s2_t3', type: 'chop', name: '切胡萝卜丝', difficulty: 'medium', suggestedPlayer: 'p1', duration: 15 },
        ]
      },
      {
        id: 'vs_s3',
        stepNumber: 3,
        phase: 'prep',
        title: '淋上酱汁',
        description: '淋上沙拉酱，轻轻拌匀',
        targetDuration: 25,
        tasks: [
          { id: 'vs_s3_t1', type: 'season', name: '加沙拉酱', difficulty: 'easy', suggestedPlayer: 'p2', duration: 10 },
          { id: 'vs_s3_t2', type: 'stir', name: '轻轻拌匀', difficulty: 'easy', suggestedPlayer: 'any', duration: 12 },
        ]
      },
    ]
  },
  {
    id: 'mushroom_soup',
    name: '奶油蘑菇汤',
    emoji: '🍲',
    difficulty: 2,
    estimatedMinutes: 5,
    description: '香浓丝滑的西式浓汤，配面包超赞！',
    story: '传说这是法国奶奶的拿手菜，温暖的奶香能驱散寒冷~',
    colorTheme: '#C9B1FF',
    ingredientIds: ['mushroom', 'onion', 'milk', 'bread'],
    unlockedByDefault: false,
    unlockCondition: '完成番茄炒鸡蛋后解锁',
    steps: [
      {
        id: 'ms_s1',
        stepNumber: 1,
        phase: 'prep',
        title: '切蘑菇和洋葱',
        description: '蘑菇切片，洋葱切成小丁',
        targetDuration: 40,
        tasks: [
          { id: 'ms_s1_t1', type: 'wash', name: '清洗蘑菇', difficulty: 'easy', suggestedPlayer: 'p2', duration: 12 },
          { id: 'ms_s1_t2', type: 'chop', name: '切蘑菇片', difficulty: 'medium', suggestedPlayer: 'p1', duration: 18 },
          { id: 'ms_s1_t3', type: 'chop', name: '切洋葱丁', difficulty: 'easy', suggestedPlayer: 'p2', duration: 15 },
        ]
      },
      {
        id: 'ms_s2',
        stepNumber: 2,
        phase: 'cook',
        title: '炒香食材',
        description: '黄油炒洋葱，再加蘑菇炒软',
        targetDuration: 45,
        tasks: [
          { id: 'ms_s2_t1', type: 'stir', name: '炒香洋葱', difficulty: 'medium', suggestedPlayer: 'p1', duration: 18 },
          { id: 'ms_s2_t2', type: 'stir', name: '炒蘑菇出水', difficulty: 'medium', suggestedPlayer: 'any', duration: 22 },
        ]
      },
      {
        id: 'ms_s3',
        stepNumber: 3,
        phase: 'cook',
        title: '加奶煮浓',
        description: '倒入牛奶，小火煮到浓稠',
        targetDuration: 55,
        tasks: [
          { id: 'ms_s3_t1', type: 'season', name: '加牛奶', difficulty: 'easy', suggestedPlayer: 'p2', duration: 8 },
          { id: 'ms_s3_t2', type: 'season', name: '加盐和胡椒', difficulty: 'medium', suggestedPlayer: 'p1', duration: 10 },
          { id: 'ms_s3_t3', type: 'stir', name: '搅拌防糊底', difficulty: 'hard', suggestedPlayer: 'any', duration: 35 },
        ]
      },
    ]
  },
  {
    id: 'steamed_fish',
    name: '清蒸鲈鱼',
    emoji: '🐟',
    difficulty: 3,
    estimatedMinutes: 5,
    description: '鲜嫩滑爽的清蒸鱼，原汁原味最健康！',
    story: '蒸鱼讲究火候和时间，差一秒都不够完美，是考验耐心的名菜~',
    colorTheme: '#74B9FF',
    ingredientIds: ['fish', 'onion', 'garlic'],
    unlockedByDefault: false,
    unlockCondition: '累计获得10颗星后解锁',
    steps: [
      {
        id: 'sf_s1',
        stepNumber: 1,
        phase: 'prep',
        title: '处理鱼身',
        description: '鱼身划几刀，抹上料酒和盐',
        targetDuration: 40,
        tasks: [
          { id: 'sf_s1_t1', type: 'wash', name: '清洗鱼身', difficulty: 'medium', suggestedPlayer: 'p1', duration: 15 },
          { id: 'sf_s1_t2', type: 'chop', name: '鱼身划刀', difficulty: 'hard', suggestedPlayer: 'p1', duration: 12 },
          { id: 'sf_s1_t3', type: 'season', name: '抹盐和料酒', difficulty: 'medium', suggestedPlayer: 'p2', duration: 10 },
        ]
      },
      {
        id: 'sf_s2',
        stepNumber: 2,
        phase: 'prep',
        title: '准备葱姜丝',
        description: '切葱姜丝铺在鱼身上',
        targetDuration: 35,
        tasks: [
          { id: 'sf_s2_t1', type: 'chop', name: '切葱丝', difficulty: 'medium', suggestedPlayer: 'p2', duration: 15 },
          { id: 'sf_s2_t2', type: 'chop', name: '切姜丝', difficulty: 'hard', suggestedPlayer: 'p1', duration: 15 },
        ]
      },
      {
        id: 'sf_s3',
        stepNumber: 3,
        phase: 'cook',
        title: '上锅清蒸',
        description: '水开后上锅，严格控制蒸8分钟',
        targetDuration: 60,
        tasks: [
          { id: 'sf_s3_t1', type: 'stir', name: '观察火候', difficulty: 'hard', suggestedPlayer: 'any', duration: 50 },
        ]
      },
      {
        id: 'sf_s4',
        stepNumber: 4,
        phase: 'cook',
        title: '淋油出锅',
        description: '淋上蒸鱼豉油，浇上热油',
        targetDuration: 25,
        tasks: [
          { id: 'sf_s4_t1', type: 'season', name: '淋蒸鱼豉油', difficulty: 'easy', suggestedPlayer: 'p2', duration: 8 },
          { id: 'sf_s4_t2', type: 'season', name: '浇上热油', difficulty: 'medium', suggestedPlayer: 'p1', duration: 10 },
        ]
      },
    ]
  },
]

export const getRecipeById = (id: string): Recipe | undefined => {
  return RECIPES.find(r => r.id === id)
}

export const INCIDENTS_TEMPLATES: Omit<Incident, 'id'>[] = [
  {
    type: 'overflow',
    title: '汤溢出来啦！',
    emoji: '💧',
    description: '锅里的汤沸腾得太厉害了，流到灶台上了！',
    hint: '调小火力，然后用抹布擦掉~',
    requiresCooperation: true,
    actionRequired: 'both',
    timeLimit: 8,
    penaltySeconds: 5,
    rewardScore: 30
  },
  {
    type: 'overheat',
    title: '火太大啦！',
    emoji: '🔥',
    description: '锅里开始冒烟了，再不管就要糊了！',
    hint: '赶紧调小火力！',
    requiresCooperation: false,
    actionRequired: 'any',
    timeLimit: 5,
    penaltySeconds: 8,
    rewardScore: 25
  },
  {
    type: 'spill',
    title: '调料瓶打翻了！',
    emoji: '🧂',
    description: '哎呀，盐瓶子倒了，需要捡起来盖好~',
    hint: '小朋友负责扶起来，家长处理台面',
    requiresCooperation: true,
    actionRequired: 'both',
    timeLimit: 6,
    penaltySeconds: 3,
    rewardScore: 20
  },
  {
    type: 'miss_ingredient',
    title: '忘加配料了！',
    emoji: '⚠️',
    description: '菜谱里这一步需要加葱姜哦，差点忘了！',
    hint: '快点加上缺的调料~',
    requiresCooperation: false,
    actionRequired: 'p2',
    timeLimit: 7,
    penaltySeconds: 4,
    rewardScore: 20
  },
  {
    type: 'timer_alert',
    title: '该翻面啦！',
    emoji: '🔔',
    description: '听到叮的一声，提醒你食物该翻面啦~',
    hint: '双方一起喊：翻面！然后点击按钮',
    requiresCooperation: true,
    actionRequired: 'both',
    timeLimit: 5,
    penaltySeconds: 6,
    rewardScore: 35
  }
]
