const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    const { studentId } = JSON.parse(event.body);

    if (!studentId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Student ID is required.' }) };
    }

    const numericStudentId = parseInt(studentId, 10);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let { data: studentData, error } = await supabase
            .from('Students')
            .select(`*, assessments:Markbook(*)`)
            .eq('StudentID', numericStudentId)
            .single();

        if (error) throw error;
        
        let { data: skills, error: skillsError } = await supabase.from('Skills').select('*');
        if (skillsError) throw skillsError;
        
        const skillMap = skills.reduce((map, skill) => {
            map[skill.SkillID] = skill;
            return map;
        }, {});

        if (studentData.assessments && studentData.assessments.length > 0) {
            studentData.assessments.forEach(entry => {
                if (entry.TaggedSkills) {
                    const skillCodes = entry.TaggedSkills.split(',').map(s => s.trim());
                    entry.FullSkillsData = skillCodes.map(code => skillMap[code]).filter(Boolean);
                }
            });
        }

        return { statusCode: 200, body: JSON.stringify(studentData) };
    } catch (error) {
        console.error('Error in function:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: `Function failed. Details: ${error.message}` }) };
    }
};
