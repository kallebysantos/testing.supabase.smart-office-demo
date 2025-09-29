import { Flow } from "@pgflow/dsl/supabase";
import { generateDescription } from "./generate-description.step.ts";
import { embed } from "./embed.step.ts";

type Input = {
  id: string;
};

export default new Flow<Input>({
  slug: "room_apply_ai_processing",
})
  .step(
    { slug: "generate_description" },
    async ({ run: payload }) => await generateDescription(payload),
  )
  .step(
    { slug: "embed", dependsOn: ["generate_description"] },
    async ({ run: { id }, generate_description }) => {
      return await embed({
        id: id,
        content: generate_description,
      });
    },
  );
