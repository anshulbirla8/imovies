const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", required: true },
    screenName: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    bookedSeats: [{ type: String }], // e.g. "A1", "B7"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", showSchema);