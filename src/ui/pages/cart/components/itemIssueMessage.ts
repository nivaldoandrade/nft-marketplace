import { type QuoteIssue, QuoteIssueType } from '@/app/types/Quote';

export function getItemIssueMessage(issue: QuoteIssue | undefined) {
  if (issue?.type === QuoteIssueType.UNAVAILABLE) {
    return 'Edição esgotada. Remova o item para continuar.';
  }

  if (issue?.type === QuoteIssueType.QUANTITY_EXCEEDED) {
    return `Apenas ${issue.currentValue} disponível(is). Ajuste a quantidade.`;
  }

  return null;
}
