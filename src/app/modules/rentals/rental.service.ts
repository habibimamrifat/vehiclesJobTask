import type { Knex } from "knex";
import db from "../../database/knex.js";
import type { CreateRentalData, UpdateRentalData } from "./rental.type.js";

export class RentalService {
  async getRentals(
    vehicleId?: number,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const query = db("rentals")
      .join("vehicles", "rentals.vehicle_id", "vehicles.id")
      .select(
        "rentals.*",
        "vehicles.name as vehicle_name",
        "vehicles.plate_number",
      );

    if (vehicleId) {
      query.where("rentals.vehicle_id", vehicleId);
    }

    if (status) {
      query.where("rentals.status", status);
    }

    if (startDate) {
      query.where("rentals.end_date", ">=", startDate);
    }

    if (endDate) {
      query.where("rentals.start_date", "<=", endDate);
    }

    return query.orderBy("rentals.start_date", "desc");
  }

  async getRental(id: number) {
    return db("rentals")
      .join("vehicles", "rentals.vehicle_id", "vehicles.id")
      .select(
        "rentals.*",
        "vehicles.name as vehicle_name",
        "vehicles.plate_number",
      )
      .where("rentals.id", id)
      .first();
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference = end.getTime() - start.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }

  async checkVehicleAvailability(
    vehicleId: number,
    startDate: string,
    endDate: string,
    connection: Knex | Knex.Transaction = db,
    excludeRentalId?: number,
  ) {
    const query = connection("rentals")
      .where({
        vehicle_id: vehicleId,
      })
      .whereNot("status", "cancelled")
      .where("start_date", "<=", endDate)
      .where("end_date", ">=", startDate);

    if (excludeRentalId) {
      query.whereNot("id", excludeRentalId);
    }

    const rental = await query.first();

    return !rental;
  }

  async createRental(data: CreateRentalData) {
    return db.transaction(async (trx) => {
      const vehicle = await trx("vehicles")
        .where({
          id: data.vehicle_id,
        })
        .whereNull("deleted_at")
        .forUpdate()
        .first();

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      const available = await this.checkVehicleAvailability(
        data.vehicle_id,
        data.start_date,
        data.end_date,
        trx,
      );

      if (!available) {
        const error = new Error(
          "Vehicle already has an active rental during these dates",
        );

        (
          error as Error & {
            statusCode?: number;
          }
        ).statusCode = 409;

        throw error;
      }

      const days = this.calculateDays(data.start_date, data.end_date);

      const totalAmount = Number(vehicle.daily_rate) * days;

      const [rental] = await trx("rentals")
        .insert({
          vehicle_id: data.vehicle_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          start_date: data.start_date,
          end_date: data.end_date,
          total_amount: totalAmount,
          status: "booked",
        })
        .returning("*");

      return rental;
    });
  }

  async updateRental(id: number, data: UpdateRentalData) {
    return db.transaction(async (trx) => {
      const rental = await trx("rentals").where({ id }).first();

      if (!rental) {
        return null;
      }

      const vehicleId = data.vehicle_id ?? rental.vehicle_id;

      const startDate = data.start_date ?? rental.start_date;

      const endDate = data.end_date ?? rental.end_date;

      const datesChanged =
        data.vehicle_id !== undefined ||
        data.start_date !== undefined ||
        data.end_date !== undefined;

      let totalAmount = rental.total_amount;

      if (datesChanged) {
        const vehicle = await trx("vehicles")
          .where({
            id: vehicleId,
          })
          .whereNull("deleted_at")
          .forUpdate()
          .first();

        if (!vehicle) {
          throw new Error("Vehicle not found");
        }

        const available = await this.checkVehicleAvailability(
          vehicleId,
          startDate,
          endDate,
          trx,
          id,
        );

        if (!available) {
          const error = new Error(
            "Vehicle already has an active rental during these dates",
          );

          (
            error as Error & {
              statusCode?: number;
            }
          ).statusCode = 409;

          throw error;
        }

        const days = this.calculateDays(startDate, endDate);

        totalAmount = Number(vehicle.daily_rate) * days;
      }

      const [updatedRental] = await trx("rentals")
        .where({ id })
        .update({
          ...data,
          total_amount: totalAmount,
          updated_at: trx.fn.now(),
        })
        .returning("*");

      return updatedRental;
    });
  }

  async deleteRental(id: number) {
    const rental = await db("rentals").where({ id }).first();

    if (!rental) {
      return null;
    }

    await db("rentals").where({ id }).delete();

    return {
      message: "Rental deleted successfully",
    };
  }
}
