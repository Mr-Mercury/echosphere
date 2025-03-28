import { create } from 'zustand'

interface BotToggleStore {
  isTogglingAny: boolean
  setIsTogglingAny: (isToggling: boolean) => void
}

export const useBotToggleStore = create<BotToggleStore>((set) => ({
  isTogglingAny: false,
  setIsTogglingAny: (isToggling) => set({ isTogglingAny: isToggling }),
})) 