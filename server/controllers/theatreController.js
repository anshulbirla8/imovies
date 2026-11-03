const Theatre = require("../models/Theatre");

// POST /api/theatres (admin)
exports.addTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json(theatre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/theatres?city=Bhopal
exports.getTheatres = async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = { $regex: `^${req.query.city}$`, $options: "i" };
    const theatres = await Theatre.find(filter).sort({ name: 1 });
    res.json(theatres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/theatres/:id
exports.getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });
    res.json(theatre);
  } catch (err) {
    res.status(400).json({ message: "Invalid theatre id" });
  }
};