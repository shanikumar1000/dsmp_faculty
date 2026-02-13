// Run admin RLS policies migration against Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    console.log('Running admin RLS policies migration...\n');

    const policies = [
        {
            name: 'Admins can read all profiles',
            sql: `CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));`
        },
        {
            name: 'Admins can insert profiles',
            sql: `CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));`
        },
        {
            name: 'Admins can read all activities',
            sql: `CREATE POLICY "Admins can read all activities" ON activities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));`
        },
        {
            name: 'Admins can update all activities',
            sql: `CREATE POLICY "Admins can update all activities" ON activities FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));`
        }
    ];

    for (const policy of policies) {
        console.log(`Creating: "${policy.name}"...`);
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error) {
            // Try raw SQL via REST if rpc not available
            console.log(`  RPC not available, trying direct...`);
            const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ sql: policy.sql })
            });
            if (!res.ok) {
                console.log(`  ⚠️ Could not apply via API. Error: ${error.message}`);
            } else {
                console.log(`  ✅ Applied`);
            }
        } else {
            console.log(`  ✅ Applied`);
        }
    }

    console.log('\nDone! Note: If policies could not be applied via API,');
    console.log('you need to run the SQL in your Supabase Dashboard → SQL Editor.');
}

runMigration().catch(console.error);
