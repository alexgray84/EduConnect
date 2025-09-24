exports.handler = async function(event, context) {
    const { prompt, studentName, studentData } = JSON.parse(event.body);
    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    const studentDataContext = JSON.stringify(studentData, null, 2);
    const systemPrompt = `You are an AI Academic Advisor for a student named ${studentName}. Answer the parent's question based *exclusively* on the following JSON data. Be helpful and encouraging. If the data doesn't contain the answer, say so.

    STUDENT DATA:
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
        return { statusCode: 200, body: JSON.stringify({ reply: aiReply }) };
    } catch (error) {
        console.error("Error in getAiResponse function:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: 'AI function failed.' }) };
    }
};
