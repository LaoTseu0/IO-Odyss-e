import { beforeEach, describe, expect, it } from "vitest";
import { stages } from "../content/stages";
import { useExperienceStore } from "./experienceStore";

describe("experience store", () => {
  beforeEach(() => {
    useExperienceStore.setState({ progress: 0, activeStage: 0, attentionMode: "river", reducedMotion: false });
  });

  it("clamps externally supplied journey positions to the current content", () => {
    useExperienceStore.getState().setJourney(1.4, stages.length + 4);
    expect(useExperienceStore.getState()).toMatchObject({ progress: 1, activeStage: stages.length - 1 });

    useExperienceStore.getState().setJourney(-0.2, -3);
    expect(useExperienceStore.getState()).toMatchObject({ progress: 0, activeStage: 0 });
  });

  it("switches the causal attention context", () => {
    useExperienceStore.getState().setAttentionMode("money");
    expect(useExperienceStore.getState().attentionMode).toBe("money");
  });
});
