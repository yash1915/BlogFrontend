// JS/signin.js - Corrected Code
document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");

  const IS_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE_URL = IS_DEVELOPMENT
    ? 'http://localhost:3000'
    : 'https://blogbackend-gcc4.onrender.com';

  if (localStorage.getItem("token")) {
    window.location.href = "hom.html";
    return;
  }

  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "hom.html";
      } else {
        alert(data.message || "Login failed!");
      }
    } catch (error) {
      alert("An error occurred during login.");
    }
  });
});