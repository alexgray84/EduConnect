// js/login.js

const loginForm = document.getElementById('login-form');
const accessCodeInput = document.getElementById('access-code');

// This is our "fake" database of valid access codes and their students
const FAKE_DATABASE = {
    "SCI-2025": { studentId: "702", name: "Nathan Patel", details: "Science Program 2025 | Student ID: 702" },
    "701": { studentId: "701", name: "Jane Doe", details: "Math Program 2024 | Student ID: 701" },
    // Add more codes and students here for your trial
};

loginForm.addEventListener('submit', (event) => {
    // Prevent the form from actually submitting and reloading the page
    event.preventDefault(); 
    
    const code = accessCodeInput.value.trim();
    
    // Check if the entered code exists in our fake database
    if (FAKE_DATABASE[code]) {
        const student = FAKE_DATABASE[code];
        
        // Store the student info to be used on the next page.
        // localStorage is simple browser storage that persists even if you close the tab.
        localStorage.setItem('currentStudent', JSON.stringify(student));
        
        // Redirect the user to the chat page
        window.location.href = '/chat.html';

    } else {
        // If the code is wrong, show an error
        alert('Invalid access code. Please try again.');
        accessCodeInput.value = ''; // Clear the input
    }
});
