const loginForm = document.getElementById('login-form');
const accessCodeInput = document.getElementById('access-code');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const code = accessCodeInput.value.trim();
    if (!code) {
        alert('Please enter an access code.');
        return;
    }

    try {
        const response = await fetch('/.netlify/functions/login', {
            method: 'POST',
            body: JSON.stringify({ accessCode: code })
        });

        if (!response.ok) {
            throw new Error('Invalid access code.');
        }

        const student = await response.json();
        
        // Create the user object to store in the browser
        const userToStore = {
            studentId: student.StudentID,
            name: `${student.FirstName} ${student.LastName}`,
            details: `Student ID: ${student.StudentID}` // Simplified details
        };

        localStorage.setItem('currentStudent', JSON.stringify(userToStore));
        window.location.href = '/chat.html';

    } catch (error) {
        alert('Invalid access code. Please try again.');
        accessCodeInput.value = '';
    }
});
