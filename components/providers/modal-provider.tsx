'use client'

import CreateServerModal from "../modal-dialog/create-server-modal";
import { useState, useEffect } from "react";
import InviteServerModal from "../modal-dialog/invite-server-modal";
import ServerSettingsModal from "../modal-dialog/server-settings-modal";
import MembersModal from "../modal-dialog/members-modal";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState('false');

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
        </>
    )
}