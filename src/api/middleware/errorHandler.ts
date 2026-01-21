import { Request, Response, NextFunction } from 'express';
import { APIError, InternalServerError } from '../../pkg/error/error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof APIError) {
    return res.status(err.getStatusCode()).json({
      success: false,
      error: err.toJSON()
    });
  }

  const intError = new InternalServerError();
  res.status(intError.getStatusCode()).json({
    success: false,
    error: intError.toJSON(),
  });
};

export default errorHandler;
