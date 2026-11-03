const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rows: { type: Number, required: true, min: 1, max: 26 },
  seatsPerRow: { type: Number, required: true, min: 1, max: 50 },
});

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    screens: {
      type: [screenSchema],
      validate: (v) => v.length > 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);