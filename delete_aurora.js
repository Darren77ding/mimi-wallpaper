import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseKey) { console.log('No keys'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('wallpapers').select('*');
  if (data) {
    const target = data.find(w => w.image_description && w.image_description.toLowerCase().includes('aurora'));
    if (target) {
      await supabase.from('wallpapers').delete().eq('id', target.id);
      console.log('Deleted aurora image id:', target.id);
    } else {
      console.log('Aurora image not found.');
    }
  }
}
run();
