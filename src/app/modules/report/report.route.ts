import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

import { ReportsService } from './report.service.js';
import { ReportsController } from './report.controller.js';
import { rentalReportSchema } from './report.validation.js';

const reportsRoutes = Router();

const reportsService = new ReportsService();

const reportsController = new ReportsController(
  reportsService,
);

reportsRoutes.get(
  '/rentals',
  authenticate(),
  validate(rentalReportSchema, 'query'),
  reportsController.getRentalReport.bind(
    reportsController,
  ),
);

export default reportsRoutes;