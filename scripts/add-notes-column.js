const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addNotesColumn() {
  try {
    // First check if the column already exists
    const { data: columns, error: checkError } = await supabase
      .from('service_tickets')
      .select('notes')
      .limit(1);

    if (!checkError) {
      console.log('✅ Notes column already exists in service_tickets table');
      return;
    }

    // If we get here, the column doesn't exist (will error)
    console.log('Column does not exist, will need to be added via Supabase Dashboard');

    // Since Supabase JS doesn't support DDL, we'll output the SQL
    console.log('\n📝 Please run this SQL in your Supabase Dashboard SQL Editor:\n');
    console.log(`-- Add notes column to service_tickets table
ALTER TABLE service_tickets
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN service_tickets.notes IS 'Free-form text notes for tracking additional information about the service ticket';

-- Add sample notes to a few existing tickets
UPDATE service_tickets
SET notes = 'Initial assessment completed. Awaiting facilities team response.'
WHERE status = 'processing'
AND notes IS NULL
LIMIT 2;

UPDATE service_tickets
SET notes = 'Room capacity limit increased. Monitoring for future violations.'
WHERE status = 'resolved'
AND notes IS NULL
LIMIT 2;`);

    console.log('\n🔗 Dashboard URL:', supabaseUrl.replace('.supabase.co', '.supabase.com/project/').replace('https://', 'https://supabase.com/dashboard/project/') + '/sql/new');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

addNotesColumn();