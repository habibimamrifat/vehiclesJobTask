import type { Request, Response } from 'express';
import type { RentalService } from './rental.service.js';


export class RentalController {
  constructor(
    private readonly rentalService: RentalService,
  ) {}

  async getRentals(
    req: Request,
    res: Response,
  ): Promise<void> {
    const vehicleId = req.query.vehicle_id
      ? Number(req.query.vehicle_id)
      : undefined;

    const status =
      typeof req.query.status === 'string'
        ? req.query.status
        : undefined;

    const startDate =
      typeof req.query.start_date === 'string'
        ? req.query.start_date
        : undefined;

    const endDate =
      typeof req.query.end_date === 'string'
        ? req.query.end_date
        : undefined;

    const rentals =
      await this.rentalService.getRentals(
        vehicleId,
        status,
        startDate,
        endDate,
      );

    res.status(200).json(rentals);
  }

  async getRental(
    req: Request,
    res: Response,
  ): Promise<void> {
    const id = Number(req.params.id);

    const rental =
      await this.rentalService.getRental(id);

    if (!rental) {
      res.status(404).json({
        message: 'Rental not found',
      });

      return;
    }

    res.status(200).json(rental);
  }

  async createRental(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const rental =
        await this.rentalService.createRental(req.body);

      res.status(201).json(rental);
    } catch (error) {
      const statusCode =
        (error as Error & {
          statusCode?: number;
        }).statusCode ?? 500;

      res.status(statusCode).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create rental',
      });
    }
  }

  async updateRental(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const id = Number(req.params.id);

      const rental =
        await this.rentalService.updateRental(
          id,
          req.body,
        );

      if (!rental) {
        res.status(404).json({
          message: 'Rental not found',
        });

        return;
      }

      res.status(200).json(rental);
    } catch (error) {
      const statusCode =
        (error as Error & {
          statusCode?: number;
        }).statusCode ?? 500;

      res.status(statusCode).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update rental',
      });
    }
  }

async deleteRental(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  const result =
    await this.rentalService.deleteRental(id);

  if (!result) {
    res.status(404).json({
      message: 'Rental not found',
    });

    return;
  }

  res.status(200).json(result);
}
}