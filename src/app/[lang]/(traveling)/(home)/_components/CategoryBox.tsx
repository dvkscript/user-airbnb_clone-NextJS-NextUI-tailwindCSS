'use client';
import Image from '@/components/Common/Image';
import Translate from '@/components/Common/Translate';
import { cn } from '@/utils/dom.util';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

interface CategoryBoxProps {
  image: string,
  label: string;
  selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  image,
  label,
  selected,
}) => {
  const searchParams = useSearchParams();
  const query = useMemo(() => {
    const q = new URLSearchParams(searchParams);
    q.set("structure", label);
    q.set("page", "1");
    return q.toString();
  }, [searchParams, label])

  return (
    <Link
      href={{ query }}
      className={cn(
        `flex flex-col items-center justify-center gap-2`,
        `py-[0.625rem] border-b-2 transition-colors cursor-pointer select-none z-0`,
        selected ? 'border-b-neutral-800' : 'border-transparent hover:border-b-neutral-400',
        selected ? 'opacity-100' : 'opacity-[0.7] hover:opacity-100'
      )}
    >
      <Image
        src={image}
        alt={label}
        className='dark:invert'
        defaultUrl='/images/not-found.jpg'
        radius='none'
        classNames={{
          img: "w-[24px] h-[24px] m-1",
          wrapper: "rounded-full w-[30px] h-[30px] flex justify-center items-center"
        }}
      />
      <Translate isTrans isExcLocaleSystem={false} className="text-[0.75rem] font-medium text-nowrap rounded-md">
        {label}
      </Translate>
    </Link>
  );
}

export default CategoryBox;