import { createClient } from "npm:@supabase/supabase-js@^2.47.10";
import { embed as doEmbed } from "@shared/ai/embedder.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type EmbedInput = {
  id: string;
  /** Represents the room's description content */
  content: string;
};

export async function embed({ id, content }: EmbedInput) {
  console.log("embed", { id, content });

  console.time("embedding time");
  const embeddings = await doEmbed({ text: content });
  console.timeEnd("embedding time");

  const { error: saveEmbeddingsError } = await supabase.from("room_embeddings")
    .update({
      embedding: JSON.stringify(embeddings.data),
    })
    .eq("room_id", id);

  if (saveEmbeddingsError) {
    console.error(saveEmbeddingsError);

    throw new Error(
      saveEmbeddingsError.message ||
        `could not embed room_embeddings with id: [${id}]`,
    );
  }

  console.log(
    `processed room_embeddings [${id}] - embed size ${embeddings.length}`,
  );

  return embeddings;
}
