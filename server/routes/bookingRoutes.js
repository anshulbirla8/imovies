const express = require("express");
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every booking route needs a logged-in user

router.post("/", createBooking);
router.get("/my", getMyBookings); // must stay above "/:id"
router.get("/:id", getBookingById);
router.put("/:id/cancel", cancelBooking);

module.exports = router;