const express = require("express");
const {
  addShow,
  getShows,
  getShowById,
  deleteShow,
} = require("../controllers/showController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getShows);
router.get("/:id", getShowById);
router.post("/", protect, adminOnly, addShow);
router.delete("/:id", protect, adminOnly, deleteShow);

module.exports = router;