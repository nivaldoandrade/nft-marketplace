type CheckoutAttempt = {
  key: string;
  fingerprint: string;
};

// the same payload keeps its idempotency key across retries, timeouts and reloads
export class CheckoutAttemptManager {
  private static KEY = '@kurio:checkout-attempt';

  static getKey(fingerprint: string) {
    const attempt = this.read();

    if (attempt?.fingerprint === fingerprint) {
      return attempt.key;
    }

    const key = crypto.randomUUID();
    this.write({ key, fingerprint });

    return key;
  }

  static clear() {
    try {
      sessionStorage.removeItem(this.KEY);
    } catch {
      // storage unavailable
    }
  }

  private static read(): CheckoutAttempt | null {
    try {
      const stored = sessionStorage.getItem(this.KEY);

      return stored ? (JSON.parse(stored) as CheckoutAttempt) : null;
    } catch {
      return null;
    }
  }

  private static write(attempt: CheckoutAttempt) {
    try {
      sessionStorage.setItem(this.KEY, JSON.stringify(attempt));
    } catch {
      // storage unavailable
    }
  }
}
