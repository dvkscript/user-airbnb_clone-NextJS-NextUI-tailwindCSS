import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'

const useUrl = () => {
  const pathname = usePathname();
  const pathnames = useMemo(() => pathname.split("/").filter(p => p), [pathname]);
  const replacePath = useCallback((oldValue: string, newValue: string) => {
    if (!oldValue) return pathname.concat(newValue);
    return pathname.replace(oldValue, newValue)
  }, [pathname]);
  const searchParams = useSearchParams();
  const search = useMemo(() => searchParams.size > 0 ? `?${searchParams.toString()}` : "", [searchParams]);
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  },[searchParams])

  return {
    pathname,
    pathnames,
    replacePath,
    searchParams,
    search,
    searchParamsRef
  }
}

export default useUrl