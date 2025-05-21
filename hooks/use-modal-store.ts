import { ServerWithMembersAndProfiles } from '@/lib/entities/servers';
import { Channel, ChannelType, Server, User } from '@prisma/client';
// TODO: Prisma build lol
import { create } from 'zustand';

export type ModalType = 'createServer' | 'invite' | 'editServer' | 
'members' | 'createChannel' | 'leaveServer' | 'deleteServer' | 'deleteChannel' 
| 'editChannel' | 'messageFile' | 'createDM' | 'createServerBot' | 'editBot' | 'copyBot' | 'createTemplate' | 'deleteBot' | 'createServerTemplate';

interface ModalData {
    server?: ServerWithMembersAndProfiles;
    channelType?: ChannelType;
    channel?: Channel;
    apiUrl?: string;
    query?: Record<string, any>;
    // bot?: PersonalBot;
    botUser?: User;
    templateId?: string;
    member?: any;
    userId?: string;
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