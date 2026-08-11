import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import type Joi from 'joi';

type ValidationTarget =
  | 'body'
  | 'query'
  | 'params';

export const validate = (
  schema: Joi.ObjectSchema,
  target: ValidationTarget = 'body',
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const { error } = schema.validate(
      req[target],
      {
        abortEarly: false,
      },
    );

    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map(
          (detail) => detail.message,
        ),
      });

      return;
    }

    next();
  };
};