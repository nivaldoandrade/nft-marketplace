export function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const initials =
    words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);

  return initials.toUpperCase();
}

export function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0];
}
