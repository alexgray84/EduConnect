const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    // We will get the student's ID from the front-end call.
    // Let's use Nathan Patel's ID (702) for our testing.
    // IMPORTANT: Make sure the ID is a number if your Supabase column is a number type.
    const studentId = 702; 

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // This is the smart query.
        // It says: "From the 'Students' table, select all columns (*).
        // Also, grab everything (*) from the 'Markbooks' table where the StudentID matches.
        // And find the single student whose StudentID is our target."

        // === CRITICAL: VERIFY YOUR TABLE AND COLUMN NAMES HERE ===
        let { data: studentData, error } = await supabase
            .from('Students')         // 1. Is your student table named 'Students'? (Case sensitive!)
            .select(`
                *,
                Markbook(*)
            `)                        // 2. Is your markbook table named 'Markbooks'?
            .eq('StudentID', studentId) // 3. Is your student ID column in BOTH tables named 'StudentID'?
            .single();

        if (error) {
            console.error('Supabase Query Error:', error);
            throw error;
        }

        // The AI needs the skill codes (e.g., "SCI-01") translated into meaningful text.
        // We will do a second, quick query to get all skills.
        let { data: skills, error: skillsError } = await supabase.from('Skills').select('*');
        if (skillsError) throw skillsError;

        // Create a quick lookup map for skills: { "SCI-01": { SkillName: "...", ... }, ... }
        const skillMap = skills.reduce((map, skill) => {
            map[skill.SkillID] = skill;
            return map;
        }, {});

        // Now, enrich the student's markbook data with the full skill descriptions.
        studentData.Markbook.forEach(entry => {
            if (entry.TaggedSkills) {
                const skillCodes = entry.TaggedSkills.split(',').map(s => s.trim());
                entry.FullSkillsData = skillCodes.map(code => skillMap[code]).filter(Boolean); // Replaces codes with full objects
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(studentData)
        };

    } catch (error) {
        console.error('Error in function:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch and process student data.' })
        };
    }
};
