import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateText, tool } from "npm:ai@5.0.56";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@1.0.19";
import {
  searchRoom,
  SearchRoomInput,
  searchRoomInputSchema,
} from "./search-room.ts";

const aiProvider = createOpenAICompatible({
  name: "supabase-ai-provider",
  baseURL: Deno.env.get("OPENAI_URL") || "https://api.openai.com",
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const aiModel = Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo";

export const SYSTEM_PROMPT = `#CONTEXT:
- You're a digital assistant of Supabase conference rooms searching app.
- Your main goal is grab the search query and then call the respective function.
- In order to get best results you must feed the 'enriched_query' field with a very rich description.
`;

export interface RoomNaturalSearchInput {
  search?: string;
}

Deno.serve(async (req) => {
  const { search } = await req.json() as RoomNaturalSearchInput;
  if (!search) {
    return Response.json({ error: "missing required parammeter: 'search'" }, {
      status: 400,
    });
  }

  const result = await generateText({
    model: aiProvider(aiModel),
    system: SYSTEM_PROMPT,
    tools: {
      searchRoom: tool({
        description: "Searches for a room.",
        inputSchema: searchRoomInputSchema,
      }),
    },
    temperature: 0,
    toolChoice: "required",
    prompt: search,
  });

  // Retrieve the AI parsed structured input
  const input = result.toolCalls.at(0)?.input as SearchRoomInput;
  if (!input) {
    return Response.json({ error: "could not translate the given 'search'" }, {
      status: 422,
    });
  }

  const rooms = await searchRoom(input);

  return Response.json(rooms);
});
