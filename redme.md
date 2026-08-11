# Vehicle Rental API

A RESTful vehicle rental management API built with **Node.js, Express, TypeScript, PostgreSQL, Knex.js, Redis, Cloudinary, JWT, and Joi**.

The system provides authentication, vehicle management, rental management, image uploads, availability checking, monthly rental reports, and Redis-based rate limiting.

## Features

* JWT-based staff authentication
* Staff/admin management
* Vehicle CRUD operations
* Vehicle image upload using Cloudinary
* Vehicle soft deletion
* Rental CRUD operations
* Rental date-overlap validation
* Transaction-based rental creation
* Row locking to prevent concurrent double bookings
* Automatic rental total calculation
* Monthly rental reports
* Highest-revenue vehicle reporting
* Redis rate limiting
* Automatic database seeding
* PostgreSQL migrations
* Request validation using Joi

## Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Knex.js
* Redis
* Cloudinary
* JWT
* Joi
* bcrypt

## Project Structure

```text
job360ict/
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── redis.ts
│   │   │
│   │   ├── database/
│   │   │   ├── knex.ts
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── seed.ts
│   │   │
│   │   ├── helpers/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── rentals/
│   │   │   ├── report/
│   │   │   └── vehicels/
│   │   ├── routes/
│   │   └── types/
│   │
│   ├── app.ts
│   └── server.ts
│
├── knexfile.ts
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

## Requirements

Make sure the following are installed:

* Node.js 20+
* PostgreSQL
* Redis
* npm

Cloudinary credentials are also required for vehicle image uploads.

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd job360ict
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_NAME=job360ict

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

REDIS_HOST=localhost
REDIS_PORT=6379

RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60
```

A `.env.example` file is included in the repository as a template.

## Database Setup

Create the PostgreSQL database first:

```sql
CREATE DATABASE job360ict;
```

Run all migrations:

```bash
npm run migrate
```

The migration files create the required database schema.

## Seeding

The application automatically creates the default data when the server starts.

The seed creates:

* Default admin account
* Default vehicle
* Default rental

The default admin credentials are:

```text
Email: admin@example.com
Password: admin123
```

For production environments, these credentials should be changed.

## Running the Application

Development:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

## Authentication

Login through the authentication endpoint to receive a JWT.

The token should be sent with protected requests:

```http
Authorization: Bearer <token>
```

Protected resources require a valid authentication token.

## Vehicle Management

Vehicle endpoints allow authenticated staff to:

* Create vehicles
* List vehicles
* View a vehicle
* Update vehicles
* Delete vehicles
* Upload vehicle images

Vehicle images are stored using Cloudinary rather than storing the actual image files in PostgreSQL.

## Rental Management

Rental endpoints allow staff to:

* Create rentals
* List rentals
* View a rental
* Update rentals
* Delete rentals
* Filter rentals by vehicle, status, and date

When a rental is created, the system calculates:

```text
total_amount = daily_rate × rental_days
```

## Rental Availability

A vehicle cannot have overlapping active rentals.

The overlap condition is:

```text
existing.start_date <= requested.end_date
AND
existing.end_date >= requested.start_date
```

Cancelled rentals are excluded from the availability check.

Rental creation is performed inside a database transaction and locks the vehicle row before checking availability.

This prevents two concurrent requests from successfully booking the same vehicle for overlapping dates.

## Monthly Rental Reports

The report endpoint is:

```http
GET /reports/rentals?month=YYYY-MM
```

An optional vehicle filter can be supplied:

```http
GET /reports/rentals?month=2026-08&vehicle_id=1
```

The report provides, per vehicle:

```text
id
name
total_bookings
days_rented
revenue
```

It also returns the vehicle with the highest revenue for the requested month.

### Partial-Month Rentals

Reports only count the portion of a rental that falls inside the requested month.

For example:

```text
Rental:
July 29 → August 3
```

The August report counts:

```text
August 1
August 2
August 3
```

Therefore:

```text
days_rented = 3
```

rather than counting the entire rental duration.

Revenue is calculated using only those days:

```text
monthly_revenue = daily_rate × days_in_requested_month
```

This ensures that rentals spanning two months are correctly split between the relevant reports.

## Rate Limiting

Redis is used for request rate limiting.

The rate limit is applied using the authenticated staff identity.

Example configuration:

```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60
```

If Redis becomes unavailable, authentication is not rejected solely because the rate-limit service failed. The Redis check fails open so that a Redis outage does not bring down authentication.

## API Validation

Incoming requests are validated using Joi.

Invalid requests return a `400 Bad Request` response containing validation errors.

## Error Handling

The application uses centralized error handling for API errors.

Common responses include:

```text
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
500 Internal Server Error
```

A `409 Conflict` is returned when a requested rental overlaps with an existing active rental.

## Database Migrations

Create a new migration:

```bash
npx knex migrate:make migration_name
```

Run migrations:

```bash
npm run migrate
```

Rollback the latest migration:

```bash
npm run migrate:rollback
```

The Knex configuration is located at the project root:

```text
knexfile.ts
```

while migrations and seeds remain under:

```text
src/app/database/
```

## Important NPM Scripts

```bash
npm run start:dev
npm run migrate
npm run migrate:rollback
```

## Clean Database Setup

For a fresh database:

```bash
npm install
```

Create the PostgreSQL database, configure `.env`, then run:

```bash
npm run migrate
npm run start:dev
```

The application will initialize the required default seed data.

## Security

The following files and values should never be committed:

```text
.env
node_modules/
dist/
```

Secrets such as:

* Database passwords
* JWT secrets
* Cloudinary API credentials

must be supplied through environment variables.

## Review Notes

Two important implementation details are worth highlighting during review.

### Rental Overlap

The availability query checks whether an existing rental satisfies:

```text
existing.start_date <= requested.end_date
AND
existing.end_date >= requested.start_date
```

This correctly identifies all overlapping date ranges.

### Concurrent Booking Protection

Rental creation uses a database transaction and locks the vehicle row before checking availability and inserting the rental.

This prevents concurrent requests from both passing the availability check and creating conflicting rentals.

## License

This project was created as a technical assessment/submission project.
