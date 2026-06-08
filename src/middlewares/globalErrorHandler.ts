/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import env from '../config/env';
import AppError from '../errorHelpers/AppError';
import { ZodError } from 'zod';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'An unexpected error occurred.';

  // Create a structured error response
  const errorResponse = {
    success: false,
    message,
    errorDetails: err,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Handle specific error types
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    errorResponse.message = 'Validation Error';
    errorResponse.errorDetails = [ ...issues ];
    statusCode = StatusCodes.BAD_REQUEST;
  } else if (err.name === 'CastError') {
    errorResponse.message = `Invalid ID: ${err.value}`;
    statusCode = StatusCodes.BAD_REQUEST;
  } else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    errorResponse.message = `Invalid input data. ${errors.join('. ')}`;
    statusCode = StatusCodes.BAD_REQUEST;
  } else if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token. Please log in again.';
    statusCode = StatusCodes.UNAUTHORIZED;
  } else if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Your token has expired. Please log in again.';
    statusCode = StatusCodes.UNAUTHORIZED;
  } else if (!(err instanceof AppError)) {
    // For unhandled errors, provide a generic message in production
    if (env.NODE_ENV === 'production') {
      errorResponse.message = 'Something went wrong!';
      errorResponse.errorDetails = null;
    }
  }

  // Send the response
  res.status(statusCode).json(errorResponse);
};

export { globalErrorHandler };