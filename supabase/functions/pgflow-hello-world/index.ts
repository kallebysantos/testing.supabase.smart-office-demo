import { EdgeWorker } from "@pgflow/edge-worker";
import HelloWorldFlow from "./helloWorld.flow.ts";

EdgeWorker.start(HelloWorldFlow, {
  maxPollSeconds: 5,
});
