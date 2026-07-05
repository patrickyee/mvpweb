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
  result: string;
  hands: string;
  playing: string;
  winResult: string;
  lose: string;
  draw: string;
  nextHand: string;
  chooseCards: string;
  winningPayout: string;
  outOfCredits: string;
  tryNextHand: string;
  holdCard: string;
  releaseCard: string;
  held: string;
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
    recommendedHold: 'recommended hold',
    winningCard: 'winning card',
    credits: 'Credits',
    rtp: 'RTP',
    result: 'Result',
    hands: 'Hands',
    playing: 'Playing',
    winResult: 'Win {amount}',
    lose: 'Lose',
    draw: 'Draw',
    nextHand: 'Next Hand',
    chooseCards: 'Choose cards to hold, then draw.',
    winningPayout: '{handRank} pays {amount}.',
    outOfCredits: 'Lose. Out of credits.',
    tryNextHand: 'Lose. Try the next hand.',
    holdCard: 'Hold {rank} of {suit}',
    releaseCard: 'Release {rank} of {suit}',
    held: 'Held',
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
      '3 to a royal flush',
      '4 to a flush',
      'Low pair',
      '4 to an outside straight',
      '2 suited high cards',
      '3 to a straight flush',
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
    recommendedHold: '建議保留',
    winningCard: '獲勝牌',
    credits: '點數',
    rtp: 'RTP',
    result: '結果',
    hands: '手數',
    playing: '進行中',
    winResult: '贏 {amount}',
    lose: '輸',
    draw: '換牌',
    nextHand: '下一手',
    chooseCards: '選擇要保留的牌，然後換牌。',
    winningPayout: '{handRank} 賠付 {amount}。',
    outOfCredits: '輸。點數不足。',
    tryNextHand: '輸。試試下一手。',
    holdCard: '保留{rank}{suit}',
    releaseCard: '取消保留{rank}{suit}',
    held: '保留',
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
      '差 2 張成皇家同花順',
      '差 1 張成同花',
      '低對',
      '差 1 張成兩端順',
      '2 張同花高牌',
      '差 2 張成同花順',
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
