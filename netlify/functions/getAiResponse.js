exports.handler = async function(event, context) {
    const { prompt, studentName, studentData } = JSON.parse(event.body);

    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // Convert the student's data object into a clean string for the AI
    const studentDataContext = JSON.stringify(studentData, null, 2);

    const systemPrompt = `You are an AI Academic Advisor. You are speaking to a parent of a student named ${studentName}. Your task is to answer the parent's question based *exclusively* on the following JSON data. Do not invent information. If the data does not contain the answer, state that clearly. Your goal is to synthesize information, identify trends, and be helpful and encouraging.

    STUDENT DATA:
    ${studentDataContext}`;

    const requestBody = {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
    };

    // ... (The try/catch block with the fetch call to OpenRouter is the same as our last working version) ...
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { /* ... same headers ... */ },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) { /* ... same error handling ... */ }
        const data = await response.json();
        const aiReply = data.choices[0].message.content;
        return { statusCode: 200, body: JSON.stringify({ reply: aiReply }) };
    } catch (error) { /* ... same error handling ... */ }
};
