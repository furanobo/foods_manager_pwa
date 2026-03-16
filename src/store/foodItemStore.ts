import { create } from 'zustand'
import type { FoodItem } from '../types/FoodItem'

interface FoodItemState {
  items: FoodItem[]
  setItems: (items: FoodItem[]) => void
  addItem: (item: FoodItem) => void
  updateItem: (id: string, updates: Partial<FoodItem>) => void
  removeItem: (id: string) => void
  getCategoryGroups: () => Record<string, FoodItem[]>
}

export const useFoodItemStore = create<FoodItemState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  getCategoryGroups: () => {
    const { items } = get()
    return items.reduce<Record<string, FoodItem[]>>((groups, item) => {
      const cat = item.category || 'その他'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
      return groups
    }, {})
  },
}))
