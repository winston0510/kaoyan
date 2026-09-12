const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';

export function answerPoints(answer: string): string[] {
  if (!answer) return [];
  let s = String(answer).replace(/\\n/g, '\n');
  for (const ch of CIRCLED) s = s.split(ch).join('\n');
  s = s.replace(/[（(【[]\s*[0-9一二三四五六七八九十]{1,3}\s*[)）】\]]/g, '\n');
  s = s.replace(/(^|\s)[0-9]{1,2}\s*[.、．:：]\s*(?=[\u4e00-\u9fa5])/g, '\n');
  return s
    .split(/\n|；|;/)
    .map(t => t.trim().replace(/^[，,、.\s]+/, ''))
    .filter(t => t.length >= 3)
    .slice(0, 10);
}

export function isRecitable(subject: string, type: string, answer: string): boolean {
  if (type !== 'essay') return false;
  if (subject !== 'politics') return false;
  return answerPoints(answer).length >= 2;
}
