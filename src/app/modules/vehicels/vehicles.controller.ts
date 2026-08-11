import type { Request, Response } from 'express';
import { VehicleService } from './vehicles.service.js';

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  async getVehicles(
    req: Request,
    res: Response,
  ): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const category =
      typeof req.query.category === 'string'
        ? req.query.category
        : undefined;

    const search =
      typeof req.query.search === 'string'
        ? req.query.search
        : undefined;

    const result = await this.vehicleService.getVehicles(
      page,
      limit,
      category,
      search,
    );

    res.status(200).json(result);
  }

  async getVehicle(
    req: Request,
    res: Response,
  ): Promise<void> {
    const id = Number(req.params.id);

    const vehicle = await this.vehicleService.getVehicle(id);

    if (!vehicle) {
      res.status(404).json({
        message: 'Vehicle not found',
      });
      return;
    }

    res.status(200).json(vehicle);
  }

  async createVehicle(
    req: Request,
    res: Response,
  ): Promise<void> {
    const vehicle = await this.vehicleService.createVehicle({
      ...req.body,
      daily_rate: Number(req.body.daily_rate),
      photo_path: req.file?.path,
    });

    res.status(201).json(vehicle);
  }

  async updateVehicle(
    req: Request,
    res: Response,
  ): Promise<void> {
    const id = Number(req.params.id);

    const data = {
      ...req.body,
      ...(req.body.daily_rate !== undefined && {
        daily_rate: Number(req.body.daily_rate),
      }),
      ...(req.file && {
        photo_path: req.file.path,
      }),
    };

    const vehicle = await this.vehicleService.updateVehicle(
      id,
      data,
    );

    if (!vehicle) {
      res.status(404).json({
        message: 'Vehicle not found',
      });
      return;
    }

    res.status(200).json(vehicle);
  }

  async deleteVehicle(
    req: Request,
    res: Response,
  ): Promise<void> {
    const id = Number(req.params.id);

    const deleted = await this.vehicleService.deleteVehicle(id);

    if (!deleted) {
      res.status(404).json({
        message: 'Vehicle not found',
      });
      return;
    }

    res.status(204).send();
  }
}