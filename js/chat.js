window.addEventListener('DOMContentLoaded', () => {
    // ... (the variable declarations at the top are the same) ...
    const studentNameHeader = document.getElementById('student-name-header');
    const studentDetailsHeader = document.getElementById('student-details-header');
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const logoutBtn = document.getElementById('logout-btn');
    const promptButtons = document.querySelectorAll('.prompt-btn');

    const studentData = JSON.parse(localStorage.getItem('currentStudent'));

    if (!studentData) {
        window.location.href = '/index.html';
        return; 
    }

    function initializePage() {
        // ... (this function is the same) ...
        studentNameHeader.textContent = `${studentData.name} - Parent Portal`;
        studentDetailsHeader.textContent = studentData.details;
        messageInput.placeholder = `Ask about ${studentData.name}'s academic progress...`;
        const welcomeMessage = `Hello! I'm your AI academic assistant. I am connected to ${studentData.name}'s academic records. How can I help you today?`;
        displayMessage(welcomeMessage, 'ai');
    }

    function displayMessage(message, sender) {
        // ... (this function is the same) ...
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // --- THIS IS THE NEW, ORCHESTRATING FUNCTION ---
    async function getAIResponse(prompt) {
        displayMessage('Fetching student data...', 'ai');

        try {
            // STEP 1: Fetch the complete student record from Supabase
            const dataRes = await fetch('/.netlify/functions/getStudentData', {
                method: 'POST',
                body: JSON.stringify({ studentId: studentData.studentId })
            });

            if (!dataRes.ok) {
                throw new Error(`Failed to fetch student data: ${dataRes.status}`);
            }
            const fullStudentData = await dataRes.json();

            // Update the status message for the user
            messageContainer.lastChild.textContent = 'Analyzing data with AI...';

            // STEP 2: Send the prompt AND the fetched data to the AI for analysis
            const aiRes = await fetch('/.netlify/functions/getAiResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: prompt,
                    studentName: studentData.name,
                    studentData: fullStudentData // Pass the real data here
                })
            });

            if (!aiRes.ok) {
                throw new Error(`AI analysis failed: ${aiRes.status}`);
            }

            // Remove the status message and display the final answer
            messageContainer.lastChild.remove();
            const aiData = await aiRes.json();
            displayMessage(aiData.reply, 'ai');

        } catch (error) {
            console.error('Orchestration Error:', error);
            if (messageContainer.lastChild) {
                messageContainer.lastChild.remove();
            }
            displayMessage('Sorry, there was a problem processing your request. Please try again.', 'ai');
        }
    }

    // ... (the event listeners at the bottom are the same) ...
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userMessage = messageInput.value.trim();
        if (userMessage) {
            displayMessage(userMessage, 'user');
            getAIResponse(userMessage);
            messageInput.value = '';
        }
    });
    promptButtons.forEach(button => { /* ... same as before ... */ });
    logoutBtn.addEventListener('click', () => { /* ... same as before ... */ });

    initializePage();
});
Step 2: Update the Data-Fetching Function (getStudentData.js)
This function needs to correctly receive the studentId from the front-end.
Action: Replace the code in netlify/functions/getStudentData.js with this. Remember to check that from('Students') and from('Markbook') match your table names exactly!
code
JavaScript
// NEW VERSION - This function now receives the studentId from the front-end.
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    const { studentId } = JSON.parse(event.body);

    if (!studentId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Student ID is required.' }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let { data: studentData, error } = await supabase
            .from('Students') // <-- VERIFY THIS NAME
            .select(`*, Markbook(*)`) // <-- VERIFY 'Markbook' NAME
            .eq('StudentID', studentId) // <-- VERIFY 'StudentID' NAME
            .single();

        if (error) throw error;
        
        // ... (The skill enrichment part remains the same) ...
        let { data: skills, error: skillsError } = await supabase.from('Skills').select('*'); // <-- VERIFY 'Skills' NAME
        if (skillsError) throw skillsError;
        
        const skillMap = skills.reduce((map, skill) => {
            map[skill.SkillID] = skill;
            return map;
        }, {});

        studentData.Markbook.forEach(entry => {
            if (entry.TaggedSkills) {
                const skillCodes = entry.TaggedSkills.split(',').map(s => s.trim());
                entry.FullSkillsData = skillCodes.map(code => skillMap[code]).filter(Boolean);
            }
        });

        return { statusCode: 200, body: JSON.stringify(studentData) };
    } catch (error) {
        console.error('Error in function:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch and process student data.' }) };
    }
};
