import { Router } from "express";
import vehicleRoutes from "../modules/vehicels/vehicles.routes.js";
import rentalRoutes from "../modules/rentals/rntal.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import reportsRoutes from "../modules/report/report.route.js";

const appRoutes = [
  {
    path: "/vehicle",
    route: vehicleRoutes,
  },
  {
    path: "/rental",
    route: rentalRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/report",
    route: reportsRoutes,
  },
];

const appRouter = Router();

appRoutes.forEach((route) => {
  appRouter.use(route.path, route.route);
});

export default appRouter;
