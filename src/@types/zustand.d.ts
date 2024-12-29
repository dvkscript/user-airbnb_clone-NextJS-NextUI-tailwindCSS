declare module "zustand/type" {
    type Selector<S, T> = (s: S) => T;

    type UseStore<S> = <T>(selector: Selector<S, T>) => T;

    type Set<T extends Record<string, any>> = (values: Partial<T>) => void
}
