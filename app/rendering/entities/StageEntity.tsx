import type { ComponentType } from "react";
import type { StageEntityId } from "../../domain/stage";
import { AlignmentEntity } from "./AlignmentEntity";
import { AttentionEntity } from "./AttentionEntity";
import { CorpusEntity } from "./CorpusEntity";
import { GalaxyEntity } from "./GalaxyEntity";
import { PortalEntity } from "./PortalEntity";
import { TrainingEntity } from "./TrainingEntity";
import { TransformerEntity } from "./TransformerEntity";
import { VectorEntity } from "./VectorEntity";

type EntityProps = { accent: string };

// The exhaustive registry keeps editorial IDs independent from chapter order.
const entityById: Record<StageEntityId, ComponentType<EntityProps>> = {
  corpus: CorpusEntity,
  vector: VectorEntity,
  attention: AttentionEntity,
  transformer: TransformerEntity,
  training: TrainingEntity,
  alignment: AlignmentEntity,
  portal: PortalEntity,
  galaxy: GalaxyEntity,
};

/** Resolves the visual attached to a chapter without exposing Three.js to content data. */
export function StageEntity({ entityId, accent }: EntityProps & { entityId: StageEntityId }) {
  const EntityComponent = entityById[entityId];
  return <EntityComponent accent={accent} />;
}
