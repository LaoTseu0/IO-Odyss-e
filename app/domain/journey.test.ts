import { describe, expect, it } from "vitest";
import { stages } from "../content/stages";
import { clampStageIndex, getJourneyX, HORIZONTAL_SPACING } from "./journey";

describe("horizontal journey", () => {
  it("derives stage bounds from the supplied chapter count", () => {
    expect(clampStageIndex(12, 3)).toBe(2);
    expect(clampStageIndex(-2, 3)).toBe(0);
  });

  it("maps a stopped scroll position to one deterministic coordinate", () => {
    const position = getJourneyX(0.42, stages.length);
    expect(getJourneyX(0.42, stages.length)).toBe(position);
    expect(position).toBe(0.42 * (stages.length - 1) * HORIZONTAL_SPACING);
  });

  it("only moves forward when scroll progress increases", () => {
    const samples = [0, 0.2, 0.5, 0.8, 1].map((progress) => getJourneyX(progress, stages.length));
    expect(samples).toEqual([...samples].sort((left, right) => left - right));
  });
});
