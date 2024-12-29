
import { useStore } from 'zustand'
import { UseStore } from 'zustand/type';
import { systemStore, SystemStore } from './stores/systemStore';
import { useShallow } from 'zustand/shallow';

const useSystemStore: UseStore<SystemStore> = (selector) => {
    const store = useStore(systemStore, useShallow(selector));

    return store
} 

export default useSystemStore;

