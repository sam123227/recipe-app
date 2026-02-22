require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isChef: { type: Boolean, default: false },
});

const recipeSchema = new mongoose.Schema({
  title: String,
  time: String,
  difficulty: String,
  ingredients: String,
  steps: String,
  image: { type: String, default: "images/default.jpg" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Recipe = mongoose.model("Recipe", recipeSchema);

app.get("/test", (req, res) => {
  res.send("Backend working");
});

app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ success: true, message: "User successfully registered" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ username, email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid login" });
    }

    res.json({
      success: true,
      message: "Login successful",
      userId: user._id,
      username: user.username,
      isChef: user.isChef,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const { title, time, difficulty, ingredients, steps, userId, image } =
      req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid user. Please login again." });
    }

    const recipe = new Recipe({
      title,
      time,
      difficulty,
      ingredients,
      steps,
      image: image || "images/default.jpg",
      user: userId,
      status: "pending",
    });

    await recipe.save();

    res.json({
      success: true,
      message: "Recipe submitted! Waiting for chef approval.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get("/api/recipes", async (req, res) => {
  const recipes = await Recipe.find({ status: "approved" })
    .populate("user", "username")
    .sort({ createdAt: -1 });
  res.json(recipes);
});

app.get("/api/recipes/pending", async (req, res) => {
  const recipes = await Recipe.find({ status: "pending" })
    .populate("user", "username")
    .sort({ createdAt: -1 });
  res.json(recipes);
});

app.put("/api/recipes/:id/approve", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    );
    res.json({ success: true, message: "Recipe approved!", recipe });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put("/api/recipes/:id/reject", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );
    res.json({ success: true, message: "Recipe rejected", recipe });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
