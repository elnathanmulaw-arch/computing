function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error && error.name === "ZodError") {
    return res.status(400).json({
      error: "Validation failed.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error." });
}

module.exports = { errorHandler };
