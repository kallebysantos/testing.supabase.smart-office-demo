# pgflow Workflow Engine 🚀

## 🎯 Run the Hello World Example

### 1. Start Edge Functions

```bash
npx supabase functions serve  # Keep running in separate terminal
```

> [!NOTE]
> Restart the functions server after modifying flow code

### 2. Start the Worker

```bash
curl http://localhost:54321/functions/v1/pgflow-hello-world
```

You should see worker output in your Edge Runtime terminal.

### 3. Trigger the Example Flow

The project includes a sample flow at [`supabase/functions/pgflow-hello-world/greetUser.flow.ts`](supabase/functions/pgflow-hello-world/greetUser.flow.ts)

```sql
-- Start the greet_user flow
SELECT * FROM pgflow.start_flow(
  flow_slug => 'greet_user',
  input => '{"first_name": "Alice", "last_name": "Smith"}'::jsonb
);
```

Save the returned `run_id` for monitoring.

### 4. Observe the Output

Run this query in Supabase Studio SQL Editor (http://localhost:54323):

```sql
-- Check run status and output
SELECT status, output, remaining_steps
FROM pgflow.runs
WHERE run_id = 'YOUR_RUN_ID';
```

Expected output when completed:

```json
{ "greeting": "Hello, Alice Smith!" }
```

### 5. Monitor Step Execution

```sql
-- View step details
SELECT ss.step_slug, ss.status, st.output
FROM pgflow.step_states ss
LEFT JOIN pgflow.step_tasks st ON
  ss.run_id = st.run_id AND
  ss.step_slug = st.step_slug AND
  st.status = 'completed'
WHERE ss.run_id = 'YOUR_RUN_ID';
```

You'll see two steps:

- `full_name`: Combines first and last names
- `greeting`: Creates the final greeting

## 🛠️ Create New Flows

> [!NOTE]
> **Edge Worker Database Connection**
>
> The `supabase/functions/.env` file is committed with default local development settings:
>
> ```
> EDGE_WORKER_DB_URL="postgresql://postgres.pooler-dev:postgres@pooler:6543/postgres"
> ```
>
> - This URL uses `pooler:6543` which is the internal Docker hostname for the Supabase pooler service

### 1. Write Your Flow

Create a new TypeScript file in `supabase/functions/<function-name>/<flow-name>.flow.ts`

```typescript
import { Flow } from "@pgflow/dsl/supabase";

export default new Flow({
  slug: "my_flow",
  maxAttempts: 3, // Retries
  baseDelay: 5, // Retry delay (seconds)
  timeout: 60, // Visibility timeout
})
  .step({ slug: "step1" }, (input) => {
    // Your logic here
    return result;
  })
  .step({ slug: "step2", dependsOn: ["step1"] }, (input) => {
    // Access input.step1 for previous step's output
    return finalResult;
  });
```

### 2. Compile Flow → SQL

```bash
npx pgflow@latest compile \
  --deno-json supabase/functions/<function-name>/deno.json \
  supabase/functions/<function-name>/<flow-name>.flow.ts
```

### 3. Apply Migration

```bash
npx supabase migration up
```

### 4. Create Edge Worker

Create `supabase/functions/<function-name>/index.ts`:

```typescript
import { EdgeWorker } from "@pgflow/edge-worker";
import MyFlow from "./<flow-name>.flow.ts";

EdgeWorker.start(MyFlow, {
  maxPollSeconds: 5,
});
```

## 🔄 Modify Existing Flows (Destructive)

> [!WARNING]
> This deletes ALL flow data - use only during development!

```bash
# 1. Delete flow data (run in Supabase Studio SQL Editor at http://localhost:54323)
SELECT pgflow.delete_flow_and_data('your_flow_slug');

# 2. Remove old migration
rm supabase/migrations/*_your_flow_name.sql

# 3. Modify your flow code in .flow.ts file

# 4. Compile new migration
npx pgflow@latest compile \
  --deno-json supabase/functions/<function-name>/deno.json \
  supabase/functions/<function-name>/<flow-name>.flow.ts

# 5. Reset database to apply all migrations fresh
npx supabase db reset
```

> [!TIP]
> For production, use versioned flows (`my_flow_v1` → `my_flow_v2`) to preserve data

## 📊 Monitoring Queries

### Recent Runs

```sql
SELECT run_id, status, input, output, remaining_steps, started_at
FROM pgflow.runs
WHERE flow_slug = 'your_flow_slug'
ORDER BY started_at DESC
LIMIT 10;
```

### Active Tasks

```sql
SELECT run_id, step_slug, status, attempts_count,
  queued_at, started_at, last_worker_id
FROM pgflow.step_tasks
WHERE status IN ('queued', 'started')
ORDER BY queued_at ASC;
```

### Execution Timeline

```sql
SELECT step_slug, status, started_at, completed_at, failed_at,
  EXTRACT(EPOCH FROM (COALESCE(completed_at, failed_at) - started_at)) AS duration_seconds
FROM pgflow.step_states
WHERE run_id = 'YOUR_RUN_ID'
ORDER BY created_at ASC;
```

## 🔍 Debug

### Worker Activity

```sql
SELECT worker_id, last_heartbeat
FROM pgflow.workers
WHERE last_heartbeat > now() - interval '6 seconds';
```

### Failed Steps

```sql
SELECT ss.step_slug, st.attempts_count, st.error_message, st.failed_at
FROM pgflow.step_states ss
JOIN pgflow.step_tasks st ON
  ss.run_id = st.run_id AND
  ss.step_slug = st.step_slug
WHERE ss.run_id = 'YOUR_RUN_ID' AND ss.status = 'failed';
```

### Verify Tables

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'pgflow';
-- Expected: flows, steps, deps, runs, step_states, step_tasks, workers
```

## 🏷️ Flow Versioning

> [!TIP]
> For production, use new slugs instead of deleting flows

```typescript
// v1
new Flow({ slug: "process_order_v1" });

// v2 with changes
new Flow({ slug: "process_order_v2" });
```

## 📚 Learn More

### Getting Started

- 🎯 [Create Your First Flow](https://www.pgflow.dev/getting-started/create-first-flow/)
- 🔨 [Compile to SQL](https://www.pgflow.dev/getting-started/compile-to-sql/)
- ▶️ [Run Flows](https://www.pgflow.dev/getting-started/run-flow/)
- ⚙️ [Configuration Options](https://www.pgflow.dev/getting-started/configuration/)

### Advanced Topics

- 📈 [Monitor Flow Execution](https://www.pgflow.dev/how-to/monitor-flow-execution/)
- 🏷️ [Version Flows Safely](https://www.pgflow.dev/how-to/version-flows/)
- 🗑️ [Delete Flows and Data](https://www.pgflow.dev/how-to/delete-flow-and-data/)

### Production

- 🚀 [Deploy to Supabase.com](https://www.pgflow.dev/how-to/deploy-to-supabasecom/)
- 🔄 [Keep Workers Running](https://www.pgflow.dev/how-to/keep-workers-up/)
