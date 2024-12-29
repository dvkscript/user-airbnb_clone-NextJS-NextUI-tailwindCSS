"use client"
import SwitchTheme from '@/components/Switcher/SwitchTheme';
import { ModalMode } from '@/enum/modalMode';
import useModal from '@/hooks/useModal';
import { Button, ButtonGroup } from '@nextui-org/react';
import { Earth } from 'lucide-react';
import { useRouter } from 'next-nprogress-bar';
import React, { useCallback } from 'react';
import { loaderSelector } from '@/hooks/selectors/systemSelector';
import useUserStore from '@/hooks/useUserStore';
import { profileSelector } from '@/hooks/selectors/userSelector';
import useSystemStore from '@/hooks/useSystemStore';

const HeaderButtonGroup = ({ }) => {
  const { onModal } = useModal();
  const { push } = useRouter();
  const { profile } = useUserStore(profileSelector);
  const { isLoaded } = useSystemStore(loaderSelector);

  const handleModalLanguage = () => {
    onModal({
      mode: ModalMode.LANGUAGE
    })
  }

  const handleToHosting = useCallback(() => {
    if (profile) {
      push("/hosting")
    } else {
      onModal({
        mode: ModalMode.AUTH_SIGN_IN
      })
    }
  }, [
    profile,
    push,
    onModal,
  ]);
 
  return (
    <ButtonGroup color='default'>
      <Button
        variant='light'
        className="font-semibold"
        onPress={handleToHosting}
        radius='full'
        isDisabled={!isLoaded}
      >
        Switch to hosting
      </Button>
      <Button
        variant="light"
        isIconOnly
        radius='full'
        onPress={handleModalLanguage}
        isDisabled={!isLoaded}
      >
        <Earth size={25} className='text-default-600' />
      </Button>
      <SwitchTheme />
    </ButtonGroup>
  );
};

export default HeaderButtonGroup;