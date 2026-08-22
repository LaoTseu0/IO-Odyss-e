import { describe, expect, it } from "vitest";
import { parseStages } from "../domain/stage";
import { stages } from "./stages";

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

  it("associates the attention chapter with its entity explicitly", () => {
    expect(stages.find((stage) => stage.id === "attention")).toMatchObject({
      entityId: "attention",
      ioLabel: "CONTEXTE PONDÉRÉ",
    });
  });

  it("rejects invalid or duplicated content before it reaches the interface", () => {
    expect(() => parseStages([])).toThrow("au moins un chapitre");
    expect(() => parseStages([{ ...stages[0], accent: "turquoise" }])).toThrow("#RRGGBB");
    expect(() => parseStages([stages[0], stages[0]])).toThrow("plusieurs fois");
  });
});
