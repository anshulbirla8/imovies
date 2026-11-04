// Runs when no route matched
exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Runs when any route passes on an error
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id or value";
  } else if (err.code === 11000) {
    status = 400;
    message = "Duplicate value, that record already exists";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Not authorized, token invalid or expired";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  }

  if (status === 500) console.error(err); // log real server errors in the terminal

  res.status(status).json({
    message: status === 500 && process.env.NODE_ENV === "production" ? "Server error" : message,
  });
};