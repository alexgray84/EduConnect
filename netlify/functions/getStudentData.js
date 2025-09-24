const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    console.log("--- Starting Simplest Possible Test ---");

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log("Hardcoding query for StudentID = 702");

        // The simplest possible query. No variables.
        let { data, error } = await supabase
            .from('Students')
            .select('*')
            .eq('StudentID', 702) // Searching for the literal number 702
            .single();

        if (error) {
            console.error("Simple query failed. Error object:", JSON.stringify(error, null, 2));
            throw error;
        }
        
        if (!data) {
            console.error("Simple query returned 0 rows.");
            throw new Error("Student 702 not found.");
        }

        console.log("SUCCESS! Found student data:", JSON.stringify(data, null, 2));
        
        // We will just return the simple student data, without joining Markbook for now.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('CRITICAL ERROR in simple test:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: `Simple test failed: ${error.message}` }) };
    }
};
