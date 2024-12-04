'use client'

import { useState } from "react";
import { useModal } from "@/hooks/use-modal-store";

const CreateDMModal = () => {
    const {isOpen, onClose} = useModal();

    return (
        <div>
            Hi there
        </div>
    )
}

export default CreateDMModal;