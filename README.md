# ToraFinance

ToraFinance is a Hebrew-first, RTL web application for managing kollelim, avrechim, donors, donations, scholarships, receipts, documents, financial reports, and role-based operations.

## Current Implementation

This repository contains the first production-oriented frontend foundation:

- Next.js 16 with TypeScript
- Tailwind CSS with full RTL layout
- Responsive management dashboard
- Hebrew UI for finance, scholarships, donors, receipts, documents, alerts, and permissions
- Modular UI structure ready for domain-driven screens and API integration
- NestJS API foundation under `apps/api`
- Prisma schema for PostgreSQL
- Local PostgreSQL setup through Docker Compose

## Planned Production Architecture

Recommended target stack:

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: NestJS
- Database: PostgreSQL
- Storage: Azure Blob Storage or S3
- Authentication: JWT access tokens, refresh tokens, 2FA, RBAC
- Observability: structured logging, audit logs, error tracking, health checks
- Documentation: Swagger/OpenAPI for all backend endpoints

## Core Modules

- Avrechim management: profile, family data, tracks, attendance, documents, eligibility
- Scholarships: monthly cycles, bonuses, deductions, bank files, payment locks
- Donors and donations: pledges, standing orders, campaigns, receipts, reminders
- Accounting: income, expenses, bank reconciliation, budgets, cash flow exports
- Documents: typed uploads, entity links, viewer permissions, expiration alerts
- Reports: donations, scholarships, debt, donor segmentation, monthly activity
- Security: roles, sessions, blocked users, audit trail, per-module permissions
- Personal areas: avrech portal and donor portal

## Local Development

Install frontend dependencies:

```bash
npm install
```

Install API dependencies:

```bash
npm --prefix apps/api install
npm --prefix apps/api run prisma:generate
```

Start PostgreSQL locally:

```bash
npm run db:up
npm run db:migrate
npm --prefix apps/api run prisma:seed
```

Start the apps:

```bash
npm run dev:web
npm run dev:api
```

Frontend:

```text
http://localhost:3000
```

API:

```text
http://localhost:4000/api
```

Swagger:

```text
http://localhost:4000/api/docs
```

## Database Location

Local development stores PostgreSQL data in the Docker volume `postgres_data`, defined in `docker-compose.yml`.

Production should use managed PostgreSQL:

- Azure Database for PostgreSQL Flexible Server
- Amazon RDS for PostgreSQL

Uploaded documents should be stored in Azure Blob Storage or AWS S3. PostgreSQL stores metadata only.

## Suggested Next Milestones

1. Add authentication screens and RBAC route guards.
2. Add JWT access tokens, refresh tokens, password hashing, and 2FA.
3. Replace dashboard mock data with API-backed repositories and DTOs.
4. Add bank export, receipt generation, and audit-log persistence.
5. Add document upload to S3 or Azure Blob Storage.
6. Add unit tests, API contract tests, and CI build checks.
