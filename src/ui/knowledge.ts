import { KNOWLEDGE_TOPICS, type KnowledgeTopic } from '../data/knowledge-data';
import { formatMath } from '../utils';

function mathHtml(s: string): string {
  return formatMath(s.replace(/\n/g, '\u0001')).replace(/\u0001/g, '<br>');
}

function topicItemCount(t: KnowledgeTopic): number {
  return t.parts.reduce((a, p) => a + p.sections.reduce((x, s) => x + s.items.length, 0), 0);
}

function topicCardCount(t: KnowledgeTopic): number {
  return t.cardGroups.reduce((a, g) => a + g.cards.length, 0);
}

function topicUnit(t: KnowledgeTopic): string {
  return t.unit || '条公式';
}

export function renderKnowledge(): void {
  const root = document.getElementById('knowledgeContent');
  if (!root) return;
  resetTopbar();
  const totalCards = KNOWLEDGE_TOPICS.reduce((a, t) => a + topicCardCount(t), 0);
  const hero = `<div class="kt-hero">
    <div class="kt-hero-icon">📚</div>
    <div class="kt-hero-title">知识库</div>
    <div class="kt-hero-sub">知识点速查 · 记忆卡片 · 多科目持续扩展</div>
    <div class="kt-hero-meta">${KNOWLEDGE_TOPICS.length} 个主题 · ${totalCards} 张记忆卡片</div>
  </div>`;
  const grid = `<div class="kt-grid">` + KNOWLEDGE_TOPICS.map(t => {
    const itemCount = topicItemCount(t);
    const cardCount = topicCardCount(t);
    return `<div class="kt-topic-card" style="--accent:${t.color}" onclick="openKnowledgeTopic('${t.id}')">
      <div class="kt-topic-icon" style="background:${t.color}18">${t.icon}</div>
      <div class="kt-topic-info">
        <div class="kt-topic-name">${t.name}</div>
        <div class="kt-topic-sub">${t.subtitle}</div>
        <div class="kt-topic-tags"><span>${itemCount} ${topicUnit(t)}</span><span>🃏 ${cardCount} 张卡片</span></div>
      </div>
      <span class="kt-topic-arrow">›</span>
    </div>`;
  }).join('') + `</div>`;
  const empty = KNOWLEDGE_TOPICS.length === 0
    ? `<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-title">知识库建设中</div><div class="empty-desc">后续将加入更多科目知识点</div></div>`
    : '';
  root.innerHTML = hero + grid + empty;
}

function setTopicTopbar(t: KnowledgeTopic): void {
  const back = document.getElementById('knowledgeTopBack') as HTMLElement | null;
  const title = document.getElementById('knowledgeTopTitle') as HTMLElement | null;
  if (back) {
    back.style.visibility = 'visible';
    back.onclick = () => {
      renderKnowledge();
    };
  }
  if (title) title.textContent = t.name;
}

function resetTopbar(): void {
  const back = document.getElementById('knowledgeTopBack') as HTMLElement | null;
  const title = document.getElementById('knowledgeTopTitle') as HTMLElement | null;
  if (back) {
    back.style.visibility = 'hidden';
    back.onclick = null;
  }
  if (title) title.textContent = '知识库';
}

export function openKnowledgeTopic(id: string): void {
  const t = KNOWLEDGE_TOPICS.find(x => x.id === id);
  if (t) renderTopic(t);
}

export function backFromKnowledge(): void {
  renderKnowledge();
}

function renderTopic(t: KnowledgeTopic): void {
  const root = document.getElementById('knowledgeContent');
  if (!root) return;
  setTopicTopbar(t);
  const itemCount = topicItemCount(t);
  const cardCount = topicCardCount(t);

  const header = `<div class="kt-topic-banner" style="--accent:${t.color}">
    <div class="kt-banner-icon" style="background:${t.color}18">${t.icon}</div>
    <div class="kt-banner-info">
      <div class="kt-banner-title">${t.name}</div>
      <div class="kt-banner-sub">${t.subtitle}</div>
      <div class="kt-banner-meta">${itemCount} ${topicUnit(t)} · ${cardCount} 张记忆卡片</div>
    </div>
  </div>`;

  const tabs = `<div class="filter-row kt-tabs">
    <span class="filter-chip active" onclick="switchKnowledgeTab('ref', this)">📖 知识点速查</span>
    <span class="filter-chip" onclick="switchKnowledgeTab('cards', this)">🃏 记忆卡片 · ${cardCount}</span>
  </div>`;

  const refPanel = `<div id="ktRefPanel">` + t.parts.map(p => {
    const sectionsHtml = p.sections.map(s => {
      const itemsHtml = s.items.map(it => {
        const tagHtml = (it.tags || []).map(tag => `<span class="k-tag">${tag}</span>`).join('');
        return `<div class="kt-item">
          <div class="kt-item-head">${tagHtml}<span class="kt-item-title">${it.title}</span></div>
          <div class="kt-item-body">${mathHtml(it.content)}</div>
        </div>`;
      }).join('');
      return `<div class="card kt-section open">
        <div class="kt-section-head" onclick="toggleKnowledgeSection(this)">
          <span class="kt-section-name">${s.name}</span>
          <span class="kt-chevron">⌄</span>
        </div>
        <div class="kt-section-body">${itemsHtml}</div>
      </div>`;
    }).join('');
    return `<div class="kt-part"><div class="kt-part-title">${p.name}</div>${sectionsHtml}</div>`;
  }).join('') + `
    <div class="card kt-tips">
      <div class="kt-tips-title">⚠️ 高频考点与易错提醒</div>
      <div class="kt-tips-body">${t.tips.map(tip => `<div class="kt-tip">${mathHtml(tip)}</div>`).join('')}</div>
    </div>
  </div>`;

  const cardsPanel = `<div id="ktCardsPanel" style="display:none">` + t.cardGroups.map(g => {
    const cardsHtml = g.cards.map((c, i) => {
      return `<div class="kt-flash" onclick="flipCard(this)">
        <div class="kt-flash-inner">
          <div class="kt-flash-face kt-flash-front">
            <div class="kt-flash-no">${g.name} · ${i + 1}</div>
            <div class="kt-flash-q">${mathHtml(c.q)}</div>
            <div class="kt-flash-hint">点击翻面看答案</div>
          </div>
          <div class="kt-flash-face kt-flash-back">${mathHtml(c.a)}</div>
        </div>
      </div>`;
    }).join('');
    return `<div class="kt-card-group"><div class="kt-part-title">${g.name}</div><div class="kt-flash-grid">${cardsHtml}</div></div>`;
  }).join('') + `</div>`;

  root.innerHTML = header + tabs + refPanel + cardsPanel;
}

export function switchKnowledgeTab(tab: 'ref' | 'cards', el: HTMLElement): void {
  const bar = el.parentElement;
  if (bar) bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const ref = document.getElementById('ktRefPanel');
  const cards = document.getElementById('ktCardsPanel');
  if (ref) ref.style.display = tab === 'ref' ? '' : 'none';
  if (cards) cards.style.display = tab === 'cards' ? '' : 'none';
}

export function toggleKnowledgeSection(el: HTMLElement): void {
  const card = el.closest('.kt-section');
  if (card) card.classList.toggle('open');
}

export function flipCard(el: HTMLElement): void {
  el.classList.toggle('flipped');
}