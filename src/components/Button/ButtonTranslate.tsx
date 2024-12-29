import useModal from '@/hooks/useModal';
import { Button, ButtonProps } from '@nextui-org/react';
import { TLanguageCode } from 'countries-list';
import { useParams } from 'next/navigation';
import React from 'react';

interface ButtonTranslateProps extends Omit<ButtonProps, "onPress"> {
    langValue: TLanguageCode;
}

const ButtonTranslate: React.FC<ButtonTranslateProps> = ({ children, langValue, ...rest }) => {
    const params = useParams();
    const { onClose } = useModal()

    let timeoutId: NodeJS.Timeout | null = null;

    const handleLangSelect = async (lang: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (params.lang === lang) return;
        onClose();
        timeoutId = setTimeout(() => {
            window.location.href = `/${lang}${window.location.search}`;
        }, 100);
    };

    return (
        <Button onPress={() => handleLangSelect(langValue)} {...rest} >
            {children}
        </Button>
    );
};

export default ButtonTranslate;