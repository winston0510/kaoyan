import type { Question } from './types';

function normalizeText(s: string): string {
  return s
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。、；：？！,.!?;:"“”‘’（）()【】\[\]《》<>\/\\|]/g, '');
}

function sortLetters(s: string): string {
  return s.trim().toUpperCase().split('').sort().join('');
}

export function judgeAnswer(type: Question['type'], userAnswer: string, correctAnswer: string): boolean {
  if (type === 'fill') {
    const candidates = correctAnswer.split('|').map(c => normalizeText(c)).filter(Boolean);
    const ua = normalizeText(userAnswer);
    return candidates.length === 0 ? false : candidates.includes(ua);
  }
  if (type === 'multiple') {
    return sortLetters(userAnswer) === sortLetters(correctAnswer);
  }
  return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
}

export function formatCorrectAnswer(type: Question['type'], correctAnswer: string): string {
  if (type === 'fill') {
    return correctAnswer.split('|').map(c => c.trim()).filter(Boolean).join(' 或 ');
  }
  return correctAnswer;
}

export function isManualType(type: Question['type']): boolean {
  return type === 'essay';
}