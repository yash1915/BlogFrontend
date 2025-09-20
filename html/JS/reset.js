// JS/reset.js - Corrected Code
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const IS_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = IS_DEVELOPMENT
      ? 'http://localhost:3000'
      : 'https://blogbackend-gcc4.onrender.com';

    if (!token) {
        alert("Invalid or missing reset token.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password: newPassword, confirmPassword })
        });
        const data = await res.json();
        if(data.success) {
            alert('Password has been reset successfully! Please log in again.');
            localStorage.clear(); 
            window.location.href = 'signin.html';
        } else {
            alert('Error: ' + data.message);
        }
    } catch(err) {
        alert('An error occurred.');
    }
});