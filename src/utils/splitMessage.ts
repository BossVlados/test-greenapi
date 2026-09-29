export const MAX_MESSAGE_LENGTH = 2048;

export function splitMessage(text: string, limit = MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);
  let current = '';

  const flush = (): void => {
    if (current) {
      chunks.push(current);
      current = '';
    }
  };

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;

    if (candidate.length <= limit) {
      current = candidate;
      continue;
    }

    flush();

    if (para.length <= limit) {
      current = para;
      continue;
    }

    const parts = splitByWords(para, limit);
    for (let i = 0; i < parts.length - 1; i += 1) {
      chunks.push(parts[i]);
    }
    current = parts[parts.length - 1] ?? '';
  }

  flush();
  return chunks;
}

function splitByWords(text: string, limit: number): string[] {
  const tokens = text.split(/(\s+)/);
  const chunks: string[] = [];
  let current = '';

  for (const token of tokens) {
    if (current.length + token.length <= limit) {
      current += token;
      continue;
    }

    if (current) {
      chunks.push(current.trimEnd());
      current = '';
    }

    if (token.length <= limit) {
      current = token;
      continue;
    }

    for (let i = 0; i < token.length; i += limit) {
      chunks.push(token.slice(i, i + limit));
    }
  }

  if (current) chunks.push(current.trimEnd());
  return chunks;
}