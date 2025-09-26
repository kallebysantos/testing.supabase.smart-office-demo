import { EdgeWorker } from "@pgflow/edge-worker";
import GreetUserFlow from "./greetUser.flow.ts";

EdgeWorker.start(GreetUserFlow, {
  maxPollSeconds: 5,
});
