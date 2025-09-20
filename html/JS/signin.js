document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");

  if (localStorage.getItem("token")) {
    window.location.href = "hom.html"; // Redirect to index.html instead of home.html
    return;
  }

  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
        window.location.href = "hom.html";
      } else {
        alert(data.message || "Login failed!");
      }
    } catch (error) {
      alert("An error occurred during login.");
    }
  });
});
