import { z } from "jsr:@zod/zod";
import { embed as doEmbed } from "@shared/ai/embedder.ts";
import { createClient } from "npm:@supabase/supabase-js@^2.47.10";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const searchRoomInputSchema = z.object({
  enriched_query: z.string().describe(
    "A natural language very rich description about the room you're looking for.",
  ),
  building_location: z.preprocess(
    (val) => (typeof val === "string" && val === "") ? undefined : val,
    z.optional(z.string().describe("A specific building office location for this room"),
  )),
  minimum_capacity: z.preprocess(
    (val) => (typeof val === "string") ? Number.parseInt(val) : val,
    z.number().describe(
      "The mimimum capacity of the room, determines how many persons will be using this room.",
    ),
  ),
  amenities: z.preprocess(
    (val) => (typeof val === "string") ? JSON.parse(val) : val,
    z.array(z.string()).describe(
      "A list of amenities that room should have.",
    ),
  ),
});

export type SearchRoomInput = z.infer<typeof searchRoomInputSchema>;

export async function searchRoom(input: SearchRoomInput) {
  console.log(input);

  const { data: searchEmbeddings } = await doEmbed({
    text: input.enriched_query,
  });

  const { data: rooms, error: searchError } = await supabase.rpc(
    "rooms_hybrid_search",
    {
      query_embedding: searchEmbeddings,
      min_capacity: input.minimum_capacity,
      building_location: input.building_location,
      desired_amenities: input.amenities,
    },
  )
    .select("*");

  if (searchError) {
    throw searchError;
  }

  return rooms;
}
