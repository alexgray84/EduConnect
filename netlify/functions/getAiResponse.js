exports.handler = async function(event, context) {
    // 1. Get the user's prompt from the front-end request
    const { prompt } = JSON.parse(event.body);

    // 2. Get our secret API key from the Netlify environment variables
    const apiKey = process.env.NEBIUS_API_KEY;

    // 3. Define the Nebius API endpoint and request body
    // IMPORTANT: You still need to check the Nebius API documentation for the correct URL and body structure!
    // This is a generic example based on your UI designs.
    const apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'; // EXAMPLE URL! CHECK DOCS!
    const requestBody = {
        modelUri: "gpt://<folder-id>/yandexgpt-lite", // EXAMPLE model! CHECK DOCS!
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
                // Nebius most likely requires an 'Authorization' header with your key.
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Nebius API Error: ${response.status}`, errorBody);
            throw new Error(`Nebius API Error: ${response.status}`);
        }

        const data = await response.json();

        // 5. Extract the actual text from the Nebius response.
        // CHECK THEIR DOCS! This path is an example.
        const aiReply = data.result.alternatives[0].message.text;

        // 6. Send the clean response back to our front-end
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply })
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch response from AI.' })
        };
    }
};
