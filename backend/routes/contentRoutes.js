const express = require("express");
const router = express.Router();

router.post("/generate", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt required" });
  }

  res.json({
    success: true,
    data: `AI Generated: ${prompt}`
  });
});

module.exports = router;
