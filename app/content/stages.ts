import stageContent from "./stages.json";
import { parseStages } from "../domain/stage";

export const stages = parseStages(stageContent);
