import { SUBJECTS } from '../constants';
import { onePagerSets, type KSet } from '../onepager';
import type { KnowledgeTopic, FlashCardGroup, KnowledgePart, KnowledgeSection } from './knowledge-data';

const CARD_KINDS = ['方法', '步骤', '口诀', '易错'];
const TIP_LIMIT = 12;

const LINEAR_CHAPTERS = new Set(
  SUBJECTS.find(s => s.id === 'math2')?.sections.find(x => x.name === '线性代数')?.chapters || []
);

function isLinear(set: KSet): boolean {
  return LINEAR_CHAPTERS.has(set.chapter);
}

function joinBody(s: string, tex: string): string {
  return tex ? `${s}\n${tex}` : s;
}

function buildParts(sets: KSet[]): KnowledgePart[] {
  const groups: Array<[string, KSet[]]> = [
    ['高等数学', sets.filter(set => !isLinear(set))],
    ['线性代数', sets.filter(isLinear)]
  ];
  return groups
    .filter(([, list]) => list.length > 0)
    .map(([name, list]) => ({
      name,
      sections: list.map<KnowledgeSection>(set => ({
        name: set.lecture,
        pager: set.pager,
        items: set.points.map(p => ({
          title: p.t,
          content: joinBody(p.s, p.tex),
          tags: [p.k, '一页纸']
        }))
      }))
    }));
}

function buildCardGroups(sets: KSet[]): FlashCardGroup[] {
  return sets
    .map(group => {
      const cards = group.points
        .filter(p => CARD_KINDS.includes(p.k))
        .map(p => ({ q: `${p.k}｜${p.t}`, a: joinBody(p.s, p.tex) }));
      return { name: group.lecture.replace(/^高数|^线代/, ''), cards };
    })
    .filter(g => g.cards.length > 0);
}

function buildTips(sets: KSet[]): string[] {
  const out: string[] = [];
  for (const set of sets) {
    for (const p of set.points) {
      if (p.k === '易错') out.push(`${set.lecture}｜${p.t}：${p.s}`);
    }
  }
  return out.slice(0, TIP_LIMIT);
}

export function onePagerTopic(): KnowledgeTopic | null {
  const sets = onePagerSets();
  if (sets.length === 0) return null;
  const parts = buildParts(sets);
  const cardGroups = buildCardGroups(sets);
  if (parts.length === 0 && cardGroups.length === 0) return null;
  return {
    id: 'math2-onepager',
    name: '数学二 · 一页纸速查',
    subtitle: '基础 30 讲讲义提炼 · 按讲次组织 · 附原图直链',
    icon: '🗂',
    color: '#16A085',
    unit: '条要点',
    parts,
    tips: buildTips(sets),
    cardGroups
  };
}
