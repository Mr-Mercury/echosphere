import { Channel, ChannelType, Server, User } from '@prisma/client';
// TODO: Prisma build lol
import { create } from 'zustand';

export type ModalType = 'createServer' | 'invite' | 'editServer' | 
'members' | 'createChannel' | 'leaveServer' | 'deleteServer' | 'deleteChannel' 
| 'editChannel' | 'messageFile' | 'createDM' | 'createServerBot';

interface ModalData {
    server?: Server;
    channelType?: ChannelType;
    channel?: Channel;
    apiUrl?: string;
    query?: Record<string, any>;
    // bot?: PersonalBot;
    botUser?: User;
}

interface ModalStore {
    type: ModalType | null;
    data: ModalData;
    isOpen: boolean;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
    type: null,
    data: {},
    isOpen: false,
    onOpen: (type, data = {}) => set({isOpen: true, type, data}),
    onClose: () => set({type: null, isOpen: false}),
}))