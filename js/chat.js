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

    / --- 3. INITIALIZE THE CHAT PAGE ---
function initializePage() {
    // Update header with the correct student info
    studentNameHeader.textContent = `${studentData.name} - Parent Portal`;
    studentDetailsHeader.textContent = studentData.details;
    
    // THIS IS THE NEW LINE TO ADD:
    messageInput.placeholder = `Ask about ${studentData.name}'s academic progress...`;

    // Display the initial welcome message from the AI
    const welcomeMessage = `Hello! I'm your AI academic assistant. I have access to ${studentData.name}'s academic records...`;
    displayMessage(welcomeMessage, 'ai');
}
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
    displayMessage('Thinking...', 'ai');

    try {
        // This is the real call to our Netlify Function.
        const response = await fetch('/.netlify/functions/getAiResponse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // We send the user's prompt in the request body
            body: JSON.stringify({ prompt: prompt }) 
        });

        // Remove the "Thinking..." message
        messageContainer.lastChild.remove();

        if (!response.ok) {
            // If the server function has an error, show a user-friendly message
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const aiReply = data.reply; // Get the reply from the JSON
        displayMessage(aiReply, 'ai');

    } catch (error) {
        console.error('Error fetching AI response:', error);
        // Make sure to remove "Thinking..." even if there's an error
        if (messageContainer.lastChild.textContent === 'Thinking...') {
            messageContainer.lastChild.remove();
        }
        displayMessage('Sorry, I seem to be having trouble connecting. Please try again in a moment.', 'ai');
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
