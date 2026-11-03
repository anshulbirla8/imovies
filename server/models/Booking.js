const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    seats: {
      type: [String],
      validate: [(arr) => arr.length > 0, "At least one seat is required"],
    },
    totalAmount: { type: Number, required: true },
    showStartTime: { type: Date, required: true }, // copied from the show for easy filtering
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, showStartTime: -1 });

module.exports = mongoose.model("Booking", bookingSchema);