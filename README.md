# ToraFinance

ToraFinance is a Hebrew-first, RTL web application for managing kollelim, avrechim, donors, donations, scholarships, receipts, documents, financial reports, and role-based operations.

## Current Implementation

This repository contains the first production-oriented frontend foundation:

- Next.js 14 with TypeScript
- Tailwind CSS with full RTL layout
- Responsive management dashboard
- Hebrew UI for finance, scholarships, donors, receipts, documents, alerts, and permissions
- Modular UI structure ready for domain-driven screens and API integration

## Planned Production Architecture

Recommended target stack:

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: ASP.NET Core 8 Web API or NestJS
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

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Suggested Next Milestones

1. Add authentication screens and RBAC route guards.
2. Create PostgreSQL schema and backend modules for avrechim, donors, scholarships, receipts, and documents.
3. Replace dashboard mock data with API-backed repositories and DTOs.
4. Add bank export, receipt generation, and audit-log persistence.
5. Add unit tests, API contract tests, and CI build checks.
