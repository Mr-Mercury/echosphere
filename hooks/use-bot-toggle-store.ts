import { create } from 'zustand'

interface BotToggleStore {
  isTogglingAny: boolean
  setIsTogglingAny: (isToggling: boolean) => void
  
  // New fields for tracking bot statuses
  botStatuses: Record<string, boolean>
  setBotStatus: (botId: string, isActive: boolean) => void
  updateServerBots: (serverId: string, isActive: boolean) => void
  serverBotUpdateTimestamp: Record<string, number>
}

export const useBotToggleStore = create<BotToggleStore>((set) => ({
  isTogglingAny: false,
  setIsTogglingAny: (isToggling) => set({ isTogglingAny: isToggling }),
  
  // Bot status tracking
  botStatuses: {},
  serverBotUpdateTimestamp: {},
  
  // Set status for an individual bot
  setBotStatus: (botId: string, isActive: boolean) => 
    set((state) => ({
      botStatuses: {
        ...state.botStatuses,
        [botId]: isActive
      }
    })),
  
  // Update all bots for a server to a specific status
  updateServerBots: (serverId: string, isActive: boolean) =>
    set((state) => ({
      // Use 0 to indicate stopped, current timestamp to indicate started
      serverBotUpdateTimestamp: {
        ...state.serverBotUpdateTimestamp,
        [serverId]: isActive ? Date.now() : 0
      }
    }))
})) 