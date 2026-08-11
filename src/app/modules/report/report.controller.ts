import type { Request, Response } from 'express';
import type { ReportsService } from './report.service.js';


export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  async getRentalReport(
    req: Request,
    res: Response,
  ): Promise<void> {
    const month =
      typeof req.query.month === 'string'
        ? req.query.month
        : undefined;

    const vehicleId =
      typeof req.query.vehicle_id === 'string'
        ? Number(req.query.vehicle_id)
        : undefined;

    if (!month) {
      res.status(400).json({
        message: 'month is required',
      });

      return;
    }

    const report =
      await this.reportsService.getRentalReport(
        month,
        vehicleId,
      );

    res.status(200).json(report);
  }
}