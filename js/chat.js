// Make sure the entire page is loaded before we run any script
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
    // Get student data that we saved in localStorage from the login page
    const studentData = JSON.parse(localStorage.getItem('currentStudent'));

    if (!studentData) {
        // If no student data is found, the user is not logged in.
        // Redirect them back to the login page.
        window.location.href = '/index.html';
        return; // Stop running the rest of the script
    }

    // --- 3. INITIALIZE THE CHAT PAGE ---
    function initializePage() {
        // Update header with the correct student info
        studentNameHeader.textContent = `${studentData.name} - Parent Portal`;
        studentDetailsHeader.textContent = studentData.details;

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
        // Scroll to the bottom to show the new message
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // --- 5. FUNCTION TO GET AI RESPONSE ---
    async function getAIResponse(prompt) {
        // For now, let's just return a fake response to test the UI.
        // We will replace this with our real Netlify Function call.
        displayMessage('Thinking...', 'ai'); // Show a thinking indicator

        // ** THIS IS WHERE YOU'LL CALL YOUR NETLIFY FUNCTION **
        // const response = await fetch('/.netlify/functions/getAiResponse', { ... });
        // const data = await response.json();
        // const aiReply = data.reply;

        // FAKE DELAY to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const fakeReply = `This is a placeholder response about "${prompt}". Once connected to the Nebius AI, I will provide real insights based on ${studentData.name}'s data.`;
        
        // Remove the "Thinking..." message and show the real one
        messageContainer.lastChild.remove(); 
        displayMessage(fakeReply, 'ai');
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
        localStorage.removeItem('currentStudent'); // Clear the stored data
        window.location.href = '/index.html'; // Go back to login
    });

    // --- 7. START THE PAGE ---
    initializePage();
});
