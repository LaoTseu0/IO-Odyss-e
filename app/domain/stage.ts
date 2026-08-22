export const stageEntityIds = [
  "corpus",
  "vector",
  "attention",
  "transformer",
  "training",
  "alignment",
  "portal",
  "galaxy",
] as const;

export type StageEntityId = (typeof stageEntityIds)[number];

export type Stage = {
  id: string;
  entityId: StageEntityId;
  index: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  insight: string;
  ioLabel: string;
  payload: string[];
  entityLabel: string;
  entityInfo: string;
  accent: string;
};

const stringFields = [
  "id",
  "index",
  "eyebrow",
  "title",
  "subtitle",
  "body",
  "insight",
  "ioLabel",
  "entityLabel",
  "entityInfo",
  "accent",
] as const satisfies readonly (keyof Stage)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStageEntityId(value: unknown): value is StageEntityId {
  return typeof value === "string" && stageEntityIds.some((id) => id === value);
}

function parseStage(value: unknown, position: number): Stage {
  if (!isRecord(value)) {
    throw new Error(`Le chapitre ${position + 1} doit être un objet.`);
  }

  for (const field of stringFields) {
    if (typeof value[field] !== "string" || value[field].length === 0) {
      throw new Error(`Le champ "${field}" du chapitre ${position + 1} doit être une chaîne non vide.`);
    }
  }

  if (!isStageEntityId(value.entityId)) {
    throw new Error(`L'identifiant d'entité du chapitre ${position + 1} est inconnu.`);
  }

  if (!Array.isArray(value.payload) || !value.payload.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`Le payload du chapitre ${position + 1} doit contenir uniquement des chaînes non vides.`);
  }

  if (!/^#[0-9a-f]{6}$/i.test(value.accent as string)) {
    throw new Error(`La couleur du chapitre ${position + 1} doit utiliser le format #RRGGBB.`);
  }

  return value as Stage;
}

export function parseStages(value: unknown): Stage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Le contenu narratif doit contenir au moins un chapitre.");
  }

  const stages = value.map(parseStage);
  const ids = new Set<string>();

  for (const stage of stages) {
    if (ids.has(stage.id)) {
      throw new Error(`L'identifiant de chapitre "${stage.id}" est utilisé plusieurs fois.`);
    }
    ids.add(stage.id);
  }

  return stages;
}
