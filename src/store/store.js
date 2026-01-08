import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      showToolbar: true,
      setShowToolbar: (value) => set({ showToolbar: value }),
      chosenRecord: null,
      setChosenRecord: (value) => set({ chosenRecord: value }),
      openFileViewer: false,
      setOpenFileViewer: () =>
        set((state) => ({ openFileViewer: !state.openFileViewer })),
    }),
    {
      name: 'document-location',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        showToolbar: state.showToolbar,
        chosenRecord: state.chosenRecord,
      }),
    }
  )
);

export default useStore;
