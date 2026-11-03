const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");

// POST /api/shows (admin)
exports.addShow = async (req, res) => {
  try {
    const { movie, theatre, screenName, startTime, price } = req.body;

    const movieDoc = await Movie.findById(movie);
    if (!movieDoc) return res.status(404).json({ message: "Movie not found" });

    const theatreDoc = await Theatre.findById(theatre);
    if (!theatreDoc) return res.status(404).json({ message: "Theatre not found" });

    const screen = theatreDoc.screens.find((s) => s.name === screenName);
    if (!screen) {
      return res.status(400).json({ message: "Screen not found in this theatre" });
    }

    const show = await Show.create({ movie, theatre, screenName, startTime, price });
    res.status(201).json(show);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/shows?movie=<id>&theatre=<id>&date=2026-11-05
exports.getShows = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movie) filter.movie = req.query.movie;
    if (req.query.theatre) filter.theatre = req.query.theatre;

    if (req.query.date) {
      const start = new Date(`${req.query.date}T00:00:00.000Z`);
      if (isNaN(start)) return res.status(400).json({ message: "Invalid date" });
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      filter.startTime = { $gte: start, $lt: end };
    }

    const shows = await Show.find(filter)
      .populate("movie", "title duration posterUrl")
      .populate("theatre", "name city")
      .sort({ startTime: 1 });

    res.json(shows);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/shows/:id  (includes the seat map)
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie", "title duration posterUrl")
      .populate("theatre", "name city address screens");

    if (!show) return res.status(404).json({ message: "Show not found" });

    const screen = show.theatre.screens.find((s) => s.name === show.screenName);

    res.json({
      _id: show._id,
      movie: show.movie,
      theatre: { _id: show.theatre._id, name: show.theatre.name, city: show.theatre.city },
      screenName: show.screenName,
      startTime: show.startTime,
      price: show.price,
      layout: screen ? { rows: screen.rows, seatsPerRow: screen.seatsPerRow } : null,
      bookedSeats: show.bookedSeats,
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid show id" });
  }
};

// DELETE /api/shows/:id (admin)
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ message: "Show deleted" });
  } catch (err) {
    res.status(400).json({ message: "Invalid show id" });
  }
};