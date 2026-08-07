import { create } from "zustand";

interface WalletState {
  balance: number; // Valor em reais R$
  ratePerMinute: number;
  isTickerRunning: boolean;
  setBalance: (balance: number) => void;
  setRatePerMinute: (rate: number) => void;
  startTicker: () => void;
  stopTicker: () => void;
  decrementOptimistic: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 50.0,
  ratePerMinute: 2.5,
  isTickerRunning: false,
  setBalance: (balance) => set({ balance }),
  setRatePerMinute: (ratePerMinute) => set({ ratePerMinute }),
  startTicker: () => set({ isTickerRunning: true }),
  stopTicker: () => set({ isTickerRunning: false }),
  decrementOptimistic: () =>
    set((state) => ({
      balance: Math.max(0, state.balance - state.ratePerMinute / 60),
    })),
}));
