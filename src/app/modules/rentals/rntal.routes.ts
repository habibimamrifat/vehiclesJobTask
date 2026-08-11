import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { RentalService } from './rental.service.js';
import { RentalController } from './rental.controller.js';
import { createRentalSchema, updateRentalSchema } from './rentels.validation.js';
import { validate } from '../../middleware/validation.middleware.js';

const rentalRoutes = Router();

const rentalService = new RentalService();
const rentalController =
  new RentalController(rentalService);

rentalRoutes.get(
  '/',
  authenticate(),
  rentalController.getRentals.bind(rentalController),
);

rentalRoutes.get(
  '/:id',
  authenticate(),
  rentalController.getRental.bind(rentalController),
);

rentalRoutes.post(
  '/',
  authenticate(),
  validate(createRentalSchema),
  rentalController.createRental.bind(rentalController),
);

rentalRoutes.put(
  '/:id',
  authenticate(),
  validate(updateRentalSchema),
  rentalController.updateRental.bind(rentalController),
);

rentalRoutes.delete(
  '/:id',
  authenticate(),
  rentalController.deleteRental.bind(rentalController),
);

export default rentalRoutes;