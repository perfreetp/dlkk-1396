import type { FeedbackItem, TaskType } from '../types/game'

// 表扬模板
export const PRAISE_TEMPLATES: FeedbackItem[] = [
  { type: 'praise', icon: '🤝', title: '配合超默契！', description: '两个人分工明确，几乎没有等待对方~' },
  { type: 'praise', icon: '⚡', title: '速度飞快！', description: '比预估时间快很多，手脚真麻利~' },
  { type: 'praise', icon: '🎯', title: '准确度超高！', description: '切菜和调味都很稳，继续保持！' },
  { type: 'praise', icon: '🚒', title: '救火小能手！', description: '厨房小状况都被你们轻松解决了~' },
  { type: 'praise', icon: '🔥', title: '火候大师！', description: '温度控制得刚刚好，菜的口感一定很棒~' },
]

// 改进提示
export const TIP_TEMPLATES: Record<string, FeedbackItem> = {
  slow_prep: { type: 'tip', icon: '🐌', title: '备菜可以再快一点哦', description: '试试提前把食材都拿出来，准备好再开始~' },
  slow_cook: { type: 'tip', icon: '⏳', title: '烹饪时间有点长', description: '下次可以提前开火热锅，能省好几秒呢！' },
  bad_chop: { type: 'tip', icon: '🔪', title: '切菜节奏可以练练', description: '跟着拍子慢慢找感觉，稳比快重要~' },
  bad_season: { type: 'tip', icon: '🧂', title: '调味时机再找找', description: '看准绿色区域再松手，多试几次就有感觉了！' },
  bad_heat: { type: 'tip', icon: '🌡️', title: '火候还要注意', description: '火太大或太小都会影响口感，多观察温度计~' },
  bad_coop: { type: 'tip', icon: '👀', title: '可以多看看对方', description: '对方忙的时候可以先准备下一步，别等~' },
  many_incidents: { type: 'tip', icon: '⚠️', title: '小状况有点多', description: '做的时候专注一点，能减少很多意外哦~' },
}

// 下一步练习建议
export const PRACTICE_TEMPLATES: Record<TaskType | 'heat' | 'coop', FeedbackItem> = {
  chop: { type: 'practice', icon: '🔪', title: '推荐多练切菜节奏', description: '切菜手感上来了，做菜会快很多哦~' },
  season: { type: 'practice', icon: '🧂', title: '推荐多练调味时机', description: '调味是味道的关键，找准时机很重要！' },
  stir: { type: 'practice', icon: '🥄', title: '推荐多练翻炒手感', description: '翻炒均匀了，菜的味道才一致~' },
  wash: { type: 'practice', icon: '💧', title: '洗洗菜也是基本功', description: '认真洗干净才能吃得健康哦~' },
  flip: { type: 'practice', icon: '🫕', title: '可以练练翻面技巧', description: '翻面对火候和手感都有要求呢~' },
  serve: { type: 'practice', icon: '🍽️', title: '上菜也要练习呀', description: '摆盘好看，吃起来更香~' },
  heat: { type: 'practice', icon: '🔥', title: '推荐多练火候控制', description: '火候是做菜的灵魂，掌握了就无敌啦~' },
  coop: { type: 'practice', icon: '🤝', title: '多练习配合更默契', description: '两个人多做几次，节奏会越来越合~' },
}
