const express = require("express");
const {
  addTheatre,
  getTheatres,
  getTheatreById,
} = require("../controllers/theatreController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getTheatres);
router.get("/:id", getTheatreById);
router.post("/", protect, adminOnly, addTheatre);

module.exports = router;