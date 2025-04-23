import { create } from 'zustand';

const useStore = create((set) => ({
  chosenRecord: null,
  setChosenRecord: (value) => set({ chosenRecord: value }),
  openFileViewer: false,
  setOpenFileViewer: () =>
    set((state) => ({ openFileViewer: !state.openFileViewer })),
}));

export default useStore;
