import { describe, expect, it } from 'vitest';
import { batchOffset, emptyMessage, MODE_NAMES, nextCursor, scopeLabel, sessionHint, type QuizSession } from '../src/quizChain';
import quizSrc from '../src/ui/quiz.ts?raw';
import mainSrc from '../src/main.ts?raw';

const sess = (over: Partial<QuizSession> = {}): QuizSession => ({
  subject: 'politics',
  subjectName: '政治',
  chapter: '',
  section: '',
  mode: 'sequential',
  count: 20,
  tier: '',
  ...over
});

describe('下一组的游标', () => {
  it('只有顺序刷题带游标，其余模式每次都从头组题', () => {
    expect(batchOffset(sess(), 40)).toBe(40);
    for (const mode of ['random', 'fresh', 'continue', 'wrong']) {
      expect(batchOffset(sess({ mode }), 40)).toBe(0);
    }
  });

  it('顺序刷题按本组实际出题数前进，其余模式归零', () => {
    expect(nextCursor(sess(), 0, 20)).toBe(20);
    expect(nextCursor(sess(), 20, 7)).toBe(27);
    expect(nextCursor(sess({ mode: 'random' }), 20, 20)).toBe(0);
    expect(nextCursor(sess({ mode: 'continue' }), 20, 20)).toBe(0);
  });

  it('从弹窗重新起步时游标为 0', () => {
    expect(batchOffset(sess(), 0)).toBe(0);
  });
});

describe('结果页的续刷说明', () => {
  it('范围缺省写「整科」，优先章节再板块', () => {
    expect(scopeLabel(sess())).toBe('整科');
    expect(scopeLabel(sess({ section: '马原' }))).toBe('马原');
    expect(scopeLabel(sess({ section: '马原', chapter: '第1章' }))).toBe('第1章');
  });

  it('列出科目·范围·模式·题量·来源筛选', () => {
    expect(sessionHint(sess({ chapter: '第1章', mode: 'fresh' }))).toBe('政治 · 第1章 · 顺序只刷未掌握 · 20 题 · 全部来源');
    expect(sessionHint(sess({ mode: 'random', tier: 'paper' }))).toContain('仅官方真题');
    expect(sessionHint(sess({ mode: 'unknown-mode' }))).toContain('随机刷题');
  });

  it('五种模式都有中文名', () => {
    expect(Object.keys(MODE_NAMES).sort()).toEqual(['continue', 'fresh', 'random', 'sequential', 'wrong']);
  });

  it('科目名缺失时不留下多余分隔符', () => {
    expect(sessionHint(sess({ subjectName: '' }))).toBe('整科 · 顺序刷题 · 20 题 · 全部来源');
  });
});

describe('空组原因', () => {
  it('先说「全部刷完」，其次顺序到末尾，再说来源筛选', () => {
    expect(emptyMessage(sess({ mode: 'continue' }), { allAnswered: true, poolSize: 0, offset: 0 }))
      .toBe('题目已全部刷完，试试「错题重做」或更换范围');
    expect(emptyMessage(sess({ tier: 'trust' }), { allAnswered: true, poolSize: 0, offset: 0 }))
      .toContain('错题重做');
    expect(emptyMessage(sess({ mode: 'random', tier: 'trust' }), { allAnswered: false, poolSize: 0, offset: 0 }))
      .toBe('所选来源下没有题目，把来源筛选改回「全部来源」再试');
  });

  it('顺序刷题刷到末尾时报本组题数', () => {
    expect(emptyMessage(sess(), { allAnswered: false, poolSize: 55, offset: 55 })).toContain('本组已刷完 55 题');
    expect(emptyMessage(sess(), { allAnswered: false, poolSize: 55, offset: 20 })).toBe('当前范围内暂无可刷题目');
  });

  it('错题重做空了就说错题本，不推给科目没题', () => {
    expect(emptyMessage(sess({ mode: 'wrong', tier: 'paper' }), { allAnswered: false, poolSize: 0, offset: 0 }))
      .toBe('错题本里没有未掌握的题目');
  });

  it('整科为空时给出可操作提示', () => {
    expect(emptyMessage(sess({ subjectName: '' }), { allAnswered: false, poolSize: 0, offset: 0 }))
      .toBe('该科目暂无题目，请先添加题目');
  });
});

describe('结果页按钮接线', () => {
  it('结果页按已选模式续刷，套卷结果仍回首页', () => {
    expect(quizSrc).toContain('id="continueBtn"');
    expect(quizSrc).toContain('onclick="continueFromResult()"');
    expect(quizSrc).toContain('sessionHint(lastSession)');
    expect(quizSrc).toContain("lastSession = null;");
    expect(quizSrc).toContain("switchPage('home')");
  });

  it('组题切片吃游标，不再写死从头取', () => {
    expect(quizSrc).toContain('questions.slice(offset, offset + sess.count)');
    expect(quizSrc).not.toMatch(/questions\.slice\(0, (count|sess\.count)\)/);
  });

  it('continueFromResult 暴露给内联 onclick', () => {
    expect(mainSrc).toMatch(/windowApi[\s\S]*continueFromResult,/);
    expect(quizSrc).toContain('export async function continueFromResult()');
  });

  it('开始按钮恢复原文案（套卷弹窗是「开始整套」）', () => {
    expect(quizSrc).toContain('const label = btn.textContent');
    expect(quizSrc).toContain('btn.textContent = label;');
  });
});
