import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../pkg/system/validation/error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(422).json({
      success: false,
      error: err.toObject()
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};

export default errorHandler;
