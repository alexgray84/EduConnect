// FINAL DEBUGGING VERSION for getStudentData.js

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    // Log the raw incoming request body
    console.log("--- New Request Started ---");
    console.log("Received event body:", event.body);

    const { studentId } = JSON.parse(event.body);

    if (!studentId) {
        console.error("Error: Student ID was not provided in the request.");
        return { statusCode: 400, body: JSON.stringify({ error: 'Student ID is required.' }) };
    }

    console.log(`Parsed studentId from front-end: "${studentId}" (type: ${typeof studentId})`);
    const numericStudentId = parseInt(studentId, 10);
    console.log(`Converted to number: ${numericStudentId} (type: ${typeof numericStudentId})`);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log(`Querying Supabase table 'Students' for 'StudentID' equal to: ${numericStudentId}`);

        let { data: studentData, error } = await supabase
            .from('Students')
            .select(`*, assessments:Markbook(*)`)
            .eq('StudentID', numericStudentId)
            .single();

        // If there's an error from the query, log it in detail
        if (error) {
            console.error("Supabase query failed. Full error object:", JSON.stringify(error, null, 2));
            throw error;
        }

        // If the query succeeds but finds nothing, studentData will be null
        if (!studentData) {
            console.error(`Query succeeded but found 0 rows for StudentID: ${numericStudentId}. This ID may not exist in the 'Students' table.`);
            // Throw a custom error to make it clear
            throw new Error("Student not found in database.");
        }
        
        console.log("Successfully found student data. Processing skills...");
        
        // ... (The rest of the code is for processing, it should be fine) ...
        let { data: skills, error: skillsError } = await supabase.from('Skills').select('*');
        if (skillsError) throw skillsError;
        
        const skillMap = skills.reduce((map, skill) => {
            map[skill.SkillID] = skill;
            return map;
        }, {});

        // Handle case where there are no assessments
        if (studentData.assessments && studentData.assessments.length > 0) {
            studentData.assessments.forEach(entry => {
                if (entry.TaggedSkills) {
                    const skillCodes = entry.TaggedSkills.split(',').map(s => s.trim());
                    entry.FullSkillsData = skillCodes.map(code => skillMap[code]).filter(Boolean);
                }
            });
        }

        console.log("Function finished successfully. Returning data.");
        return { statusCode: 200, body: JSON.stringify(studentData) };

    } catch (error) {
        console.error('CRITICAL ERROR in function:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: `Function failed. Details: ${error.message}` }) };
    }
};
