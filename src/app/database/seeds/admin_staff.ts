import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(
  knex: Knex,
): Promise<void> {


  const existingStaff = await knex('staff')
    .where({
      email: 'admin@example.com',
    })
    .first();

  if (existingStaff) {
    console.log('Admin already exists');
  } else {
    const password_hash =
      await bcrypt.hash('admin123', 10);

    await knex('staff').insert({
      email: 'admin@example.com',
      password_hash,
      name: 'Admin',
    });

    console.log(
      'Admin created successfully',
    );
  }



  let vehicle = await knex('vehicles')
    .where({
      plate_number: 'DHAKA-1234',
    })
    .whereNull('deleted_at')
    .first();

  if (vehicle) {
    console.log(
      'Default vehicle already exists',
    );
  } else {
    [vehicle] = await knex('vehicles')
      .insert({
        name: 'Toyota Axio',
        plate_number: 'DHAKA-1234',
        category: 'Sedan',
        daily_rate: 2500,
        photo_path: null,
      })
      .returning('*');

    console.log(
      'Default vehicle created successfully',
    );
  }



  if (!vehicle) {
    console.log(
      'Vehicle not available. Rental skipped.',
    );

    return;
  }

  const existingRental = await knex('rentals')
    .where({
      vehicle_id: vehicle.id,
      customer_phone: '01712345678',
    })
    .first();

  if (existingRental) {
    console.log(
      'Default rental already exists',
    );

    return;
  }

  const startDate = new Date(
    '2026-08-12',
  );

  const endDate = new Date(
    '2026-08-15',
  );

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const days =
    Math.floor(
      (endDate.getTime() -
        startDate.getTime()) /
        millisecondsPerDay,
    ) + 1;

  const totalAmount =
    Number(vehicle.daily_rate) * days;

  await knex('rentals').insert({
    vehicle_id: vehicle.id,
    customer_name: 'Rahim Ahmed',
    customer_phone: '01712345678',
    start_date: '2026-08-12',
    end_date: '2026-08-15',
    total_amount: totalAmount,
    status: 'booked',
  });

  console.log(
    'Default rental created successfully',
  );
}