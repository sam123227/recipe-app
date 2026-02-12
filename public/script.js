const backend = "/api";

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

  document.querySelectorAll("#recipes article").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(text)
      ? "block"
      : "none";
  });
}

async function loadRecipes() {
  try {
    const res = await fetch(`${backend}/api/recipes`);
    const recipes = await res.json();

    let html = "";

    recipes.forEach(r => {
      html += `
        <article class="card">
          <img src="${r.image || 'default.jpg'}" alt="${r.title}">
          <h3>${r.title}</h3>
          <p>Prep: ${r.time} • ${r.difficulty}</p>
          <p>By: ${r.user?.username || "Unknown"}</p>

          <button onclick="openRecipe(
            '${r.title}',
            'Prep: ${r.time} • ${r.difficulty}',
            '${r.ingredients.replace(/\n/g, "\\n")}',
            '${r.steps.replace(/\n/g, "\\n")}'
          )">
            View Recipe
          </button>
        </article>
      `;
    });

    document.getElementById("recipes").innerHTML = html;

  } catch (err) {
    console.log("Error loading recipes:", err);
  }
}

// Load recipes when page opens
loadRecipes();
