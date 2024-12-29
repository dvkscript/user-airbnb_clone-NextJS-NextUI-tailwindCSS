"use client"
import useDictionary from '@/hooks/useDictionary';
import useModal from '@/hooks/useModal'
import { Dictionary } from '@/libs/dictionary.lib';
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import Translate from '../Common/Translate';

const ModalConfirm = () => {
    const { isOpen, title, content, isLoading, onConfirm, confirmText, cannelText, onClose } = useModal();
    const buttonMsg = useDictionary<"common", Dictionary["common"]['buttons']>("common", d => d.buttons).d;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                wrapper: "overflow-hidden",
                body: "pt-6 px-6 pb-6",
                closeButton: "hover:bg-white/5 active:bg-white/10",
                base: "dark:bg-default-100"
            }}
            size='lg'
        >
            <Translate isExcLocaleSystem isTrans>
                <ModalContent className='h-auto'>
                    {(onClose) => (
                        <>
                            <ModalHeader className="pt-3 pb-3 px-5 bg-default-100">
                                {title}
                            </ModalHeader>
                            <Divider/>
                            <ModalBody>
                                {content}
                            </ModalBody>
                            <Divider/>
                            <ModalFooter className='py-3.5 px-5 bg-default-100'>
                                <Button variant="light" radius='md' onPress={onClose}>
                                    {cannelText || buttonMsg?.Cancel}
                                </Button>
                                <Button color="secondary" radius='md' onPress={onConfirm} isLoading={isLoading}>
                                    {confirmText || buttonMsg?.Ok}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Translate>
        </Modal>
    )
}

export default ModalConfirm