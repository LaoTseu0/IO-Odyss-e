import { beforeEach, describe, expect, it } from "vitest";
import { getJourneyX, HORIZONTAL_SPACING } from "./journey";
import { stages } from "./stages";
import { useExperienceStore } from "./store";

describe("journey content", () => {
  it("keeps stable, unique and ordered chapter identifiers", () => {
    expect(stages).toHaveLength(8);
    expect(new Set(stages.map((stage) => stage.id)).size).toBe(stages.length);
    expect(stages.map((stage) => stage.index)).toEqual(["00", "01", "02", "03", "04", "05", "06", "07"]);
  });

  it("gives every chapter enough content to render all three learning layers", () => {
    for (const stage of stages) {
      expect(stage.title.length).toBeGreaterThan(3);
      expect(stage.body.length).toBeGreaterThan(60);
      expect(stage.insight.length).toBeGreaterThan(40);
      expect(stage.payload.length).toBeGreaterThanOrEqual(3);
      expect(stage.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("keeps the attention laboratory at the expected narrative anchor", () => {
    expect(stages[2]).toMatchObject({ id: "attention", ioLabel: "CONTEXTE PONDÉRÉ" });
  });
});

describe("experience store", () => {
  beforeEach(() => {
    useExperienceStore.setState({ progress: 0, activeStage: 0, attentionMode: "river", reducedMotion: false });
  });

  it("clamps externally supplied journey positions", () => {
    useExperienceStore.getState().setJourney(1.4, 12);
    expect(useExperienceStore.getState()).toMatchObject({ progress: 1, activeStage: 7 });

    useExperienceStore.getState().setJourney(-0.2, -3);
    expect(useExperienceStore.getState()).toMatchObject({ progress: 0, activeStage: 0 });
  });

  it("switches the causal attention context", () => {
    useExperienceStore.getState().setAttentionMode("money");
    expect(useExperienceStore.getState().attentionMode).toBe("money");
  });
});

describe("horizontal journey", () => {
  it("maps a stopped scroll position to one deterministic coordinate", () => {
    const position = getJourneyX(0.42, stages.length);
    expect(getJourneyX(0.42, stages.length)).toBe(position);
    expect(position).toBe(0.42 * 7 * HORIZONTAL_SPACING);
  });

  it("only moves forward when scroll progress increases", () => {
    const samples = [0, 0.2, 0.5, 0.8, 1].map((progress) => getJourneyX(progress, stages.length));
    expect(samples).toEqual([...samples].sort((left, right) => left - right));
  });
});
