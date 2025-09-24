window.addEventListener('DOMContentLoaded', () => {

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
        studentNameHeader.textContent = `${studentData.name} - Parent Portal`;
        studentDetailsHeader.textContent = studentData.details;
        messageInput.placeholder = `Ask about ${studentData.name}'s academic progress...`;
        const welcomeMessage = `Hello! I'm your AI academic assistant. I am connected to ${studentData.name}'s academic records. How can I help you today?`;
        displayMessage(welcomeMessage, 'ai');
    }

    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

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
                    studentData: fullStudentData
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

    initializePage();
});
