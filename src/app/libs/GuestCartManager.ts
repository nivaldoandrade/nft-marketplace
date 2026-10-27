export class GuestCartManager {
  private static KEY = '@kurio:guest-cart-id';

  static save(cartId: string) {
    try {
      localStorage.setItem(this.KEY, cartId);
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
