import { supabase } from '../src/utils/supabase.js';

async function verifyDatabase() {
  console.log('🔍 Testing Supabase Database Connection & Tables...\n');
  
  const tables = ['doctors', 'users', 'appointments', 'activities'];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .limit(3);

    if (error) {
      console.log(`❌ Table '${table}': NOT FOUND or PERMISSION DENIED (${error.message})`);
    } else {
      console.log(`✅ Table '${table}': FOUND (${count ?? data.length} rows detected)`);
      if (table === 'doctors' && data.length > 0) {
        console.log(`   Sample doctor: ${data[0].name} - ${data[0].specialization} (${data[0].hospital})`);
      }
    }
  }
}

verifyDatabase();
