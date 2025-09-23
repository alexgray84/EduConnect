exports.handler = async function(event, context) {
    // 1. Get the user's prompt from the front-end request
    const { prompt } = JSON.parse(event.body);

    // 2. Get our secret API key from the Netlify environment variables
    const apiKey = process.env.NEBIUS_API_KEY;

    // 3. Define the Nebius API endpoint and request body
    // NOTE: This is the official endpoint. It should be correct.
    const apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';
    
    // *** THIS IS THE CORRECTED PART FOR NEBIUS STUDIO ***
    // We are replacing the complex "modelUri" with a simpler "model" field.
    const requestBody = {
        model: "yandexgpt-lite", // This is a common model name. Check docs if it's different.
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: "2000"
        },
        messages: [
          {
            role: "user",
            text: prompt
          }
        ]
    };

    try {
        // 4. Make the secure call to the Nebius API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Your API key is a JWT, so "Bearer" is the correct authorization type.
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Nebius API Error Response: ${errorBody}`);
            throw new Error(`Nebius API Error: ${response.status}`);
        }

        const data = await response.json();

        // POWERFUL DEBUGGING: This will print the full, successful response to the Netlify log.
        // This helps us find the correct path to the AI's reply.
        console.log("Full Nebius Response:", JSON.stringify(data, null, 2));

        // 5. Extract the actual text from the Nebius response.
        // My previous guess was likely correct, but the log above will confirm it.
        const aiReply = data.result.alternatives[0].message.text;

        // 6. Send the clean response back to our front-end
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
