import { EdgeWorker } from "@pgflow/edge-worker";
import RoomApplyAIProcessingFlow from "./room-apply-ai-processing.flow.ts";

// Uses Edge-Runtime backgorund tasks to execute the flow steps
EdgeWorker.start(RoomApplyAIProcessingFlow, {
  maxPollSeconds: 5,
});
