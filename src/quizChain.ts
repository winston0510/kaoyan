import { TIER_OPTIONS, type TierFilter } from './provenance';

export type QuizSession = {
  subject: string;
  subjectName: string;
  chapter: string;
  section: string;
  mode: string;
  count: number;
  tier: TierFilter;
};

export const MODE_NAMES: Record<string, string> = {
  random: '随机刷题',
  sequential: '顺序刷题',
  fresh: '顺序只刷未掌握',
  continue: '继续刷题',
  wrong: '错题重做',
};

export function scopeLabel(sess: QuizSession): string {
  return sess.chapter !== '' ? sess.chapter : sess.section !== '' ? sess.section : '整科';
}

export function batchOffset(sess: QuizSession, cursor: number): number {
  return sess.mode === 'sequential' ? cursor : 0;
}

export function nextCursor(sess: QuizSession, cursor: number, served: number): number {
  return sess.mode === 'sequential' ? cursor + served : 0;
}

export function sessionHint(sess: QuizSession): string {
  const tier = TIER_OPTIONS.find(o => o.id === sess.tier)?.label || '全部来源';
  return [sess.subjectName, scopeLabel(sess), MODE_NAMES[sess.mode] || '随机刷题', sess.count + ' 题', tier].filter(x => x !== '').join(' · ');
}

export function emptyMessage(sess: QuizSession, ctx: { allAnswered: boolean; poolSize: number; offset: number }): string {
  if (sess.mode === 'wrong') return '错题本里没有未掌握的题目';
  if (ctx.allAnswered) return '题目已全部刷完，试试「错题重做」或更换范围';
  if (sess.mode === 'sequential' && ctx.poolSize > 0 && ctx.offset >= ctx.poolSize) {
    return `本组已刷完 ${ctx.poolSize} 题，换范围或在弹窗里重新起步`;
  }
  if (sess.tier !== '' && sess.mode !== 'wrong') return '所选来源下没有题目，把来源筛选改回「全部来源」再试';
  if (ctx.poolSize > 0) return '当前范围内暂无可刷题目';
  return sess.subjectName !== '' ? `${sess.subjectName}暂无题目` : '该科目暂无题目，请先添加题目';
}
