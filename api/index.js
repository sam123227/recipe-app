require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err));

// ------------------ Schemas ------------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
  title: String,
  time: String,
  difficulty: String,
  ingredients: String,
  steps: String,
  image: { type: String, default: "images/default.jpg" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const User = mongoose.model("User", userSchema);
const Recipe = mongoose.model("Recipe", recipeSchema);

// ------------------ Test Route ------------------
app.get("/test", (req, res) => {
  res.send("Backend working");
});

// ------------------ Register ------------------
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.json({ success: true, message: "User successfully registered" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------ Login ------------------
app.post("/api/users/login", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ username, email, password });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid login" });
  }

  res.json({
    success: true,
    message: "Login successful",
    userId: user._id,
    username: user.username
  });
});

// ------------------ Add Recipe ------------------
app.post("/api/recipes", async (req, res) => {
  try {
    const { title, time, difficulty, ingredients, steps, userId, image } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(401).json({ success: false, message: "Invalid user. Please login again." });
    }

    const recipe = new Recipe({
      title,
      time,
      difficulty,
      ingredients,
      steps,
      image: image || "images/default.jpg",
      user: userId
    });

    await recipe.save();

    res.json({ success: true, message: "Recipe added successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ------------------ Fetch Recipes ------------------
app.get("/api/recipes", async (req, res) => {
  const recipes = await Recipe.find().populate("user", "username");
  res.json(recipes);
});

// ------------------ Start Server ------------------
module.exports = app;
