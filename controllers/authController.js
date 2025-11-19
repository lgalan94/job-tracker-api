const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// =======================================================
// Helper: Create JWT with user info
// =======================================================
function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || "",
    },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
}

// =======================================================
// REGISTER (email + password)
// =======================================================
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ email, password: hashedPassword, name });

    // Generate token
    const token = signToken(user);

    res.json({ msg: "Registered", token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =======================================================
// LOGIN (email + password)
// =======================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Check if password exists (Google login users won't have password)
    if (!user.password)
      return res.status(400).json({ msg: "This account uses Google login" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate token
    const token = signToken(user);

    res.json({ msg: "Logged in", token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =======================================================
// GOOGLE LOGIN
// =======================================================
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
      });
    }

    // Generate token
    const token = signToken(user);

    res.json({ msg: "Logged in", token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
