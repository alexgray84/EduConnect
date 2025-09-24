exports.handler = async function(event, context) {
    const { prompt, studentName, studentData } = JSON.parse(event.body);
    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // --- NEW: Data Transformation Logic ---
    let studentDataContext = `Summary for ${studentData.FirstName} ${studentData.LastName} (ID: ${studentData.StudentID}):\n\n`;
    
    if (studentData.assessments && studentData.assessments.length > 0) {
        studentDataContext += "Assessments:\n";
        studentData.assessments.forEach(item => {
            studentDataContext += `- Assessment: "${item.AssessmentName}"\n`;
            if (item.Grade) studentDataContext += `  - Grade: ${item.Grade}\n`;
            if (item.Score) studentDataContext += `  - Score: ${item.Score}/${item.MaxScore}\n`;
            if (item.FeedbackText) studentDataContext += `  - Feedback: "${item.FeedbackText}"\n`;
            if (item.FullSkillsData && item.FullSkillsData.length > 0) {
                const skills = item.FullSkillsData.map(s => s.SkillName).join(', ');
                studentDataContext += `  - Skills Demonstrated: ${skills}\n`;
            }
            studentDataContext += "\n";
        });
    } else {
        studentDataContext += "No assessment data available for this student.\n";
    }
    // --- End of Data Transformation ---

    const systemPrompt = `You are an AI Academic Advisor for a student named ${studentName}. Answer the parent's question based *exclusively* on the following summarized data. Do not invent information. If the data doesn't contain the answer, say so. Your goal is to synthesize information, identify trends, and be helpful and encouraging.

    STUDENT DATA SUMMARY:
    ${studentDataContext}`;

    const requestBody = {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://educonekt.netlify.app',
                'X-Title': 'EduConnect'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} ${errorBody}`);
        }

        const data = await response.json();
        const aiReply = data.choices[0].message.content;

        // If the AI still gives an empty reply, send a fallback message.
        if (!aiReply || aiReply.trim() === "") {
            return { statusCode: 200, body: JSON.stringify({ reply: "I found the data, but I'm having trouble formulating a response. Please try rephrasing your question." }) };
        }

        return { statusCode: 200, body: JSON.stringify({ reply: aiReply }) };
    } catch (error) {
        console.error("Error in getAiResponse function:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: 'AI function failed.' }) };
    }
};
