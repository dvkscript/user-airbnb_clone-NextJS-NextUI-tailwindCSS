"use client"
import React from 'react';
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import useUrl from '@/hooks/useUrl';
import LocalStorageConfig from '@/configs/localstorage.config';


const Page = ({ }) => {
    const { pathnames } = useUrl()

    return (
        <Modal
            isOpen={pathnames[1] === "token-expired"}
            onClose={() => {
                window.location.href = "/";
            }}
            classNames={{
                wrapper: "overflow-hidden",
                body: "pt-6 px-6 pb-6",
                closeButton: "hover:bg-white/5 active:bg-white/10",
                base: "dark:bg-default-100"
            }}
        >
            <ModalContent className='h-auto'>
                {(onClose) => (
                    <>
                        <ModalHeader className="pt-3 pb-3 px-5 bg-default-100">
                            Error
                        </ModalHeader>
                        <Divider/>
                        <ModalBody>
                            Your session has expired! Please log in again.
                        </ModalBody>
                        <Divider/>
                        <ModalFooter className='py-3.5 px-5 bg-default-100'>
                            <Button variant="light" radius='full' onPress={onClose}>
                                Back to home page
                            </Button>
                            <Button color="primary" variant='bordered' radius='full' onPress={() => {
                                onClose();
                                localStorage.setItem(LocalStorageConfig.navigateAuth.name, LocalStorageConfig.navigateAuth.values.true)
                            }}>
                                Sign in
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default Page;