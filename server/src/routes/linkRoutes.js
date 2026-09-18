const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createLink,
  getMyLinks,
  getSingleLink,
  deleteLink,
  getLinkAnalytics,
} = require("../controllers/linkController");

const {
  createLinkLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();

// Create link
router.post(
  "/",
  protect,
  createLinkLimiter,
  createLink
);

// Get user's links
router.get("/", protect, getMyLinks);

// Analytics
router.get(
  "/:id/analytics",
  protect,
  getLinkAnalytics
);

// Get one link
router.get("/:id", protect, getSingleLink);

// Delete link
router.delete("/:id", protect, deleteLink);

module.exports = router;