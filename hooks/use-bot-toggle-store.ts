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
      // We don't update individual bot statuses directly since we don't know
      // which bots belong to this server in the store
      // Instead we just record the timestamp of the server-wide update
      serverBotUpdateTimestamp: {
        ...state.serverBotUpdateTimestamp,
        [serverId]: Date.now()
      }
    }))
})) 