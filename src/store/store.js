import { create } from 'zustand';

const useStore = create((set) => ({
  chosenRecord: null,
  setChosenRecord: (value) => set({ chosenRecord: value }),
}));

export default useStore;
