const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250118000001_add_notes_to_service_tickets.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: Adding notes column to service_tickets table...');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      // Try direct approach
      console.log('Trying direct SQL execution...');

      // Split the SQL into individual statements
      const statements = sql
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');

      for (const statement of statements) {
        if (statement.includes('ALTER TABLE') || statement.includes('COMMENT ON') || statement.includes('UPDATE')) {
          console.log('Executing:', statement.substring(0, 50) + '...');

          // For ALTER and COMMENT, we need to use raw SQL through Supabase
          // Since Supabase JS client doesn't support DDL directly, we'll just log success
          console.log('Note: DDL statements need to be run directly in Supabase SQL Editor');
        }
      }

      console.log('\n⚠️  The migration SQL has been generated but needs to be run manually.');
      console.log('Please go to your Supabase dashboard -> SQL Editor and run:');
      console.log('\n' + sql);
      return;
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    console.log('\n⚠️  Please run the following SQL manually in Supabase SQL Editor:');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250118000001_add_notes_to_service_tickets.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('\n' + sql);
  }
}

runMigration();