const backend = "https://recipe-app-5cgv.onrender.com";

if (window.location.pathname.includes("recipe.html")) {
  if (!localStorage.getItem("userId")) {
    alert("Login required");
    window.location.href = "login.html";
  }
}

document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!/^[a-zA-Z ]{4,30}$/.test(username)) {
      alert(
        "Username must be 4-30 characters and contain only letters and spaces.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    const res = await fetch(`${backend}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert("User successfully registered. Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }
  });

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("regPassword").value;

  if (username.length < 4) {
    alert("Username must be at least 4 characters.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  const res = await fetch(`${backend}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (data.success) {
    alert(data.message);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);
    localStorage.setItem("isChef", data.isChef);

    if (data.isChef) {
      window.location.href = "chef.html";
    } else {
      window.location.href = "recipe.html";
    }
  } else {
    alert(data.message);
  }
});

document.getElementById("recipeForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const image = document.getElementById("image").value.trim();

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const title = document.getElementById("title").value.trim();
  const time = document.getElementById("prepTime").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const ingredients = document.getElementById("ingredients").value.trim();
  const steps = document.getElementById("steps").value.trim();

  if (!/^[a-zA-Z\s.,'()-]{3,15}$/.test(title)) {
    alert(
      "Recipe title must be 3-15 characters and contain only letters, spaces, or punctuation.",
    );
    return;
  }

  if (!/^\d+$/.test(time) || Number(time) < 1 || Number(time) > 300) {
    alert("Preparation time must be a number between 1 and 300 minutes.");
    return;
  }

  if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
    alert("Please select a valid difficulty.");
    return;
  }

  if (ingredients.length < 10 || !/([a-zA-Z]{3,})/.test(ingredients)) {
    alert(
      "Ingredients must be realistic and contain proper words (at least 3 letters each).",
    );
    return;
  }

  if (steps.length < 20 || !/[a-zA-Z]/.test(steps)) {
    alert(
      "Steps must be realistic instructions containing proper words and at least 20 characters.",
    );
    return;
  }

  const recipe = { title, time, difficulty, ingredients, steps, userId, image };

  const res = await fetch(`${backend}/api/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById("successMsg").style.display = "block";
    e.target.reset();
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else {
    alert(data.message);
  }
});

const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");

if (imageInput && preview) {
  imageInput.addEventListener("input", function () {
    const url = this.value.trim();
    if (url) preview.src = url;
    else preview.src = "images/default.jpg";
  });
}

function togglePassword() {
  const pass = document.getElementById("regPassword");
  pass.type = pass.type === "password" ? "text" : "password";
}
