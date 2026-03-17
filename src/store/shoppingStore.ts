import { create } from 'zustand'
import type { ShoppingItem } from '../types/FoodItem'

interface ShoppingState {
  items: ShoppingItem[]
  setItems: (items: ShoppingItem[]) => void
  addItem: (item: ShoppingItem) => void
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void
  removeItem: (id: string) => void
}

export const useShoppingStore = create<ShoppingState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}))
