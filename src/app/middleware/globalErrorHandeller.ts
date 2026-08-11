import type { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};