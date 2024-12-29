"use client"
import ModalAuth from '@/components/Modal/ModalAuth';
import ModalConfirm from '@/components/Modal/ModalConfirm';
import ModalLanguage from '@/components/Modal/ModalLanguage';
import LocalStorageConfig from '@/configs/localstorage.config';
import { ModalMode } from '@/enum/modalMode';
import useModal from '@/hooks/useModal';
import React, { useEffect } from 'react';

interface DefaultProps {
  children: React.ReactNode
}

const Default: React.FC<DefaultProps> = ({ }) => {
  const { mode, onModal } = useModal();

  useEffect(() => {
    let timeOut: NodeJS.Timeout | null = null;
    if (timeOut) {
      clearTimeout(timeOut);
    }
    timeOut = setTimeout(() => {
      if (localStorage.getItem(LocalStorageConfig.navigateAuth.name) === LocalStorageConfig.navigateAuth.values.true) {
        onModal({
          mode: ModalMode.AUTH_SIGN_IN
        });
        localStorage.removeItem(LocalStorageConfig.navigateAuth.name);
      }
    }, 300);
    return () => {
      if (timeOut) clearTimeout(timeOut);
    }
  }, [
    mode,
    onModal
  ]);

  switch (mode) {
    case ModalMode.AUTH_SIGN_IN:
    case ModalMode.AUTH_SIGN_UP:
      return <ModalAuth />
    case ModalMode.CONFIRM:
      return <ModalConfirm />
    case ModalMode.LANGUAGE:
      return <ModalLanguage />
    default:
      return null;
  }
};

export default Default;