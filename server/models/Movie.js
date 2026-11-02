const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }],
    language: { type: String, default: "English" },
    duration: { type: Number, required: true }, // minutes
    releaseDate: { type: Date },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    cast: [{ type: String }],
    posterUrl: { type: String },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon", "ended"],
      default: "now_showing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);