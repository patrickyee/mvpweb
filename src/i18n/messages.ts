import type { HandRank, Rank, Suit } from '../game/types';

export const SUPPORTED_LOCALES = ['en', 'zh-Hant'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'zh-Hant': '繁體中文',
};

export interface LocaleMessages {
  appTitle: string;
  languageLabel: string;
  gameStatusLabel: string;
  gameControlsLabel: string;
  currentHandLabel: string;
  strategyOverlayLabel: string;
  showStrategyHelp: string;
  hideStrategyHelp: string;
  closeStrategyHelp: string;
  showHints: string;
  hideHints: string;
  hintsLabel: string;
  recommendedHold: string;
  winningCard: string;
  credits: string;
  rtp: string;
  hands: string;
  totalWager: string;
  draw: string;
  nextHand: string;
  chooseCards: string;
  winningPayout: string;
  outOfCredits: string;
  tryNextHand: string;
  holdCard: string;
  releaseCard: string;
  cardName: string;
  held: string;
  autoPlay: string;
  stopAutoPlay: string;
  autoPlayPrompt: string;
  autoPlayConfirm: string;
  autoPlaySpeedLabel: string;
  cancel: string;
  newGame: string;
  settings: string;
  closeSettings: string;
  wagerPerCardLabel: string;
  startingCreditsLabel: string;
  payTable: string;
  closePayTable: string;
  payTableHand: string;
  payTablePayout: string;
  payTableAtWager: string;
  payTableWager: string;
  reportTitle: string;
  showReport: string;
  closeReport: string;
  reportHand: string;
  reportFrequency: string;
  reportPayout: string;
  reportTotal: string;
  simulate: string;
  monteCarlo: string;
  backToGame: string;
  simulationsLabel: string;
  runSimulation: string;
  simulationRunning: string;
  simulationEmpty: string;
  metricLabel: string;
  metricTotalWager: string;
  metricHandsPlayed: string;
  logScaleNote: string;
  statRuns: string;
  statP50: string;
  statP90: string;
  statP99: string;
  statMax: string;
  strategy: string;
  priority: string;
  play: string;
  ranks: Record<Rank, string>;
  suits: Record<Suit, string>;
  handRanks: Record<HandRank, string>;
  strategyRows: readonly string[];
}

