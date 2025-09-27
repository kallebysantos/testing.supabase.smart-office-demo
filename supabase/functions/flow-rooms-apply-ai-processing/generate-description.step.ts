import { createClient } from "npm:@supabase/supabase-js@^2.47.10";
import { describe } from "./room-descriptor.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type GenDescriptionInput = {
  /** Represents the room's ID */
  id: string;
};

export async function generateDescription(
  payload: GenDescriptionInput,
): Promise<string> {
  console.info(`Describing the room: [${payload.id}]`);

  const {
    data: room,
    error: loadRoomError,
  } = await supabase.from("rooms")
    .select("name,building,floor,capacity,amenities")
    .eq("id", payload.id)
    .single();

  if (loadRoomError || !room) {
    console.error(loadRoomError);
    throw new Error(
      loadRoomError.message || `could not load room with id: [${payload.id}]`,
    );
  }

  const content = await describe({ ...room });
  if (!content) {
    const error = `could not describe the room with id: [${payload.id}]`;
    console.error(error);
    throw new Error(error);
  }

  const { error: saveRoomDescriptionError } = await supabase
    .from(
      "room_embeddings",
    )
    .upsert({
      room_id: payload.id,
      content,
    });

  if (saveRoomDescriptionError) {
    console.error(saveRoomDescriptionError);
    throw new Error(saveRoomDescriptionError.message);
  }
  console.info(
    `Save description for room: [${payload.id}]`,
  );

  return content;
}
