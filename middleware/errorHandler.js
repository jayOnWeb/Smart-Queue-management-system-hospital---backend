const errorHandler = (err, req, res, next) => {
  
  console.error(' Error:', err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for "${field}". This ${field} already exists.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
