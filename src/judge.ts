import type { Question, QuestionType } from './types';

function normalizeText(s: string): string {
  return s
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。、；：？！,.!?;:"“”‘’（）()【】\[\]《》<>\/\\|]/g, '');
}

export function answerLetters(correctAnswer: string): string[] {
  return [...new Set(((correctAnswer || '').toUpperCase().match(/[A-Z]/g) || []))].sort();
}

export function effectiveType(q: Pick<Question, 'type' | 'answer'>): QuestionType {
  if (q.type === 'multiple') return 'multiple';
  if (q.type === 'single') return answerLetters(q.answer).length > 1 ? 'multiple' : 'single';
  return q.type;
}

export function isMultiChoice(q: Pick<Question, 'type' | 'answer'>): boolean {
  return effectiveType(q) === 'multiple';
}

export function isGradeable(q: Question): boolean {
  const answer = (q.answer || '').trim();
  if (!answer) return false;
  if (q.type === 'fill') return answer.split('|').some(c => c.trim() !== '');
  if (q.type === 'essay') return true;
  const letters = answerLetters(answer);
  const options = q.options || [];
  if (letters.length === 0 || options.length === 0) return false;
  if (letters.length > options.length) return false;
  return letters.every(l => l.charCodeAt(0) - 64 <= options.length);
}

export function judgeAnswer(type: Question['type'], userAnswer: string, correctAnswer: string): boolean {
  if (type === 'fill') {
    const candidates = correctAnswer.split('|').map(c => normalizeText(c)).filter(Boolean);
    const ua = normalizeText(userAnswer);
    return candidates.length === 0 ? false : candidates.includes(ua);
  }
  const correct = answerLetters(correctAnswer);
  if (correct.length > 1 || type === 'multiple') {
    const picked = answerLetters(userAnswer);
    return picked.length === correct.length && picked.every((l, i) => l === correct[i]);
  }
  return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
}

export function formatCorrectAnswer(type: Question['type'], correctAnswer: string): string {
  if (type === 'fill') {
    return correctAnswer.split('|').map(c => c.trim()).filter(Boolean).join(' 或 ');
  }
  return answerLetters(correctAnswer).join('') || correctAnswer;
}

export function isManualType(type: Question['type']): boolean {
  return type === 'essay';
}
