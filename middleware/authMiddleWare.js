const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Read token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded; // decoded contains { id }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
