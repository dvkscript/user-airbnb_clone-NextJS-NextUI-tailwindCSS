"use client"
import { locationSelector } from '@/hooks/selectors/systemSelector';
import useSystemStore from '@/hooks/useSystemStore';
import { LocaleSystem } from '@/libs/dictionary.lib';
import { cn } from '@/utils/dom.util';
import { As } from '@nextui-org/react';
import { useParams } from 'next/navigation';
import React, { ReactNode } from 'react';

interface TranslateProps {
  children: ReactNode;
  isTrans?: boolean;
  as?: As<any>;
  className?: string;
  isExcLocaleSystem?: boolean;
  style?: HTMLElement["style"]
}

const Translate: React.FC<TranslateProps> = ({
  children,
  isTrans = false,
  as: Component = "div",
  className,
  isExcLocaleSystem = true,
  style
}) => {
  const { localeSystems } = useSystemStore(locationSelector);
  const lang = useParams()?.lang;

  return (
    <Component
      className={cn(
        isTrans && (!isExcLocaleSystem || !localeSystems.includes(lang as LocaleSystem)) ? "translate" : 'notranslate', className,
      )}
      style={style}
    >
      {children}
    </Component>
  );
};

export default Translate;