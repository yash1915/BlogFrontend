// JS/forgot.js - Corrected Code
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const button = e.target.querySelector('button');

    const IS_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = IS_DEVELOPMENT
      ? 'http://localhost:3000'
      : 'https://blogbackend-gcc4.onrender.com';

    button.disabled = true;
    button.textContent = 'Sending...';

    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.success) {
            alert('Password reset link sent to your email!');
            window.location.href = 'signin.html';
        } else {
            button.disabled = false;
            button.textContent = 'Send Password Reset Link';
            alert('Error: ' + data.message);
        }
    } catch (err) {
        button.disabled = false;
        button.textContent = 'Send Password Reset Link';
        alert('An error occurred. Please try again.');
    }
});