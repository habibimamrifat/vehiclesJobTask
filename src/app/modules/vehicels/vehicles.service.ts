import db from '../../database/knex.js';
import { CloudinaryService } from '../../helpers/cloudinary.service.js';
import type { CreateVehicleData, UpdateVehicleData, Vehicle } from './vehicles.types.js'

export class VehicleService {
  private readonly cloudinaryService = new CloudinaryService();

  async getVehicles(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
  ) {
    const offset = (page - 1) * limit;

    const query = db('vehicles')
      .whereNull('deleted_at')
      .select(
        'id',
        'name',
        'plate_number',
        'category',
        'daily_rate',
        'photo_path',
        'created_at',
        'updated_at',
      );

    if (category) {
      query.where('category', category);
    }

    if (search) {
      query.whereILike('name', `%${search}%`);
    }

    const countQuery = query.clone().clearSelect().clearOrder().count('* as count');

    const [vehicles, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVehicle(id: number) {
    return db('vehicles')
      .where({
        id,
      })
      .whereNull('deleted_at')
      .first();
  }

async createVehicle(data: CreateVehicleData) {
  let photoUrl: string | undefined;

  if (data.photo_path) {
    photoUrl =
      await this.cloudinaryService.uploadImage(
        data.photo_path,
      );
  }

  const [vehicle] = await db('vehicles')
    .insert({
      ...data,
      photo_path: photoUrl,
    })
    .returning([
      'id',
      'name',
      'plate_number',
      'category',
      'daily_rate',
      'photo_path',
      'created_at',
      'updated_at',
    ]);

  return vehicle;
}

async updateVehicle(
  id: number,
  data: UpdateVehicleData,
) {
  const existingVehicle = await this.getVehicle(id);

  if (!existingVehicle) {
    return null;
  }

  let photoUrl = existingVehicle.photo_path;

  if (data.photo_path) {
    // Upload new image first
    photoUrl =
      await this.cloudinaryService.uploadImage(
        data.photo_path,
      );

    // Delete old image after successful upload
    if (existingVehicle.photo_path) {
      await this.cloudinaryService.deleteImage(
        existingVehicle.photo_path,
      );
    }
  }

  const [vehicle] = await db('vehicles')
    .where({
      id,
    })
    .whereNull('deleted_at')
    .update({
      ...data,
      photo_path: photoUrl,
      updated_at: db.fn.now(),
    })
    .returning([
      'id',
      'name',
      'plate_number',
      'category',
      'daily_rate',
      'photo_path',
      'created_at',
      'updated_at',
    ]);

  return vehicle;
}

  async deleteVehicle(id: number) {
    const vehicle = await this.getVehicle(id);

    if (!vehicle) {
      return null;
    }

    await db('vehicles')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

    return true;
  }
}