const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Show = require("../models/Show");

const MAX_SEATS = 10;

const populateShow = {
  path: "show",
  select: "screenName startTime price",
  populate: [
    { path: "movie", select: "title posterUrl" },
    { path: "theatre", select: "name city address" },
  ],
};

// POST /api/bookings   body: { showId, seats: ["A1","A2"] }
exports.createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    if (!mongoose.isValidObjectId(showId)) {
      return res.status(400).json({ message: "Invalid show id" });
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Please select at least one seat" });
    }

    const cleanSeats = [...new Set(seats.map((s) => String(s).trim().toUpperCase()))];
    if (cleanSeats.length > MAX_SEATS) {
      return res
        .status(400)
        .json({ message: `You can book at most ${MAX_SEATS} seats at a time` });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });
    if (show.startTime <= new Date()) {
      return res.status(400).json({ message: "This show has already started" });
    }

    // Check every seat exists in this screen's layout (rows A.., numbers 1..seatsPerRow)
    for (const seat of cleanSeats) {
      const match = /^([A-Z])(\d{1,2})$/.exec(seat);
      const rowIndex = match ? match[1].charCodeAt(0) - 65 : -1;
      const number = match ? parseInt(match[2], 10) : 0;
      if (rowIndex < 0 || rowIndex >= show.rows || number < 1 || number > show.seatsPerRow) {
        return res.status(400).json({ message: `Invalid seat: ${seat}` });
      }
    }

    // Atomic step: only succeeds if NONE of the seats are already booked
    const updated = await Show.findOneAndUpdate(
      { _id: showId, bookedSeats: { $nin: cleanSeats } },
      { $push: { bookedSeats: { $each: cleanSeats } } },
      { new: true }
    );
    if (!updated) {
      return res
        .status(409)
        .json({ message: "One or more selected seats are already booked" });
    }

    try {
      const booking = await Booking.create({
        user: req.user._id,
        show: show._id,
        seats: cleanSeats,
        totalAmount: show.price * cleanSeats.length,
        showStartTime: show.startTime,
      });
      res.status(201).json(booking);
    } catch (err) {
      // Booking could not be saved, so release the seats again
      await Show.updateOne(
        { _id: showId },
        { $pull: { bookedSeats: { $in: cleanSeats } } }
      );
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my?type=upcoming|past
exports.getMyBookings = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.type === "upcoming") {
      filter.showStartTime = { $gte: new Date() };
      filter.status = "confirmed";
    } else if (req.query.type === "past") {
      filter.showStartTime = { $lt: new Date() };
    }

    const bookings = await Booking.find(filter)
      .populate(populateShow)
      .sort({ showStartTime: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findById(req.params.id).populate(populateShow);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to view this booking" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to cancel this booking" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    const oneHour = 60 * 60 * 1000;
    if (booking.showStartTime - Date.now() < oneHour) {
      return res
        .status(400)
        .json({ message: "Bookings cannot be cancelled within 1 hour of the show" });
    }

    // Only one cancel request can flip confirmed -> cancelled
    const cancelled = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "confirmed" },
      { status: "cancelled", cancelledAt: new Date() },
      { new: true }
    );
    if (!cancelled) {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Free the seats for other people
    await Show.updateOne(
      { _id: booking.show },
      { $pull: { bookedSeats: { $in: booking.seats } } }
    );

    res.json({ message: "Booking cancelled", booking: cancelled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};