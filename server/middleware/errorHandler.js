/**
 * middleware/errorHandler.js — Centralised Express error handler
 *
 * Must be registered LAST via app.use(errorHandler).
 * Any route/controller can call next(err) or throw inside an async wrapper
 * to reach this handler.
 */

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV !== 'production';

  // PostgreSQL unique-constraint violation → friendly duplicate error
  if (err.code === '23505') {
    return res.status(409).json({ message: 'That email address is already registered.' });
  }

  // PostgreSQL foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource does not exist.' });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message    = err.message || 'Internal server error.';

  if (isDev) {
    console.error(`[${req.method} ${req.path}]`, err);
  }

  res.status(statusCode).json({
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
