exports.handler = async function(event, context) {
    const { prompt } = JSON.parse(event.body);

    // Using our new, correct environment variable
    const apiKey = process.env.OPENROUTER_API_KEY;

    // The standard API endpoint for OpenRouter
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // The standard API request body (OpenAI format)
    const requestBody = {
        model: "mistralai/mistral-7b-instruct:free", // A great, fast, and FREE model to start
        messages: [
          {
            role: "user",
            text: prompt
          }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // OpenRouter uses the standard "Bearer" token authorization
                'Authorization': `Bearer ${apiKey}`,
                // OpenRouter requires these two headers to identify your app
                'HTTP-Referer': 'https://educonekt.netlify.app', // Your site URL
                'X-Title': 'EduConnect' // Your site name
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`OpenRouter API Error Response: ${errorBody}`);
            throw new Error(`OpenRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Full OpenRouter Response:", JSON.stringify(data, null, 2));
        
        // The standard way to get the reply from an OpenAI-compatible API
        const aiReply = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply })
        };

    } catch (error) {
        console.error("Error in Netlify function:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch response from AI.' })
        };
    }
};
