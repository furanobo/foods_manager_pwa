import { create } from 'zustand'
import type { Settings } from '../types/FoodItem'

interface SettingState {
  settings: Settings
  setSettings: (settings: Settings) => void
}

export const useSettingStore = create<SettingState>((set) => ({
  settings: {
    noticeFlag: false,
    noticeTime: '09:00',
  },
  setSettings: (settings) => set({ settings }),
}))
