import { Router } from 'express';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { loginSchema } from './auth.validation.js';
import { validate } from '../../middleware/validation.middleware.js';

const authRoutes = Router();

const authService = new AuthService();
const authController =
  new AuthController(authService);

authRoutes.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController),
);

authRoutes.post(
  '/logout',
  authenticate(),
  authController.logout.bind(authController),
);

authRoutes.get(
  '/me',
  authenticate(),
  authController.me.bind(authController),
);

export default authRoutes;