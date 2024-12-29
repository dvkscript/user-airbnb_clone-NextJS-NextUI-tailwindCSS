"use client"
import { Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from '@nextui-org/react'
import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Icons from "@/components/Common/Icons";
import { ImageType } from "@/enum/image";
import { cn } from "@/utils/dom.util";
import Image from "@/components/Common/Image";
import { UploadPhoto, uploadPhoto } from "@/services/photo.service";
import useToast from "@/hooks/useToast";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import Translate from "@/components/Common/Translate";
import { ResponseUtil } from "@/utils/response.util";
import Button from '../Button';

type ModalUploadProps = Omit<ModalProps, "children"> & {
    onUpload?: (data: ResponseUtil<UploadPhoto | null>) => Promise<void>;
    onFileChange?: (files: File[]) => void;
    fileName: string;
};

const ImageItem = ({ file, onDelete, isDisabled }: { file: File, onDelete: () => void, isDisabled: boolean }) => {
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (!url) {
            setUrl(URL.createObjectURL(file));
        }
        return () => {
            if (url)
                URL.revokeObjectURL(url)
        }
    }, [url, file]);

    return (
        <div key={file.lastModified} className={'text-center relative'}>
            <Image
                src={url}
                alt={file.name}
                height={252}
                radius={"md"}
                classNames={{
                    wrapper: "inline-block"
                }}
                className={"max-w-full"}
                isLoading={!(!!url)}
            />
            <Button
                className={cn(
                    "absolute top-3 right-3 size-8 z-10 bg-default-900 text-default-50",
                    isDisabled && "opacity-50"
                )}
                isIconOnly
                radius="full"
                size={"sm"}
                onPress={onDelete}
                isDisabled={isDisabled}
            >
                <Trash2 size={20} />
            </Button>
        </div>
    )
}

const ModalUpload: FC<ModalUploadProps> = ({
    onClose,
    onUpload,
    isOpen,
    onFileChange,
    fileName,
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDrag, setIsDrag] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toastRes } = useToast();
    const {
        t,
        d
    } = useDictionary<"common", Dictionary["common"]["modal"]["upload photos"]>("common", d => d.modal["upload photos"]);
    
    const handleDeleteFile = useCallback((file: File) => {
        const values = files.filter(f => f.lastModified !== file.lastModified);
        setFiles(values);
        if (onFileChange) onFileChange(values);
    }, [files, onFileChange])

    const handleFileChange = useCallback((filesEvent: FileList) => {
        if (filesEvent.length < 1) return;
        const values = [
            ...files,
            ...Object.values(filesEvent)
        ]
        setFiles(values);
        if (onFileChange) onFileChange(values);
        if (inputRef.current) {
            const input = inputRef.current as HTMLInputElement;
            input.value = '';
            input.files = null;
        }
    }, [inputRef, files, onFileChange])

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files) handleFileChange(files);
    }, [handleFileChange]);

    const handlePaste = useCallback((e: ClipboardEvent) => {
        e.preventDefault();
        const files = e.clipboardData?.files;
        if (files) handleFileChange(files);
    }, [handleFileChange]);

    const handleUpload = useCallback(async () => {
        setIsLoading(true)
        const formData = new FormData();
        files.forEach((file) => {
            formData.append(fileName, file)
        });
        const result = await uploadPhoto(formData);
        if (!result.ok) {
            toastRes(result)
        }
        if (onUpload) await onUpload(result);
        setIsLoading(false)
    }, [files, toastRes, onUpload, fileName]);

    useEffect(() => {
        if (!isOpen) {
            setFiles([])
        }
    }, [isOpen]);

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => {
            window.removeEventListener("paste", handlePaste)
        }
    }, [handlePaste]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                classNames={{
                    wrapper: "overflow-hidden",
                    body: "pt-6 px-6 pb-6",
                    base: "dark:bg-default-100",
                }}
                hideCloseButton
                onClose={onClose}
                size={"xl"}
                scrollBehavior={"inside"}
                {...props}
            >
                <Translate isTrans isExcLocaleSystem>
                    <ModalContent className='h-auto '>
                        <ModalHeader className={"justify-between items-center p-3"}>
                            <Button
                                isIconOnly
                                size={"md"}
                                variant={"light"}
                                radius={"full"}
                                className={"size-8"}
                                onPress={onClose}
                            >
                                <X size={16} />
                            </Button>
                            <div className={'text-center'}>
                                <span className={"block text-base leading-1"}>
                                    {t("title")}
                                </span>
                                <span className={"block text-[12px] leading-4 font-normal"}>
                                    {files.length === 0 ? t("description_no_selected") : t("description_selected", files.length.toString())}
                                </span>
                            </div>
                            <Button
                                isIconOnly
                                size={"md"}
                                variant={"light"}
                                radius={"full"}
                                className={"size-8"}
                                onPress={() => {
                                    if (inputRef.current) {
                                        inputRef.current.click();
                                    }
                                }}
                            >
                                <Plus size={16} />
                            </Button>
                        </ModalHeader>
                        <ModalBody>
                            {
                                files.length === 0 ? (
                                    <div
                                        className={cn(
                                            'w-full h-[272px] border-2 gap-3 border-default-500 border-dashed rounded-lg flex flex-col items-center justify-center transition-[border_background]',
                                            isDrag && "border-danger-900 bg-default-100"
                                        )}
                                        onDragOver={() => {
                                            setIsDrag(true)
                                        }}
                                        onDragLeave={() => {
                                            setIsDrag(false)
                                        }}
                                        onDrop={(e) => {
                                            setIsDrag(false);
                                            const files = e.dataTransfer.files;
                                            if (files) handleFileChange(files);
                                        }}
                                    >
                                        <Icons.images height={64} width={64} />
                                        <span className={'font-semibold'}>
                                            {t("content1")}
                                        </span>
                                        <span className={'leading-4'}>
                                            {t("content2")}
                                        </span>

                                        <Button
                                            color={"default"}
                                            onPress={() => {
                                                if (inputRef.current) {
                                                    inputRef.current.click();
                                                }
                                            }}
                                            className={"bg-default-900 text-default-50"}
                                        >
                                            {d?.buttons.browser}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className={"grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5"}>
                                        {files.map((file) => (
                                            <ImageItem key={file.lastModified} file={file}
                                                onDelete={() => handleDeleteFile(file)} isDisabled={isLoading} />
                                        ))}
                                    </div>
                                )
                            }

                        </ModalBody>
                        <Divider />
                        <ModalFooter className='py-4 px-6'>
                            <Button
                                type={"button"}
                                variant={"light"}
                                className={'mr-auto px-0'}
                                size={"lg"}
                                onPress={onClose}

                            >
                                {d?.buttons.done}
                            </Button>
                            <Button
                                type={"button"}
                                color={"secondary"}
                                size={"lg"}
                                className={cn(
                                    isLoading && "bg-default-400"
                                )}
                                onPress={handleUpload}
                                isLoading={isLoading}
                                isDisabled={files.length < 1}
                                translate='no'
                            >
                                {
                                    !isLoading && (
                                        <Translate as={"span"} isExcLocaleSystem isTrans>
                                            {d?.buttons.upload}
                                        </Translate>
                                    )
                                }
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Translate>
            </Modal>
            <input
                type={"file"}
                ref={inputRef}
                multiple
                accept={Object.values(ImageType).map(i => `.${i}`).join(", ")}
                onChange={handleInputChange}
                hidden
            />
        </>
    )
}

export default ModalUpload