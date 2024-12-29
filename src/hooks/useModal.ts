import { create } from 'zustand'
import { ReactNode } from 'react';
import { ModalMode } from '@/enum/modalMode';

interface ModalValueTypes {
    isOpen: boolean;
    isLoading: boolean;
    title: ReactNode;
    content: ReactNode;
    mode: string;
    cannelText: string;
    confirmText: string;
    onConfirm: () => void;
    data: any | null;
};

type StateTypes = ModalValueTypes & {
    setIsLoading: (isLoading: boolean) => void;
    onOpen: () => void;
    onClose: () => void;
    onModal: (values: Partial<ModalValueTypes>) => void
    onReset: () => void
}

const initialStates = {
    isOpen: false,
    title: "Modal",
    content: "",
    isLoading: false,
    onConfirm: () => { },
    mode: ModalMode.CONFIRM,
    cannelText: "",
    confirmText: "",
    data: null,
}

const useModal = create<StateTypes>()((set) => ({
    ...initialStates,
    onOpen: () => {
        set({
            isOpen: true
        })
    },
    onClose: () => {
        set({
            isOpen: false
        })
    },
    onModal: (values) => {
        set({
            ...values,
            isOpen: true,
        });
    },
    onReset: () => {
        set({
            ...initialStates
        });
    },
    setIsLoading: (isLoading) => {
        set({
            isLoading
        });
    }
}))
export default useModal;