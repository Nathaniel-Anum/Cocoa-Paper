import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      showToolbar: true,
      setShowToolbar: (value) => set({ showToolbar: value }),
      chosenRecord: null,
      setChosenRecord: (value) => set({ chosenRecord: value }),
      openFileViewer: false,
      setOpenFileViewer: () =>
        set((state) => ({ openFileViewer: !state.openFileViewer })),
      
      // New document notifications
      newDocuments: [],
      addNewDocument: (doc) => set((state) => {
        // Avoid duplicates
        const exists = state.newDocuments.some(d => d.subject === doc.subject && d.sentBy === doc.sentBy);
        if (exists) return state;
        return { newDocuments: [{ ...doc, id: Date.now(), receivedAt: new Date().toISOString() }, ...state.newDocuments] };
      }),
      removeNewDocument: (id) => set((state) => ({
        newDocuments: state.newDocuments.filter(d => d.id !== id)
      })),
      clearNewDocuments: () => set({ newDocuments: [] }),
    }),
    {
      name: 'document-location',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        showToolbar: state.showToolbar,
        chosenRecord: state.chosenRecord,
        newDocuments: state.newDocuments,
      }),
    }
  )
);

export default useStore;
