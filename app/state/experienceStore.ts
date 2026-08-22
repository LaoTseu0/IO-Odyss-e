import { create } from "zustand";
import { stages } from "../content/stages";
import { clampStageIndex } from "../domain/journey";

type AttentionMode = "river" | "money";

type ExperienceState = {
  progress: number;
  activeStage: number;
  attentionMode: AttentionMode;
  reducedMotion: boolean;
  setJourney: (progress: number, activeStage: number) => void;
  setAttentionMode: (mode: AttentionMode) => void;
  setReducedMotion: (reduced: boolean) => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  progress: 0,
  activeStage: 0,
  attentionMode: "river",
  reducedMotion: false,
  setJourney: (progress, activeStage) => set({
    progress: Math.min(1, Math.max(0, progress)),
    activeStage: clampStageIndex(activeStage, stages.length),
  }),
  setAttentionMode: (attentionMode) => set({ attentionMode }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
