import type { CheckoutSchema } from '@/ui/pages/checkout/schema';

export type CheckoutDraft = {
  userId: string;
  walletId: string;
  values: CheckoutSchema;
};

const KEY = '@kurio:checkout-draft';

// keeps the form when the session expires mid-checkout, so the purchase resumes after signing in
export const checkoutDraft = {
  read(userId: string): CheckoutDraft | null {
    try {
      const draft = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as CheckoutDraft | null;

      return draft?.userId === userId ? draft : null;
    } catch {
      return null;
    }
  },

  save(draft: CheckoutDraft) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      // storage unavailable
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // storage unavailable
    }
  },
};
