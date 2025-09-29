import { z } from "jsr:@zod/zod";
import { generateObject } from "npm:ai@5.0.56";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@1.0.19";

export type RoomDescriptorPayload = {
  name: string;
  building: string;
  floor: number;
  capacity: number;
  amenities: string[];
};

const aiProvider = createOpenAICompatible({
  name: "supabase-ai-provider",
  baseURL: Deno.env.get("OPENAI_URL") || "https://api.openai.com",
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const aiModel = Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo";

export const SYSTEM_PROMPT = `#CONTEXT:
- You're a digital assistant of Supabase conference rooms booking app.
- Your main goal is grab the room information and generate a description about this room, include how much information you can.
- Respond using the following json format:
{ "room_description": string }
`;

export const applyTemplate = (
  { name, building, floor, capacity, amenities }: RoomDescriptorPayload,
) =>
  `ROOM: ${name}
LOCATION: ${building} at ${floor}º floor
CAPACITY: ${capacity} persons
AMENITIES: ${amenities.join(", ")}
`;

export async function describe(payload: RoomDescriptorPayload) {
  const result = await generateObject({
    model: aiProvider(aiModel),
    schemaName: "room-description",
    schemaDescription: "A short and concise description about this room",
    schema: z.object({
      room_description: z.string(),
    }),
    system: SYSTEM_PROMPT,
    prompt: applyTemplate(payload),
    temperature: 0.3,
    maxOutputTokens: 768,
    maxRetries: 3,
    mode: "tool",
  });

  return result.object.room_description;
}
