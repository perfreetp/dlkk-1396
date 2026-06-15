import type { Ingredient } from '../types/game'

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'tomato',
    name: '番茄',
    emoji: '🍅',
    funFact: '番茄其实是水果！但在厨房里它经常被当成蔬菜使用。',
    nutrition: '富含维生素C和番茄红素，对皮肤很好哦~'
  },
  {
    id: 'egg',
    name: '鸡蛋',
    emoji: '🥚',
    funFact: '母鸡每天大约下一个蛋，一只鸡一生能下1500多个蛋！',
    nutrition: '优质蛋白质来源，还有大脑发育需要的卵磷脂'
  },
  {
    id: 'rice',
    name: '大米',
    emoji: '🍚',
    funFact: '大米是全世界一半以上人口的主食！',
    nutrition: '提供能量的碳水化合物，搭配蔬菜更健康'
  },
  {
    id: 'carrot',
    name: '胡萝卜',
    emoji: '🥕',
    funFact: '胡萝卜最早是紫色的，后来才培育出橙色品种。',
    nutrition: 'β-胡萝卜素会变成维生素A，对眼睛特别好'
  },
  {
    id: 'potato',
    name: '土豆',
    emoji: '🥔',
    funFact: '土豆是全球第四大粮食作物，有几千种不同品种！',
    nutrition: '富含钾和维生素C，比香蕉的钾还多'
  },
  {
    id: 'onion',
    name: '洋葱',
    emoji: '🧅',
    funFact: '切洋葱流泪是因为释放了含硫气体，在水里切就不会啦！',
    nutrition: '有抗菌消炎的作用，还能让菜更有香味'
  },
  {
    id: 'garlic',
    name: '大蒜',
    emoji: '🧄',
    funFact: '古埃及人建金字塔时就吃大蒜来增强体力！',
    nutrition: '大蒜素能增强免疫力，被称为"地里长出来的青霉素"'
  },
  {
    id: 'meat',
    name: '猪肉',
    emoji: '🥩',
    funFact: '猪是很聪明的动物，智商比狗狗还高呢！',
    nutrition: '优质蛋白质和铁质，能让我们长得壮壮的'
  },
  {
    id: 'fish',
    name: '鱼肉',
    emoji: '🐟',
    funFact: '鱼肉里的DHA被称为"脑黄金"，多吃鱼会变聪明！',
    nutrition: '富含Omega-3脂肪酸，对大脑和心脏都好'
  },
  {
    id: 'cucumber',
    name: '黄瓜',
    emoji: '🥒',
    funFact: '黄瓜含水量高达96%，是天然的补水神器！',
    nutrition: '低热量高纤维，减肥的时候超适合吃'
  },
  {
    id: 'mushroom',
    name: '香菇',
    emoji: '🍄',
    funFact: '香菇是一种真菌，有"植物皇后"的美誉！',
    nutrition: '香菇多糖能增强免疫力，味道鲜美又营养'
  },
  {
    id: 'corn',
    name: '玉米',
    emoji: '🌽',
    funFact: '每根玉米的行数都是偶数哦，不信你数数看！',
    nutrition: '富含膳食纤维和叶黄素，对眼睛好'
  },
  {
    id: 'cheese',
    name: '奶酪',
    emoji: '🧀',
    funFact: '制作1公斤奶酪大约需要10公斤的牛奶！',
    nutrition: '浓缩的牛奶精华，钙含量超高，能让牙齿骨骼强壮'
  },
  {
    id: 'bread',
    name: '面包',
    emoji: '🍞',
    funFact: '面包是人类最早制作的食物之一，已有上万年历史！',
    nutrition: '提供能量，全麦面包还有丰富的膳食纤维'
  },
  {
    id: 'milk',
    name: '牛奶',
    emoji: '🥛',
    funFact: '小牛犊出生后喝母乳长大，就像小宝宝一样~',
    nutrition: '钙和优质蛋白的最佳来源，每天一杯身体棒'
  }
]

export const getIngredientById = (id: string): Ingredient | undefined => {
  return INGREDIENTS.find(i => i.id === id)
}
