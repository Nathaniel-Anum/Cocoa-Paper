import { create } from 'zustand';

const useStore = create((set) => ({
  location: null,
  setLocation: (value) => set({ location: value }),
  chosenRecord: null,
  setChosenRecord: (value) => set({ chosenRecord: value }),
  openFileViewer: false,
  setOpenFileViewer: () =>
    set((state) => ({ openFileViewer: !state.openFileViewer })),
}));

export default useStore;
