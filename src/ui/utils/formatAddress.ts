// 0xA91F3c…E82C → 0xA91F…E82C, as in the Figma
export function formatAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}
