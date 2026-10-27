const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// 29 Jul, 2026, as in the Figma receipt
export function formatShortDate(value: string) {
  const date = new Date(value);

  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}
