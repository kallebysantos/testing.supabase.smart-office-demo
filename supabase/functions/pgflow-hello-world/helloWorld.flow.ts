import { Flow } from "@pgflow/dsl/supabase";

type Input = {
  first_name: string;
  last_name: string;
};

export default new Flow<Input>({
  slug: "greet_user",
})
  .step(
    { slug: "full_name" },
    (input) => `${input.run.first_name} ${input.run.last_name}`,
  )
  .step(
    { slug: "greeting", dependsOn: ["full_name"] },
    (input) => `Hello, ${input.full_name}!`,
  );
