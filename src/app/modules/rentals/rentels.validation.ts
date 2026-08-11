import Joi from 'joi';

export const createRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  customer_name: Joi.string().trim().required(),
  customer_phone: Joi.string().trim().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
});

export const updateRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  customer_name: Joi.string().trim(),
  customer_phone: Joi.string().trim(),
  start_date: Joi.date(),
  end_date: Joi.date(),
  status: Joi.string().valid(
    'booked',
    'ongoing',
    'completed',
    'cancelled',
  ),
}).min(1);