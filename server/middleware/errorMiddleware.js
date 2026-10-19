export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  // If status is 200, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`❌ [API Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
