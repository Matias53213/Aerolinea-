document.addEventListener("DOMContentLoaded", () => {
  const guestView = document.getElementById("guest-view");
  const userView = document.getElementById("user-view");
  const welcomeUser = document.getElementById("welcome-user");

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (username && token) {
    guestView.style.display = "none";
    userView.style.display = "";
    welcomeUser.innerHTML = `Bienvenido, <strong>${username}</strong>`;
  } else {
    userView.style.display = "none";
  }

  const logoutBtn = document.getElementById("logout");
  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    location.reload();
  });
});