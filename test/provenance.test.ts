import { describe, expect, it } from 'vitest';
import { TIER_OPTIONS, matchTier, sourceTier, tierBadge } from '../src/provenance';
import modalSrc from '../src/ui/subject.ts?raw';
import quizSrc from '../src/ui/quiz.ts?raw';

describe('弹窗筛选的接线', () => {
  it('弹窗里的下拉框 id 与 startQuiz 读取的选择器一致', () => {
    expect(modalSrc).toContain('id="tierFilter"');
    expect(quizSrc).toContain("querySelector<HTMLSelectElement>('#tierFilter')");
  });

  it('筛选只作用于新题模式，不动错题重做与套卷', () => {
    const at = quizSrc.indexOf('matchTier(q.source, sess.tier)');
    expect(at).toBeGreaterThan(-1);
    const guard = quizSrc.slice(at - 260, at);
    expect(guard).toContain("paperSource === ''");
    expect(guard).toContain("sess.mode !== 'wrong'");
    expect(guard).toContain("sess.tier !== ''");
  });
});

describe('来源分档', () => {
  it('YYYY年真题 是官方真题', () => {
    expect(sourceTier('2016年真题')).toBe('paper');
    expect(sourceTier('2026年真题')).toBe('paper');
  });

  it('真题风格题不是官方真题', () => {
    expect(sourceTier('2015真题风格题')).toBe('style');
    expect(sourceTier('2024真题风格题')).toBe('style');
  });

  it('具名整理的两种写法都认', () => {
    expect(sourceTier('名师典型·肖秀荣')).toBe('named');
    expect(sourceTier('名师典型·北交大870')).toBe('named');
    expect(sourceTier('张宇1000题')).toBe('named');
    expect(sourceTier('汤家凤1800题')).toBe('named');
    expect(sourceTier('恋练有词')).toBe('named');
  });

  it('整批导入的题只到「未逐题标注」，不假装知道出处', () => {
    for (const s of ['政治多源题库', '政治题库', '数学二题库', '数学二强化题库', '英语二题库', '电路题库(北交大870)', '电路强化题库', '']) {
      expect(sourceTier(s), s).toBe('unknown');
    }
  });

  it('来源筛选的三档语义', () => {
    expect(matchTier('政治多源题库', '')).toBe(true);
    expect(matchTier('政治多源题库', 'trust')).toBe(false);
    expect(matchTier('政治多源题库', 'paper')).toBe(false);
    expect(matchTier('名师典型·徐涛', 'trust')).toBe(true);
    expect(matchTier('名师典型·徐涛', 'paper')).toBe(false);
    expect(matchTier('2019真题风格题', 'trust')).toBe(true);
    expect(matchTier('2019真题风格题', 'paper')).toBe(false);
    expect(matchTier('2023年真题', 'paper')).toBe(true);
    expect(matchTier(undefined, 'trust')).toBe(false);
  });

  it('筛选项顺序为 全部 / 可信 / 仅真题', () => {
    expect(TIER_OPTIONS.map(o => o.id)).toEqual(['', 'trust', 'paper']);
  });

  it('徽章带出处说明，未知来源用警告色', () => {
    expect(tierBadge('2023年真题')).toContain('官方真题');
    expect(tierBadge('2023年真题')).toContain('tier-paper');
    expect(tierBadge('政治多源题库')).toContain('来源未逐题标注');
    expect(tierBadge('政治多源题库')).toContain('tier-unknown');
    expect(tierBadge('title"注入')).not.toContain('注入');
    expect(tierBadge('title"注入')).not.toContain('&quot;');
  });
});
