import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  mode: 'debate',
  messages: [],       // [{ id, role, content, mode }]
  loading: false,
  error: null,
  fontSize: 16,
  animSpeed: 1,

  setMode: (mode) => set({ mode, error: null }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
  clearHistory: () => set({ messages: [], error: null }),
  setFontSize: (v) => set({ fontSize: v }),
  setAnimSpeed: (v) => set({ animSpeed: v }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), ...msg }],
    })),
}))
