const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/;

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

export function isUsername(value: unknown): value is string {
  return typeof value === 'string' && USERNAME_PATTERN.test(value);
}

export function isStrongPassword(value: unknown): value is string {
  return (
    typeof value === 'string' && value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value)
  );
}

export function isFilled(value: unknown, max = 60): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

export async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return {};
  }
}
