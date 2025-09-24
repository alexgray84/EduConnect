const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    const { accessCode } = JSON.parse(event.body);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Find the student whose AccessCode matches the one provided.
        let { data, error } = await supabase
            .from('Students')
            .select('StudentID, FirstName, LastName')
            .eq('AccessCode', accessCode)
            .limit(1) // Get the first match
            .single(); // Expect exactly one result

        if (error) throw error;

        // If a student is found, return their data.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 404, // Not Found is a good error for a failed login
            body: JSON.stringify({ error: 'Invalid access code.' })
        };
    }
};
