const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "API route working 🚀" });
});

module.exports = router;