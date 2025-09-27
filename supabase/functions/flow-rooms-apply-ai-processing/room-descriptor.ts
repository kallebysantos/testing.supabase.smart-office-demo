import OpenAI from "jsr:@openai/openai";

export type RoomDescriptorPayload = {
  name: string;
  building: string;
  floor: number;
  capacity: number;
  amenities: string[];
};

const openai = new OpenAI({
  baseURL: Deno.env.get("OPENAI_URL"),
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

export const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo";

export const MODEL_OPTS = {
  max_tokens: 768,
  temperature: 0.8,
};

export const SYSTEM_PROMPT = `#CONTEXT:
- You're a digital assistant of Supabase conference rooms booking app.
- Your main goal is grab the room information and generate a short and concise description about this room.
- Do not add any prefix or introductions like 'Here's a short and concise description' JUST respond DIRECTLY with the result description.`;

export const applyTemplate = (
  { name, building, floor, capacity, amenities }: RoomDescriptorPayload,
) =>
  `ROOM: ${name}
LOCATION: ${building} at ${floor}º floor
CAPACITY: ${capacity} persons
AMENITIES: ${amenities.join(", ")}
`;

export async function describe(payload: RoomDescriptorPayload) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{
      role: "system",
      content: SYSTEM_PROMPT,
    }, {
      role: "user",
      content: applyTemplate(payload),
    }],
    ...MODEL_OPTS,
    stream: false,
  });

  const result = completion.choices.at(0)?.message?.content;

  return result;
}
