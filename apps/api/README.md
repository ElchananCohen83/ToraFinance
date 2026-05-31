# ToraFinance API

NestJS backend for ToraFinance.

## Local Database

The local development database is PostgreSQL.

Connection string:

```text
postgresql://torafinance:torafinance_dev_password@localhost:5432/torafinance?schema=public
```

The recommended local setup is Docker Compose from the repository root:

```bash
npm run db:up
npm run db:migrate
npm --prefix apps/api run prisma:seed
```

If Docker is not installed, install PostgreSQL locally and create:

- database: `torafinance`
- user: `torafinance`
- password: `torafinance_dev_password`

Then keep the same `DATABASE_URL` in `apps/api/.env`.

## API Development

```bash
npm --prefix apps/api install
npm --prefix apps/api run prisma:generate
npm run dev:api
```

The API runs on:

```text
http://localhost:4000/api
```

Swagger documentation:

```text
http://localhost:4000/api/docs
```

## Current Modules

- `health`: service status
- `dashboard`: finance and operational summary
- `avrechim`: list and create avrech profiles
- `donors`: list and create donors
- `donations`: list and create donations or pledges

## Production Database

Use managed PostgreSQL:

- Azure: Azure Database for PostgreSQL Flexible Server
- AWS: Amazon RDS for PostgreSQL

Documents and uploaded files should not be stored in PostgreSQL. Store files in Azure Blob Storage or AWS S3, and keep only metadata and storage keys in the `Document` table.
