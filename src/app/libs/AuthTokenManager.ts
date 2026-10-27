export class AuthTokenManager {
  private static KEY = '@kurio:access-token';

  static save(accessToken: string) {
    try {
      localStorage.setItem(this.KEY, accessToken);
    } catch {
      // storage unavailable
    }
  }

  static get(): string | null {
    try {
      return localStorage.getItem(this.KEY);
    } catch {
      return null;
    }
  }

  static remove() {
    try {
      localStorage.removeItem(this.KEY);
    } catch {
      // storage unavailable
    }
  }
}
