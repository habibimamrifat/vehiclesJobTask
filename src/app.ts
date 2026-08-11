import express from "express";
import appRouter from "./app/routes/app.routes.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeller.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", appRouter);
app.get("/", (_req, res) => {
  res.send("Vehicle Rental API is running");
});
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(globalErrorHandler);

export default app;
