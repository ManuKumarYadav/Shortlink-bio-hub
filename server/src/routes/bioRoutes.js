const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createBio,
  updateBio,
  getMyBio,
  getPublicBio,
} = require("../controllers/bioController");

const router = express.Router();

router.post("/", protect, createBio);
router.put("/", protect, updateBio);
router.get("/me", protect, getMyBio);
router.get("/:username", getPublicBio);

module.exports = router;
