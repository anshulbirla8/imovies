const Movie = require("../models/Movie");

// POST /api/movies (protected)
exports.addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/movies?page=1&limit=10&genre=Sci-Fi&search=incep&status=now_showing
exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

    const total = await Movie.countDocuments(filter);
    const movies = await Movie.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ page, pages: Math.ceil(total / limit), total, movies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/movies/:id
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(400).json({ message: "Invalid movie id" });
  }
};
