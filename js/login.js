const loginForm = document.getElementById('login-form');
const accessCodeInput = document.getElementById('access-code');

// This database now maps specific codes to specific students from your CSV.
const FAKE_DATABASE = {
    // Shared access code - defaults to Amelia for testing
    "SCI-2025": { studentId: "701", name: "Amelia Smith", details: "Science Program 2025 | Student ID: 701" },
    
    // Specific student IDs for direct login
    "701": { studentId: "701", name: "Amelia Smith", details: "Science Program 2025 | Student ID: 701" },
    "702": { studentId: "702", name: "Nathan Patel", details: "Science Program 2025 | Student ID: 702" },
    "703": { studentId: "703", name: "Priya Johnson", details: "Science Program 2025 | Student ID: 703" },
    // Add any other student IDs you want to test directly here
};

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    const code = accessCodeInput.value.trim().toUpperCase(); // Standardize input
    
    if (FAKE_DATABASE[code]) {
        const student = FAKE_DATABASE[code];
        
        localStorage.setItem('currentStudent', JSON.stringify(student));
        window.location.href = '/chat.html';

    } else {
        alert('Invalid access code. Please try again.');
        accessCodeInput.value = '';
    }
});
