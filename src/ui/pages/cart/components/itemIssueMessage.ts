import { type QuoteIssue, QuoteIssueType } from '@/app/types/Quote';
import { formatEth } from '@/app/utils/eth';

export function getItemIssueMessage(issue: QuoteIssue | undefined) {
  if (issue?.type === QuoteIssueType.UNAVAILABLE) {
    return 'Edição esgotada. Remova o item para continuar.';
  }

  if (issue?.type === QuoteIssueType.QUANTITY_EXCEEDED) {
    return `Apenas ${issue.currentValue} disponível(is). Ajuste a quantidade.`;
  }

  if (issue?.type === QuoteIssueType.PRICE_CHANGED && issue.previousValue && issue.currentValue) {
    return `Preço atualizado de ${formatEth(issue.previousValue)} para ${formatEth(issue.currentValue)} ETH desde que foi adicionado.`;
  }

  return null;
}

export function isBlockingIssue(issue: QuoteIssue | undefined) {
  return (
    issue?.type === QuoteIssueType.UNAVAILABLE || issue?.type === QuoteIssueType.QUANTITY_EXCEEDED
  );
}
