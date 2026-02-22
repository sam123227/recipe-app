const backend = "http://localhost:8081";

function openRecipe(title, meta, ingredients, steps) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMeta").innerText = meta;
  document.getElementById("modalIngredients").innerText = ingredients;
  document.getElementById("modalSteps").innerText = steps;

  document.getElementById("modal").style.display = "flex";
}

function closeRecipe() {
  document.getElementById("modal").style.display = "none";
}

function searchRecipe(text) {
  text = text.toLowerCase();

  document.querySelectorAll("#recipes article").forEach((card) => {
    card.style.display = card.innerText.toLowerCase().includes(text)
      ? "block"
      : "none";
  });
}

function goToAddRecipe() {
  const userId = localStorage.getItem("userId");

  if (userId) {
    window.location.href = "recipe.html";
  } else {
    window.location.href = "login.html";
  }
}

async function loadRecipes() {
  try {
    const res = await fetch(`${backend}/api/recipes`);
    const recipes = await res.json();

    let html = "";

    if (recipes.length === 0) {
      html =
        "<p style='text-align:center; padding:20px; color:#888;'>No approved recipes yet. Waiting for chef approval...</p>";
    } else {
      recipes.forEach((r) => {
        const title = r.title
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        const username = (r.user?.username || "Unknown")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        html += `
          <article class="card">
            <img src="${r.image || "default.jpg"}" alt="${r.title}">
            <h3>${title}</h3>
            <p>Prep: ${r.time} min | Difficulty: ${r.difficulty}</p>
            <p>Added by: ${username}</p>

            <button onclick="openRecipe(
              '${title}',
              'Prep: ${r.time} min | Difficulty: ${r.difficulty}',
              '${r.ingredients.replace(/\n/g, "\\n")}',
              '${r.steps.replace(/\n/g, "\\n")}'
            )">
              View Recipe
            </button>
          </article>
        `;
      });
    }

    document.getElementById("recipes").innerHTML = html;
  } catch (err) {
    console.log("Error loading recipes:", err);
  }
}

loadRecipes();
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    alert("Logged out successfully!");
    location.reload();
  }
}

const username = localStorage.getItem("username");
if (username) {
  const initials = username.substring(0, 2).toUpperCase();

  document.getElementById("userAvatar").innerHTML = `
    <div title="${username}" style="width:45px; height:45px; border-radius:50%; background:#e74c3c; color:white; display:flex; align-items:center; justify-content:center; 
    font-weight:bold; font-size:16px; cursor:pointer;">
      ${initials}
    </div>
  `;
}
