window.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET ELEMENTS FROM THE PAGE ---
    const studentNameHeader = document.getElementById('student-name-header');
    const studentDetailsHeader = document.getElementById('student-details-header');
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const logoutBtn = document.getElementById('logout-btn');
    const promptButtons = document.querySelectorAll('.prompt-btn');

    // --- 2. CHECK FOR LOGGED-IN USER ---
    const studentData = JSON.parse(localStorage.getItem('currentStudent'));

    if (!studentData) {
        // If no student data is found, redirect to the login page.
        window.location.href = '/index.html';
        return; 
    }

    // --- 3. INITIALIZE THE CHAT PAGE ---
    function initializePage() {
        // Update header with the correct student info
        studentNameHeader.textContent = `${studentData.name} - Parent Portal`;
        studentDetailsHeader.textContent = studentData.details;
        messageInput.placeholder = `Ask about ${studentData.name}'s academic progress...`;

        // Display the initial welcome message from the AI
        const welcomeMessage = `Hello! I'm your AI academic assistant. I have access to ${studentData.name}'s academic records and can help you understand their progress, strengths, and areas for growth. What would you like to know about ${studentData.name}'s education?`;
        displayMessage(welcomeMessage, 'ai');
    }

    // --- 4. HELPER FUNCTION TO DISPLAY MESSAGES ---
    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // --- 5. FUNCTION TO GET AI RESPONSE (THE REAL ONE) ---
    async function getAIResponse(prompt) {
        displayMessage('Thinking...', 'ai');

        try {
            // This is the real call to our Netlify Function.
            const response = await fetch('/.netlify/functions/getAiResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt }) 
            });

            // Remove the "Thinking..." message
            messageContainer.lastChild.remove();

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            const aiReply = data.reply;
            displayMessage(aiReply, 'ai');

        } catch (error) {
            console.error('Error fetching AI response:', error);
            if (messageContainer.lastChild && messageContainer.lastChild.textContent === 'Thinking...') {
                messageContainer.lastChild.remove();
            }
            displayMessage('Sorry, I seem to be having trouble connecting. Please try again in a moment.', 'ai');
        }
    }

    // --- 6. EVENT LISTENERS ---
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userMessage = messageInput.value.trim();
        if (userMessage) {
            displayMessage(userMessage, 'user');
            getAIResponse(userMessage);
            messageInput.value = '';
        }
    });

    promptButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prompt = button.textContent;
            displayMessage(prompt, 'user');
            getAIResponse(prompt);
        });
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentStudent');
        window.location.href = '/index.html';
    });

    // --- 7. START THE PAGE ---
    initializePage();
});
