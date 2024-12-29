'use client';
import { useSearchParams } from 'next/navigation';
import HeaderStructureBox from "./CategoryBox";
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@nextui-org/react';
import useWindowEvent from '@/hooks/useWindowEvent';
import Container from '@/components/Common/Container';
import { GetStructureAndCountAll } from '@/services/structure.service';
import { cn } from '@/utils/dom.util';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BreakpointConfig from '@/configs/breakpoints.config';

interface CategoriesProps {
  structures: GetStructureAndCountAll["rows"];
}

const Categories: FC<CategoriesProps> = ({
  structures
}) => {

  const search = useSearchParams();
  const structure = search?.get('structure');
  const drawerOpen = JSON.parse(search.get("drawer_open") ?? "false");

  const structureContainerRef = useRef<HTMLDivElement>(null);

  const { isScroll, screen } = useWindowEvent()

  const [isActive, setIsActive] = useState(false);

  const isSelected = useCallback((value: string) => {
    if (!structure) return false;
    return value.toLowerCase() === structure.toLowerCase();
  }, [structure]);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScrollLeft, setMaxScrollLeft] = useState(0);

  const handleScrollBtn = useCallback((direction: "ArrowRight" | "ArrowLeft") => {
    const structureContainer = structureContainerRef.current as HTMLDivElement;
    if (!structureContainer) return;
    const width = structureContainer.clientWidth * 1;

    structureContainer.scrollBy({
      left: direction === "ArrowRight" ? width : -width,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    const structureContainer = structureContainerRef.current as HTMLDivElement;
    if (!structure || !Categories || !structureContainer) return;

    const structureIndex = structures.findIndex((s) => s.name.toLowerCase() === structure.toLowerCase());
    if (structureIndex === -1) return;

    const CategoriesEl = Array.from(structureContainer.children);
    const structureEl = CategoriesEl[structureIndex] as HTMLElement | undefined;
    if (!structureEl) return;

    const offsetLeft = structureEl.offsetLeft;
    const structureContainerCenter = structureContainer.clientWidth / 2;
    const structureCenter = structureEl.offsetWidth / 2;
    const targetScrollLeft = offsetLeft - structureContainerCenter + structureCenter;

    structureContainer.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth"
    })
  }, [structures, structure])

  useEffect(() => {
    const structureContainer = structureContainerRef.current as HTMLDivElement;
    if (!structureContainer) return;

    const maxScrollLeft = structureContainer.scrollWidth - structureContainer.clientWidth;

    setMaxScrollLeft(maxScrollLeft)

    const handleScroll = () => {
      setScrollLeft(structureContainer.scrollLeft)
    };

    structureContainer.addEventListener("scroll", handleScroll);

    return () => {
      structureContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (drawerOpen) return setIsActive(true);
    setIsActive(isScroll)
  }, [isScroll, drawerOpen]);

  return (
    <div
      className={cn(
        "w-full z-40 sticky bg-inherit transition-[top] pt-0 top-[87px] flex-shrink-0",
        "after:content-[''] after:md:block after:hidden after:absolute after:bottom-full after:h-full after:w-full after:bg-inherit after:-z-10",
        (isActive || drawerOpen || (screen && screen.minWidth <= BreakpointConfig.md.minWidth)) && "shadow-lg",
        !drawerOpen && "md:pt-3",
        isActive ? "md:top-[calc(80px-12px)]" : "md:top-[168px]"
      )}
    >
      <Container>
        <div
          className={cn(
            'relative overflow-hidden',
          )}
        >
          <div
            className={`py-0 flex justify-start items-center gap-x-8 overflow-hidden snap-mandatory snap-x outline-none`}
            tabIndex={-1}
            ref={structureContainerRef}
          >
            {
              structures.map((structure) => (
                <HeaderStructureBox
                  key={structure.id}
                  label={structure.name}
                  image={structure.photo}
                  selected={isSelected(structure.name)}
                />
              ))
            }
          </div>
          <div
            className={cn(
              'absolute top-0 left-0 h-full pr-5 flex justify-start items-center pl-1',
              "transition-opacity",
              scrollLeft === 0 ? "opacity-0 invisible" : "opacity-100 visible"
            )}
          >
            <Button
              className={cn(
                'bg-default-50 hover:opacity-100',
                "shadow-[0_0_15px_2rem] shadow-white dark:shadow-default-100 hover:scale-[1.1]",
              )}
              radius='full'
              disableRipple
              variant='bordered'
              isIconOnly
              size="sm"
              onPress={() => handleScrollBtn("ArrowLeft")}
            >
              <ChevronLeft className='text-lg text-default-500' size={18} strokeWidth={3} />
            </Button>
          </div>
          <div
            className={cn(
              'absolute top-0 right-0 h-full pl-5 flex justify-end items-center pr-1',
              "transition-opacity",
              scrollLeft >= maxScrollLeft ? "opacity-0 invisible" : "opacity-100 visible"
            )}
          >
            <Button
              className={cn(
                'bg-default-50 hover:opacity-100',
                "shadow-[0_0_15px_2rem] shadow-white dark:shadow-default-100 hover:scale-[1.1]",
              )}
              radius='full'
              disableRipple
              variant='bordered'
              isIconOnly
              size="sm"
              onPress={() => handleScrollBtn("ArrowRight")}
            >
              <ChevronRight className='text-lg text-default-500' size={18} strokeWidth={3} />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Categories;