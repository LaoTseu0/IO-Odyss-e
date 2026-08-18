export const HORIZONTAL_SPACING = 5.2;

export function getJourneyX(progress: number, stageCount: number) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return clampedProgress * Math.max(0, stageCount - 1) * HORIZONTAL_SPACING;
}
