'use client'

import CreateServerModal from "../modal-dialog/servers/create-server-modal";
import CreateChannelModal from "../modal-dialog/channels/create-channel-modal";
import { useState, useEffect } from "react";
import InviteServerModal from "../modal-dialog/servers/invite-server-modal";
import ServerSettingsModal from "../modal-dialog/servers/server-settings-modal";
import CreateTemplateModal from "../modal-dialog/template/create-template-modal";
import MembersModal from "../modal-dialog/members-modal";
import LeaveServerModal from "../modal-dialog/servers/leave-server-modal";
import DeleteServerModal from "../modal-dialog/servers/delete-server-modal";
import DeleteChannelModal from "../modal-dialog/channels/delete-channel-modal";
import EditChannelModal from "../modal-dialog/channels/edit-channel-modal";
import MessageFileModal from "../modal-dialog/message-file-modal";
import CreateDMModal from "../modal-dialog/chat-bots/create-dm-modal";
import CreateServerBotModal from "../modal-dialog/chat-bots/create-srv-bot-modal";
import EditBotModal from "../modal-dialog/chat-bots/edit-bot-modal";
import CopyBotModal from "../modal-dialog/chat-bots/copy-bot-modal";
import DeleteBotConfirmationModal from "../modal-dialog/chat-bots/delete-bot-confirmation-modal";
import { useModal } from "@/hooks/use-modal-store";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState('false');
    const { data } = useModal();

    useEffect( () => {
        setIsMounted('true');

    }, []);

    //Hydration fix...TODO: Figure out if there's a better method
    // This has to do with SSR, can cause hydration errors since the thing can open
    // on either side and that causes a mismatch....

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <CreateServerModal />
            <InviteServerModal />
            <ServerSettingsModal />
            <MembersModal />
            <CreateChannelModal />
            <LeaveServerModal />
            <DeleteServerModal />
            <DeleteChannelModal />
            <EditChannelModal />
            <MessageFileModal />
            <CreateDMModal />
            <CreateServerBotModal data={data}/>
            <EditBotModal />
            <CopyBotModal />
            <CreateTemplateModal />
            <DeleteBotConfirmationModal />
        </>
    )   
}