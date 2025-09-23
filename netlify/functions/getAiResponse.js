exports.handler = async function(event, context) {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.NEBIUS_API_KEY;
    const apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';
    
    const requestBody = {
        model: "yandexgpt-lite", 
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
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        console.log("Full Nebius Response:", JSON.stringify(data, null, 2));
        
        const aiReply = data.result.alternatives[0].message.text;

        // <<< NEW DEBUG LINE
        const debugReply = `[DEBUG: Running latest code] ${aiReply}`;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: debugReply }) // Sending the debug-prefixed reply
        };

    } catch (error) {
        console.error("Error in Netlify function:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch response from AI.' })
        };
    }
};
