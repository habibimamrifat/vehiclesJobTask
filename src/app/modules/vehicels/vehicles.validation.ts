import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  name: Joi.string().trim().required(),
  plate_number: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  daily_rate: Joi.number().positive().required(),
});

export const updateVehicleSchema = Joi.object({
  name: Joi.string().trim(),
  plate_number: Joi.string().trim(),
  category: Joi.string().trim(),
  daily_rate: Joi.number().positive(),
}).min(1);