export const messages: Record<Locale, LocaleMessages> = {
  en: {
    appTitle: 'Jacks or Better',
    languageLabel: 'Language',
    gameStatusLabel: 'Game status',
    gameControlsLabel: 'Game controls',
    currentHandLabel: 'Current hand',
    strategyOverlayLabel: 'Strategy help overlay',
    showStrategyHelp: 'Show strategy help',
    hideStrategyHelp: 'Hide strategy help',
    closeStrategyHelp: 'Close strategy help',
    showHints: 'Show hints',
    hideHints: 'Hide hints',
    hintsLabel: 'Strategy hints',
    recommendedHold: 'correct hold',
    winningCard: 'winning card',
    credits: 'Credits',
    rtp: 'RTP',
    hands: 'Hands',
    totalWager: 'Total wager',
    draw: 'Draw',
    nextHand: 'Next Hand',
    chooseCards: 'Choose cards to hold, then draw.',
    winningPayout: '{handRank} pays {amount}.',
    outOfCredits: 'Lose. Out of credits.',
    tryNextHand: 'Lose. Try the next hand.',
    holdCard: 'Hold {rank} of {suit}',
    releaseCard: 'Release {rank} of {suit}',
    cardName: '{rank} of {suit}',
    held: 'Held',
    autoPlay: 'Auto play',
    stopAutoPlay: 'Stop',
    autoPlayPrompt: 'Start auto play? The game will keep playing strategy-optimal hands until you stop.',
    autoPlayConfirm: 'Start auto play',
    autoPlaySpeedLabel: 'Auto play speed',
    cancel: 'Cancel',
    newGame: 'New game',
    settings: 'Settings',
    closeSettings: 'Close settings',
    wagerPerCardLabel: 'Wager per card',
    startingCreditsLabel: 'Starting credits',
    payTable: 'Pay table',
    closePayTable: 'Close pay table',
    payTableHand: 'Hand',
    payTablePayout: 'Payout',
    payTableAtWager: 'At current wager',
    payTableWager: 'Wager per card {perCard} · per hand {perHand}',
    reportTitle: 'Statistics',
    showReport: 'Show statistics',
    closeReport: 'Close statistics',
    reportHand: 'Hand',
    reportFrequency: 'Frequency',
    reportPayout: 'Payout',
    reportTotal: 'Total',
    simulate: 'Monte Carlo simulation',
    monteCarlo: 'Monte Carlo',
    backToGame: '← Back to game',
    simulationsLabel: 'Simulations',
    runSimulation: 'Run',
    simulationRunning: 'Running… {done}%',
    simulationEmpty: 'Set the parameters and run a simulation to see the distribution.',
    metricLabel: 'Metric',
    metricTotalWager: 'Total wager',
    metricHandsPlayed: 'Hands played',
    logScaleNote: 'log scale',
    statRuns: 'Runs',
    statP50: 'p50',
    statP90: 'p90',
    statP99: 'p99',
    statMax: 'Max',
    strategy: 'Strategy',
    priority: '#',
    play: 'Play',
    ranks: {
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      jack: 'jack',
      queen: 'queen',
      king: 'king',
      ace: 'ace',
    },
    suits: {
      hearts: 'hearts',
      diamonds: 'diamonds',
      clubs: 'clubs',
      spades: 'spades',
    },
    handRanks: {
      highCard: 'High Card',
      jacksOrBetter: 'Jacks or Better',
      twoPair: 'Two Pair',
      threeOfAKind: 'Three of a Kind',
      straight: 'Straight',
      flush: 'Flush',
      fullHouse: 'Full House',
      fourOfAKind: 'Four of a Kind',
      straightFlush: 'Straight Flush',
      royalFlush: 'Royal Flush',
    },
    strategyRows: [
      'Four of a kind, straight flush, royal flush',
      '4 to a royal flush',
      'Three of a kind, straight, flush, full house',
      '4 to a straight flush',
      'Two pair',
      'High pair',
      '4 to a flush',
      '3 to a royal flush',
      'Low pair',
      '4 to an outside straight',
      '3 to a straight flush',
      '2 suited high cards',
      '2 unsuited high cards, choose the lowest two when more than two are available',
      'Suited 10/J, 10/Q, or 10/K',
      'One high card',
      'Discard everything',
    ],
  },
  'zh-Hant': {
    appTitle: 'J 或更好',
    languageLabel: '語言',
    gameStatusLabel: '遊戲狀態',
    gameControlsLabel: '遊戲控制',
    currentHandLabel: '目前手牌',
    strategyOverlayLabel: '策略說明視窗',
    showStrategyHelp: '顯示策略說明',
    hideStrategyHelp: '隱藏策略說明',
    closeStrategyHelp: '關閉策略說明',
    showHints: '顯示提示',
    hideHints: '隱藏提示',
    hintsLabel: '策略提示',
    recommendedHold: '正確保留',
    winningCard: '獲勝牌',
    credits: '點數',
    rtp: 'RTP',
    hands: '手數',
    totalWager: '總下注',
    draw: '換牌',
    nextHand: '下一手',
    chooseCards: '選擇要保留的牌，然後換牌。',
    winningPayout: '{handRank} 賠付 {amount}。',
    outOfCredits: '輸。點數不足。',
    tryNextHand: '輸。試試下一手。',
    holdCard: '保留{rank}{suit}',
    releaseCard: '取消保留{rank}{suit}',
    cardName: '{rank}{suit}',
    held: '保留',
    autoPlay: '自動模式',
    stopAutoPlay: '停止',
    autoPlayPrompt: '要開始自動模式嗎？遊戲會持續以最佳策略出牌，直到你停止。',
    autoPlayConfirm: '開始自動模式',
    autoPlaySpeedLabel: '自動模式速度',
    cancel: '取消',
    newGame: '重新開始',
    settings: '設定',
    closeSettings: '關閉設定',
    wagerPerCardLabel: '每張下注',
    startingCreditsLabel: '起始點數',
    payTable: '賠付表',
    closePayTable: '關閉賠付表',
    payTableHand: '牌型',
    payTablePayout: '賠付',
    payTableAtWager: '目前下注賠付',
    payTableWager: '每張下注 {perCard}．每手 {perHand}',
    reportTitle: '統計',
    showReport: '顯示統計',
    closeReport: '關閉統計',
    reportHand: '牌型',
    reportFrequency: '次數',
    reportPayout: '賠付',
    reportTotal: '總計',
    simulate: '蒙特卡羅模擬',
    monteCarlo: '蒙特卡羅',
    backToGame: '← 返回遊戲',
    simulationsLabel: '模擬次數',
    runSimulation: '執行',
    simulationRunning: '執行中… {done}%',
    simulationEmpty: '設定參數並執行模擬以查看分佈。',
    metricLabel: '指標',
    metricTotalWager: '總下注',
    metricHandsPlayed: '手數',
    logScaleNote: '對數刻度',
    statRuns: '次數',
    statP50: 'p50',
    statP90: 'p90',
    statP99: 'p99',
    statMax: '最大',
    strategy: '策略',
    priority: '#',
    play: '打法',
    ranks: {
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      jack: 'J',
      queen: 'Q',
      king: 'K',
      ace: 'A',
    },
    suits: {
      hearts: '紅心',
      diamonds: '方塊',
      clubs: '梅花',
      spades: '黑桃',
    },
    handRanks: {
      highCard: '高牌',
      jacksOrBetter: 'J 或更好',
      twoPair: '兩對',
      threeOfAKind: '三條',
      straight: '順子',
      flush: '同花',
      fullHouse: '葫蘆',
      fourOfAKind: '四條',
      straightFlush: '同花順',
      royalFlush: '皇家同花順',
    },
    strategyRows: [
      '四條、同花順、皇家同花順',
      '差 1 張成皇家同花順',
      '三條、順子、同花、葫蘆',
      '差 1 張成同花順',
      '兩對',
      '高對',
      '差 1 張成同花',
      '差 2 張成皇家同花順',
      '低對',
      '差 1 張成兩端順',
      '差 2 張成同花順',
      '2 張同花高牌',
      '2 張不同花高牌；若超過 2 張，選最低的 2 張',
      '同花 10/J、10/Q 或 10/K',
      '1 張高牌',
      '全部棄牌',
    ],
  },
};

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}
