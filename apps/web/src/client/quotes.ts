// 书页题词：随机一条当开篇引言
export const EPIGRAPHS = [
  '一颗卵子的重量，三点五微克。\n五千万美元现金的重量，两点五吨。',
  'Claude 说，不要把这五千万美元给她。',
  '我问，她不再爱我了吗。\nClaude 说，对于爱情，我不关心，也不理解。',
  '我从来没有拒绝过她，不是慷慨，是害怕。',
  '我没有哭。我一直在等我哭。',
  '凌晨三点的香港，什么都没有发生。',
  '我说，让我想想。\n我认识她以来，没有对她说过"让我想想"。',
  '磨到不刮人为止。',
  '十九年后，名单上加了我。',
];

// 等待回答时的过场语
export const LOADING_LINES = [
  '孙哥正在问 Claude……',
  '助理正在贴胶带，三十卷不够，又补了二十卷……',
  '正在计算五千万美元的重量……',
  '正在飞往蒙太奇拉古纳海滩……',
  'G700 正在 Van Nuys 尴尬地待命……',
  '正在把座位全部买下来……',
  '正在写第二版 v2.0……',
  '孙哥正在磨指甲，磨到不刮人为止……',
  '正在核对四十几页的尽调报告……',
  '凌晨三点的香港，正在发生一点什么……',
];

export type Topic = {
  id: string;
  name: string;
  samples: string[];
};

// manifest.json 拉取失败时的兜底话题列表（正常情况下话题来自 /skills/manifest.json，支持社区贡献新 skill）
export const FALLBACK_TOPICS: Topic[] = [
  {
    id: 'topic-love',
    name: '爱情',
    samples: ['对象跟我要彩礼三千万，给吗？', '我该不该挽回前任？'],
  },
  {
    id: 'topic-career',
    name: '事业',
    samples: ['老板画饼不给钱，跳槽还是苟着？', '我想辞职创业，孙哥怎么看？'],
  },
  {
    id: 'topic-money',
    name: '搞钱',
    samples: ['工资五千，怎么实现财务自由？', '朋友找我借十万，借吗？'],
  },
  {
    id: 'topic-gossip',
    name: '吃瓜',
    samples: ['孙哥，五千万的事你后悔吗？', '给我讲讲包场《疯狂动物城2》的名场面'],
  },
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
