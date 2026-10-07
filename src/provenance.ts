import { esc } from './utils';

export type SourceTier = 'paper' | 'named' | 'style' | 'unknown';
export type TierFilter = '' | 'paper' | 'trust';

export const TIER_LABELS: Record<SourceTier, string> = {
  paper: '官方真题',
  named: '具名整理',
  style: '仿真题风格',
  unknown: '来源未逐题标注'
};

export const TIER_HINTS: Record<SourceTier, string> = {
  paper: '来自该年份官方试卷原题',
  named: '辅导书或名师专题，按书整理',
  style: '按真题风格自编，不是官方原题',
  unknown: '整批导入时未记录每题出处，可信度最低'
};

export const TIER_OPTIONS: Array<{ id: TierFilter; label: string; desc: string }> = [
  { id: '', label: '全部来源', desc: '含未逐题标注来源的题目' },
  { id: 'trust', label: '仅可信来源', desc: '官方真题 + 具名整理 + 仿风格' },
  { id: 'paper', label: '仅官方真题', desc: '只做年份真题卷原题' }
];

const NAMED_BOOKS = new Set(['张宇1000题', '武忠祥每日一题', '汤家凤1800题', '恋练有词']);

export function sourceTier(source?: string): SourceTier {
  const s = (source || '').trim();
  if (s === '') return 'unknown';
  if (/^\d{4}年真题$/.test(s)) return 'paper';
  if (/^\d{4}真题风格题$/.test(s)) return 'style';
  if (s.startsWith('名师典型·') || NAMED_BOOKS.has(s)) return 'named';
  return 'unknown';
}

export function matchTier(source: string | undefined, filter: TierFilter): boolean {
  if (filter === '') return true;
  const tier = sourceTier(source);
  if (filter === 'paper') return tier === 'paper';
  return tier !== 'unknown';
}

export function tierBadge(source?: string): string {
  const tier = sourceTier(source);
  return `<span class="tag tag-tier tier-${tier}" title="${esc(TIER_HINTS[tier])}">${TIER_LABELS[tier]}</span>`;
}
