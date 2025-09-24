const loginForm = document.getElementById('login-form');
const accessCodeInput = document.getElementById('access-code');

// This database allows you to log in as any specific student by their ID for testing.
const FAKE_DATABASE = {
    "SCI-2025": { studentId: "701", name: "Amelia Smith", details: "Science Program 2025 | Student ID: 701" },
    "701": { studentId: "701", name: "Amelia Smith", details: "Science Program 2025 | Student ID: 701" },
    "702": { studentId: "702", name: "Nathan Patel", details: "Science Program 2025 | Student ID: 702" },
    "703": { studentId: "703", name: "Priya Johnson", details: "Science Program 2025 | Student ID: 703" },
    // You can add more students here for quick testing
};

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    const code = accessCodeInput.value.trim().toUpperCase();
    
    if (FAKE_DATABASE[code]) {
        const student = FAKE_DATABASE[code];
        
        localStorage.setItem('currentStudent', JSON.stringify(student));
        window.location.href = '/chat.html';

    } else {
        alert('Invalid access code. For testing, use a Student ID like 701, 702, or 703.');
        accessCodeInput.value = '';
    }
});
