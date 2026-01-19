import { createClient } from '@supabase/supabase-js';

// DİKKAT: Tırnakların içine kendi kopyaladığın adresi yapıştır!
// Örnek: "https://abcdefg.supabase.co"
const supabaseUrl = "https://ooijibeqwrhozmqbqlna.supabase.co"; 

// DİKKAT: Tırnakların içine o uzun şifreyi yapıştır!
// Örnek: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
const supabaseKey = "sb_publishable_k1QMHrviodpgH0mHKJPTjA_w6yIoh4A";

export const supabase = createClient(supabaseUrl, supabaseKey);