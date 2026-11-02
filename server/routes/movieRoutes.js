const express = require("express");
const { addMovie, getMovies, getMovieById } = require("../controllers/movieController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/", protect, addMovie);

module.exports = router;