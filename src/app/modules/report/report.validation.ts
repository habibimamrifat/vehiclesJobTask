import Joi from 'joi';

export const rentalReportSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required(),

  vehicle_id: Joi.number()
    .integer()
    .positive()
    .optional(),
});