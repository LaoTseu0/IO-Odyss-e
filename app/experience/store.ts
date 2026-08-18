import { create } from "zustand";

type ExperienceState = {
  progress: number;
  activeStage: number;
  attentionMode: "river" | "money";
  reducedMotion: boolean;
  setJourney: (progress: number, activeStage: number) => void;
  setAttentionMode: (mode: "river" | "money") => void;
  setReducedMotion: (reduced: boolean) => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  progress: 0,
  activeStage: 0,
  attentionMode: "river",
  reducedMotion: false,
  setJourney: (progress, activeStage) => set({
    progress: Math.min(1, Math.max(0, progress)),
    activeStage: Math.min(7, Math.max(0, activeStage)),
  }),
  setAttentionMode: (attentionMode) => set({ attentionMode }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
