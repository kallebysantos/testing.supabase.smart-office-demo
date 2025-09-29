import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.3";

// Ensure we do use browser cache,
// in order to apply the latest fetch optimizations features
env.useBrowserCache = true;
env.allowLocalModels = false;

// We do not await here for lazy loading
export const embedder = pipeline("feature-extraction", "Supabase/gte-small",
  {
    device: "auto", // Enables edge-runtime builtin onnx provider
  },
);

export type EmbedInput = {
  text: string;
};

export type EmbedOutput = {
  data: number[];
  length: number;
};

/** Uses an external EdgeFunction endpoint to perform inference */
export async function embed(payload: EmbedInput) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const embeddings = await fetch(`${supabaseUrl}/functions/v1/embedder`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    },
  });

  const result: EmbedOutput = await embeddings.json();

  return result;
}
