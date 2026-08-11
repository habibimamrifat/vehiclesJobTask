import db from '../../database/knex.js';
import type { VehicleReport } from './report.type.js';



export class ReportsService {
  async getRentalReport(
    month: string,
    vehicleId?: number,
  ) {
    const monthStart = `${month}-01`;

    const nextMonth = new Date(`${monthStart}T00:00:00Z`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

    const nextMonthStart = nextMonth
      .toISOString()
      .slice(0, 10);

    /*
     * Find rentals that overlap the requested month.
     *
     * Rental overlaps month when:
     *
     * rental.start < nextMonth
     * AND
     * rental.end >= monthStart
     */
    const query = db('rentals')
      .join(
        'vehicles',
        'rentals.vehicle_id',
        'vehicles.id',
      )
      .where('rentals.start_date', '<', nextMonthStart)
      .where('rentals.end_date', '>=', monthStart)
      .whereNot(
        'rentals.status',
        'cancelled',
      )
      .select(
        'rentals.id',
        'rentals.vehicle_id',
        'rentals.start_date',
        'rentals.end_date',
        'vehicles.name',
        'vehicles.daily_rate',
      );

    if (vehicleId !== undefined) {
      query.where(
        'rentals.vehicle_id',
        vehicleId,
      );
    }

    const rentals = await query;

    const reports = new Map<number, VehicleReport>();

    for (const rental of rentals) {
      /*
       * Clamp rental dates to the requested month.
       *
       * Example:
       *
       * rental:
       * July 29 → August 3
       *
       * report month:
       * August 1 → August 31
       *
       * effective:
       * August 1 → August 3
       */
      const rentalStart = new Date(
        rental.start_date,
      );

      const rentalEnd = new Date(
        rental.end_date,
      );

      const effectiveStart =
        rentalStart < new Date(`${monthStart}T00:00:00Z`)
          ? new Date(`${monthStart}T00:00:00Z`)
          : rentalStart;

      const effectiveEnd =
        rentalEnd >=
        new Date(`${nextMonthStart}T00:00:00Z`)
          ? new Date(
              `${nextMonthStart}T00:00:00Z`,
            )
          : rentalEnd;

      /*
       * Difference in days.
       *
       * +1 because rental dates are inclusive.
       */
      const millisecondsPerDay =
        1000 * 60 * 60 * 24;

      const daysRented =
        Math.floor(
          (effectiveEnd.getTime() -
            effectiveStart.getTime()) /
            millisecondsPerDay,
        ) + 1;

      if (daysRented <= 0) {
        continue;
      }

      const revenue =
        Number(rental.daily_rate) *
        daysRented;

      const existing =
        reports.get(rental.vehicle_id);

      if (existing) {
        existing.total_bookings += 1;
        existing.days_rented += daysRented;
        existing.revenue += revenue;
      } else {
        reports.set(rental.vehicle_id, {
          id: rental.vehicle_id,
          name: rental.name,
          total_bookings: 1,
          days_rented: daysRented,
          revenue,
        });
      }
    }

    const vehicles = Array.from(
      reports.values(),
    );

    vehicles.sort(
      (a, b) => b.revenue - a.revenue,
    );

    const highestRevenueVehicle =
      vehicles.length > 0
        ? vehicles[0]
        : null;

    return {
      month,
      vehicles,
      highest_revenue_vehicle:
        highestRevenueVehicle,
    };
  }
}