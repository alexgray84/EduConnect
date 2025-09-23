exports.handler = async function(event, context) {
    
    // This function doesn't call any API.
    // It just immediately returns a success message.
    
    const successMessage = "Test successful! The new code is live.";

    return {
        statusCode: 200,
        body: JSON.stringify({ reply: successMessage })
    };
    
};
