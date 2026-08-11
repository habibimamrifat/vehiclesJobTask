import { Router } from 'express';
import { VehicleController } from './vehicles.controller.js';
import { VehicleService } from './vehicles.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
} from './vehicles.validation.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validation.middleware.js';

const vehicleRoutes = Router();

const vehicleService = new VehicleService();
const vehicleController = new VehicleController(vehicleService);

vehicleRoutes.get(
  '/',
  authenticate(),
  vehicleController.getVehicles.bind(vehicleController),
);

vehicleRoutes.get(
  '/:id',
  authenticate(),
  vehicleController.getVehicle.bind(vehicleController),
);

vehicleRoutes.post(
  '/',
  authenticate(),
  upload.single('photo'),
  validate(createVehicleSchema),
  vehicleController.createVehicle.bind(vehicleController),
);

vehicleRoutes.put(
  '/:id',
  authenticate(),
  upload.single('photo'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle.bind(vehicleController),
);

vehicleRoutes.delete(
  '/:id',
  authenticate(),
  vehicleController.deleteVehicle.bind(vehicleController),
);

export default vehicleRoutes;