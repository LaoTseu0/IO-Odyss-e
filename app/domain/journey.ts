export const HORIZONTAL_SPACING = 5.2;

export function clampStageIndex(index: number, stageCount: number) {
  return Math.min(Math.max(0, stageCount - 1), Math.max(0, index));
}

export function getJourneyX(progress: number, stageCount: number) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return clampedProgress * Math.max(0, stageCount - 1) * HORIZONTAL_SPACING;
}
